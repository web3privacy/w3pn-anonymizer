import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { resolve, relative, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const label = process.argv[2]
if (!label || !/^\d{4}-\d{2}-\d{2}(?:-[a-z0-9]+)?$/.test(label)) throw new Error('Provide a release label such as 2026-09-30.')
const out = resolve(root, 'release/github', label)
const destination = resolve(out, 'w3pn-anonymizer')
if (existsSync(destination)) throw new Error(`Export already exists: ${destination}`)
mkdirSync(destination, { recursive: true })

const folders = ['src', 'public', 'scripts', 'server', 'deploy', 'electron', 'android', 'ios', 'docs']
const rootFiles = ['.gitignore', '.eslintrc.cjs', 'LICENSE', 'README.md', 'ROADMAP.md', 'Agent-Codex.md', 'capacitor.config.ts', 'index.html', 'package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.node.json', 'vercel.json', 'vite.config.ts', 'vitest.config.ts']
const forbiddenFolders = new Set(['.git', 'node_modules', '.gradle', '.idea', 'build', 'Vendor', 'xcuserdata', '__pycache__', '.venv'])
const forbiddenPaths = ['ios/App/App/public/', 'android/app/src/main/assets/public/', 'ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/']
const manifest = []

function copy(path) {
  const source = resolve(root, path)
  if (!existsSync(source)) return
  const info = statSync(source)
  const normalized = path.replaceAll('\\', '/')
  if (normalized.split('/').some(part => forbiddenFolders.has(part))) return
  if (forbiddenPaths.some(prefix => `${normalized}/`.startsWith(prefix))) return
  if (info.isDirectory()) {
    for (const item of readdirSync(source, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (item.isSymbolicLink()) throw new Error(`Do not export symlinks: ${path}/${item.name}`)
      copy(`${path}/${item.name}`)
    }
    return
  }
  if (/(^|\/)(\.env(?:\..*)?|local\.properties|\.DS_Store|Package\.resolved)$/.test(normalized)) return
  if (/\.(jks|keystore|pem|p12|mobileprovision|pyc|tsbuildinfo)$/.test(normalized)) return
  // Keep project documentation; machine logs, screenshots and local environment inventories stay private.
  if (normalized.startsWith('docs/') && !normalized.endsWith('.md')) return
  if (info.size > 100 * 1024 * 1024) throw new Error(`GitHub file limit exceeded: ${path}`)
  const bytes = readFileSync(source)
  if (/BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(bytes.toString('utf8'))) throw new Error(`Private key detected: ${path}`)
  const target = resolve(destination, path)
  mkdirSync(dirname(target), { recursive: true })
  cpSync(source, target)
  manifest.push({ path: relative(destination, target), size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })
}

for (const path of [...rootFiles, ...folders]) copy(path)
writeFileSync(resolve(destination, 'SOURCE-MANIFEST.json'), JSON.stringify({ label, files: manifest }, null, 2) + '\n')
writeFileSync(resolve(destination, 'SOURCE-PACK.md'), `# Source snapshot ${label}\n\nThis archive contains project sources, native wrappers, lockfiles and the public runtime assets needed by the static app. Generated dist/native copies, SDKs, signing keys, local configuration, backups, test logs and screenshots are excluded. Source code is MIT; bundled third-party assets retain their separate licenses. Model/media provenance work for store/F-Droid distribution is still pending; see docs/MOBILE-RELEASE-PLAN-2026-09-30.md.\n\nUse Node 22, run npm ci and npm run build. Mobile assets and local iOS frameworks are generated with npm run ios:sync or npm run android:sync. Exact physical-device steps are in docs/ios-startup-2026-09-30/DEVICE-SETUP.md.\n\nHistorical documentation references local test evidence that is deliberately not included in this source archive.\n`)
const zip = resolve(out, `w3pn-anonymizer-source-${label}.zip`)
execFileSync('zip', ['-qr', zip, 'w3pn-anonymizer'], { cwd: out })
const sha256 = createHash('sha256').update(readFileSync(zip)).digest('hex')
writeFileSync(`${zip}.sha256`, `${sha256}  ${zip.split('/').at(-1)}\n`)
console.log(JSON.stringify({ zip, sha256, files: manifest.length, bytes: statSync(zip).size }, null, 2))
