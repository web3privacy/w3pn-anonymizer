import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

const HOMEBREW_NODE_22 = '/opt/homebrew/opt/node@22/bin'
const HOMEBREW_JDK_21 = '/opt/homebrew/opt/openjdk@21'
const HOMEBREW_JAVA_HOME = `${HOMEBREW_JDK_21}/libexec/openjdk.jdk/Contents/Home`

function withNativeEnv() {
  const pathParts = []
  if (existsSync(HOMEBREW_JDK_21)) pathParts.push(`${HOMEBREW_JDK_21}/bin`)
  if (existsSync(HOMEBREW_NODE_22)) pathParts.push(HOMEBREW_NODE_22)
  pathParts.push(process.env.PATH ?? '')

  return {
    ...process.env,
    ...(existsSync(HOMEBREW_JAVA_HOME) ? { JAVA_HOME: HOMEBREW_JAVA_HOME } : {}),
    PATH: pathParts.join(':'),
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    env: withNativeEnv(),
    stdio: 'inherit',
  })

  if (result.error) {
    console.error(result.error.message)
    process.exit(1)
  }

  process.exitCode = result.status ?? 1
  if (process.exitCode !== 0) process.exit(process.exitCode)
}

function runOrExit(command, args, options = {}) {
  run(command, args, options)
  if (process.exitCode && process.exitCode !== 0) process.exit(process.exitCode)
}

function printCheck(label, command, args) {
  console.log(`\n# ${label}`)
  const result = spawnSync(command, args, {
    cwd: root,
    env: withNativeEnv(),
    encoding: 'utf8',
  })

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
  if (output) console.log(output)
  if (result.error) console.log(result.error.message)
  if (result.status !== 0 && !result.error) console.log(`Exited with status ${result.status}`)
}

const task = process.argv[2]
const iosDerivedDataPath = resolve(process.env.HOME ?? root, 'Library/Developer/Xcode/DerivedData/W3PNAnonymizerCodex')
const iosDeviceAppPath = resolve(iosDerivedDataPath, 'Build/Products/Debug-iphoneos/App.app')
const iosReleaseDir = resolve(root, 'release/ios')
const iosPayloadDir = resolve(iosReleaseDir, 'Payload')
const iosIpaPath = resolve(iosReleaseDir, 'W3PN-Anonymizer-debug.ipa')
const iosVendorPath = resolve(root, 'ios/App/CapApp-SPM/Vendor')

function cleanIosSigningMetadata() {
  if (!existsSync(iosVendorPath)) return

  const result = spawnSync('xattr', ['-cr', iosVendorPath], {
    cwd: root,
    env: withNativeEnv(),
    stdio: 'inherit',
  })

  if (result.error) {
    console.warn(`Could not clean iOS xattrs: ${result.error.message}`)
  } else if (result.status !== 0) {
    console.warn(`Could not clean iOS xattrs: xattr exited with status ${result.status}`)
  }
}

function buildIosDevice() {
  rmSync(iosDerivedDataPath, { recursive: true, force: true })
  cleanIosSigningMetadata()
  runOrExit('xcodebuild', [
    '-project',
    'ios/App/App.xcodeproj',
    '-scheme',
    'App',
    '-configuration',
    'Debug',
    '-sdk',
    'iphoneos',
    '-destination',
    'generic/platform=iOS',
    '-derivedDataPath',
    iosDerivedDataPath,
    '-skipPackageUpdates',
    '-allowProvisioningUpdates',
    'build',
  ])
}

function packageIosDebugIpa() {
  if (!existsSync(iosDeviceAppPath)) buildIosDevice()

  rmSync(iosPayloadDir, { recursive: true, force: true })
  rmSync(iosIpaPath, { force: true })
  mkdirSync(iosPayloadDir, { recursive: true })
  cpSync(iosDeviceAppPath, resolve(iosPayloadDir, 'App.app'), { recursive: true })
  runOrExit('zip', ['-qry', iosIpaPath, 'Payload'], { cwd: iosReleaseDir })
  rmSync(iosPayloadDir, { recursive: true, force: true })
  console.log(`Created ${iosIpaPath}`)
}

switch (task) {
  case 'android-debug':
    run('./gradlew', ['assembleDebug'], { cwd: resolve(root, 'android') })
    break
  case 'ios-simulator':
    run('xcodebuild', [
      '-project',
      'ios/App/App.xcodeproj',
      '-scheme',
      'App',
      '-configuration',
      'Debug',
      '-sdk',
      'iphonesimulator',
      '-destination',
      'generic/platform=iOS Simulator',
      '-skipPackageUpdates',
      'CODE_SIGNING_ALLOWED=NO',
      'build',
    ])
    break
  case 'ios-device':
    buildIosDevice()
    break
  case 'ios-debug-ipa':
    buildIosDevice()
    packageIosDebugIpa()
    break
  case 'doctor':
    printCheck('Node', 'node', ['--version'])
    printCheck('npm', 'npm', ['--version'])
    printCheck('Java', 'java', ['-version'])
    printCheck('Xcode', 'xcodebuild', ['-version'])
    break
  default:
    console.error('Usage: node scripts/run-native-command.mjs <doctor|ios-simulator|ios-device|ios-debug-ipa|android-debug>')
    process.exit(1)
}
