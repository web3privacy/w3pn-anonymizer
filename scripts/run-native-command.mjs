import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { nativeEnvironment, inspectNativeEnvironment } from './native-environment.mjs'

const root = resolve(import.meta.dirname, '..')

const withNativeEnv = () => nativeEnvironment()

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    env: withNativeEnv(),
    stdio: 'inherit',
    ...(options.shell ? { shell: true } : {}),
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

const task = process.argv[2]
const iosDerivedDataPath = resolve(root, process.env.NATIVE_DERIVED_DATA_DIR || 'release/ios/DerivedData')
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
    run(process.platform === 'win32' ? 'gradlew.bat' : './gradlew', ['assembleDebug'], { cwd: resolve(root, 'android'), ...(process.platform === 'win32' ? { shell: true } : {}) })
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
      '-derivedDataPath',
      resolve(root, process.env.NATIVE_DERIVED_DATA_DIR || 'release/ios-simulator/DerivedData'),
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
  case 'doctor': {
    const target = process.argv.slice(3).find(arg => ['all', 'ios', 'android'].includes(arg)) ?? 'all'
    const report = inspectNativeEnvironment(target)
    if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
    else {
      for (const check of report.checks) console.log(`${check.ok ? 'OK' : 'MISSING'} ${check.name}\n${check.detail}\n`)
      console.log(report.ready ? 'Native environment ready.' : 'Complete the missing tools before native builds.')
    }
    process.exitCode = report.ready ? 0 : 1
    break
  }
  default:
    console.error('Usage: node scripts/run-native-command.mjs <doctor|ios-simulator|ios-device|ios-debug-ipa|android-debug>')
    process.exit(1)
}
