import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve, join } from 'node:path'
import { spawnSync } from 'node:child_process'

export function nativeEnvironment(env = process.env, platform = process.platform) {
  const userHome = env.HOME || env.USERPROFILE || homedir()
  const javaHomes = [
    env.JAVA_HOME,
    platform === 'darwin' ? join(userHome, 'Library', 'Java', 'JavaVirtualMachines', 'temurin-21.jdk', 'Contents', 'Home') : undefined,
    platform === 'darwin' ? '/Applications/Android Studio.app/Contents/jbr/Contents/Home' : undefined,
    platform === 'win32' && env.ProgramFiles ? join(env.ProgramFiles, 'Android', 'Android Studio', 'jbr') : undefined,
    platform === 'darwin' ? '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home' : undefined,
    platform === 'darwin' ? '/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home' : undefined,
  ]
  const javaHome = javaHomes.find(p => p && existsSync(join(p, 'bin', platform === 'win32' ? 'java.exe' : 'java')))
  const localProperties = resolve(import.meta.dirname, '../android/local.properties')
  const localSdk = existsSync(localProperties)
    ? readFileSync(localProperties, 'utf8').match(/^sdk\.dir\s*=\s*(.+)$/m)?.[1]?.trim().replace(/\\([\\ :])/g, '$1') : undefined
  const defaultSdk = platform === 'darwin' ? join(userHome, 'Library', 'Android', 'sdk')
    : platform === 'win32' ? join(env.LOCALAPPDATA || join(userHome, 'AppData', 'Local'), 'Android', 'Sdk')
      : join(userHome, 'Android', 'Sdk')
  const sdkRoot = env.ANDROID_SDK_ROOT || env.ANDROID_HOME || localSdk || defaultSdk
  const separator = platform === 'win32' ? ';' : ':'
  const paths = [javaHome && join(javaHome, 'bin'), join(sdkRoot, 'platform-tools'),
    platform === 'darwin' && '/opt/homebrew/opt/node@22/bin', env.PATH || ''].filter(Boolean)
  return { ...env, ...(javaHome ? { JAVA_HOME: javaHome } : {}),
    ANDROID_HOME: sdkRoot, ANDROID_SDK_ROOT: sdkRoot, PATH: paths.join(separator) }
}

export function inspectNativeEnvironment(target = 'all') {
  if (!['all', 'ios', 'android'].includes(target)) throw new Error('Expected all, ios, or android.')
  const env = nativeEnvironment()
  const checks = []
  const command = (name, executable, args, validate = () => true) => {
    const windowsNpm = process.platform === 'win32' && executable === 'npm'
    const result = spawnSync(windowsNpm ? 'npm.cmd' : executable, args, {
      env, encoding: 'utf8', timeout: 20000, ...(windowsNpm ? { shell: true } : {}),
    })
    const output = `${result.stdout || ''}${result.stderr || ''}`.trim()
    const ok = !result.error && result.status === 0 && validate(output)
    checks.push({ name, ok, detail: (result.error?.message || output || `exit ${result.status}`).split('\n').slice(0, 3).join('\n') })
  }
  command('Node 22+', 'node', ['--version'], output => Number(output.match(/v(\d+)/)?.[1]) >= 22)
  command('npm', 'npm', ['--version'])
  if (target !== 'ios') {
    // Capacitor uses Java 21 source; the pinned Gradle 8.11.1 can run on Java through 23.
    command('Java 21–23 (Gradle 8.11.1)', 'java', ['-version'], output => {
      const major = Number(output.match(/(?:openjdk|java) version "(\d+)/)?.[1])
      return major >= 21 && major <= 23
    })
    const variables = readFileSync(resolve(import.meta.dirname, '../android/variables.gradle'), 'utf8')
    const api = variables.match(/compileSdkVersion\s*=\s*(\d+)/)?.[1]
    const sdkRoot = env.ANDROID_SDK_ROOT
    for (const [name, path] of [
      ['Android SDK', sdkRoot],
      [`Android platform ${api}`, join(sdkRoot, 'platforms', `android-${api}`, 'android.jar')],
      ['Android build-tools 35.0.0', join(sdkRoot, 'build-tools', '35.0.0', process.platform === 'win32' ? 'aapt2.exe' : 'aapt2')],
      ['Android platform-tools', join(sdkRoot, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb')],
    ]) checks.push({ name, ok: existsSync(path), detail: path })
  }
  if (target !== 'android') {
    if (process.platform !== 'darwin') checks.push({ name: 'macOS for iOS', ok: false, detail: 'iOS needs a macOS host with Xcode.' })
    else {
      command('Xcode', 'xcodebuild', ['-version'])
      command('iOS simulator', 'xcrun', ['simctl', 'list', 'runtimes', '-j'], output => {
        try { return JSON.parse(output).runtimes.some(r => r.identifier?.includes('iOS') && r.isAvailable) } catch { return false }
      })
    }
  }
  return { target, ready: checks.every(c => c.ok), checks }
}
