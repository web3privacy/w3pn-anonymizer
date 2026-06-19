import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')
const iosPublicDir = resolve(root, 'ios/App/App/public')
const iosConfigPath = resolve(root, 'ios/App/App/capacitor.config.json')

if (!existsSync(resolve(distDir, 'index.html'))) {
  throw new Error('Missing dist/index.html. Run npm run build before syncing iOS.')
}

mkdirSync(iosPublicDir, { recursive: true })
rmSync(iosPublicDir, { recursive: true, force: true })
cpSync(distDir, iosPublicDir, { recursive: true })

writeFileSync(
  iosConfigPath,
  `${JSON.stringify(
    {
      appId: 'info.web3privacy.anonymizer',
      appName: 'W3PN Anonymizer',
      webDir: 'public',
      bundledWebRuntime: false,
      ios: {
        contentInset: 'automatic',
      },
    },
    null,
    2,
  )}\n`,
)

console.log(`Synced ${distDir} -> ${iosPublicDir}`)
