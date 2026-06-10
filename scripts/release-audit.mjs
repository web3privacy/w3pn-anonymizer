#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const PRODUCTION_URL = 'https://anonymizer.web3privacy.info'
const ROOT = process.cwd()

const failures = []
const warnings = []
const passes = []

function pass(message) {
  passes.push(message)
  console.log(`✓ ${message}`)
}

function warn(message) {
  warnings.push(message)
  console.warn(`! ${message}`)
}

function fail(message) {
  failures.push(message)
  console.error(`✗ ${message}`)
}

function read(path) {
  return readFileSync(join(ROOT, path), 'utf8')
}

function readJson(path) {
  return JSON.parse(read(path))
}

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

function checkIncludes(label, content, expected) {
  if (content.includes(expected)) pass(label)
  else fail(`${label}: missing ${expected}`)
}

const indexHtml = read('index.html')
const robots = read('public/robots.txt')
const sitemap = read('public/sitemap.xml')

checkIncludes('index canonical target', indexHtml, `<link rel="canonical" href="${PRODUCTION_URL}"`)
checkIncludes('index Open Graph target', indexHtml, `<meta property="og:url" content="${PRODUCTION_URL}"`)
checkIncludes('index JSON-LD target', indexHtml, `"url": "${PRODUCTION_URL}"`)
checkIncludes('robots sitemap target', robots, `Sitemap: ${PRODUCTION_URL}/sitemap.xml`)
checkIncludes('sitemap location target', sitemap, `<loc>${PRODUCTION_URL}</loc>`)

const releaseText = `${indexHtml}\n${robots}\n${sitemap}`
if (/promptstudio3000|anonymizer\.promptstudio/i.test(releaseText)) {
  fail('source metadata contains promptstudio domain reference')
} else {
  pass('source metadata has no promptstudio domain references')
}

if (existsSync(join(ROOT, 'dist/index.html'))) {
  const distIndex = read('dist/index.html')
  const refs = [...distIndex.matchAll(/(?:src|href)="\.\/(assets\/[^"]+)"/g)].map((match) => `dist/${match[1]}`)
  const missing = refs.filter((path) => !existsSync(join(ROOT, path)))
  if (missing.length > 0) {
    fail(`dist/index.html references missing asset(s): ${missing.join(', ')}`)
  } else {
    pass(`dist/index.html asset references exist (${refs.length})`)
  }

  const tracked = new Set(git(['ls-files', 'dist/assets']).split('\n').filter(Boolean))
  const ignoredUntracked = refs.filter((path) => !tracked.has(path) && git(['check-ignore', path]))
  if (ignoredUntracked.length > 0) {
    warn(`dist/index.html references ignored untracked build asset(s): ${ignoredUntracked.join(', ')}`)
  } else {
    pass('dist/index.html references tracked or unignored assets')
  }
} else {
  warn('dist/index.html is absent; run npm run build before static artifact checks')
}

async function auditCustomImagePresets() {
  const failuresBefore = failures.length
  const registryPath = 'src/lib/custom-image-presets.ts'
  const typesPath = 'src/types.ts'
  const registry = read(registryPath)
  const types = read(typesPath)
  const presetBlocks = [...registry.matchAll(/\{\s*id:\s*'([^']+)'[\s\S]*?folder:\s*'([^']+)'[\s\S]*?label:\s*'([^']+)'[\s\S]*?\}/g)]
  const defaultPresetId = registry.match(/DEFAULT_CUSTOM_IMAGE_PRESET_ID[^=]*=\s*'([^']+)'/)?.[1]
  const presets = presetBlocks.map((match) => ({
    id: match[1],
    folder: match[2],
    label: match[3],
  }))

  if (presets.length === 0) {
    fail('custom image preset registry has no parseable entries')
    return
  }

  const ids = new Set()
  const folders = new Set()
  for (const preset of presets) {
    if (ids.has(preset.id)) fail(`custom image preset registry has duplicate id: ${preset.id}`)
    ids.add(preset.id)
    if (folders.has(preset.folder)) fail(`custom image preset registry has duplicate folder: ${preset.folder}`)
    folders.add(preset.folder)
    if (!types.includes(`| '${preset.id}'`)) fail(`CustomImageSource is missing preset id: ${preset.id}`)
  }
  if (ids.size === presets.length && folders.size === presets.length) {
    pass(`custom image preset registry is unique (${presets.length})`)
  }
  if (!defaultPresetId) fail('custom image preset registry is missing DEFAULT_CUSTOM_IMAGE_PRESET_ID')
  else if (!ids.has(defaultPresetId)) fail(`DEFAULT_CUSTOM_IMAGE_PRESET_ID is not registered: ${defaultPresetId}`)
  else pass(`custom image default preset is registered (${defaultPresetId})`)

  const publicPresetRoot = join(ROOT, 'public/custom-images')
  const publicFolders = existsSync(publicPresetRoot)
    ? readdirSync(publicPresetRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
    : []

  for (const folder of publicFolders) {
    if (!folders.has(folder)) warn(`public/custom-images/${folder} is not registered in ${registryPath}`)
  }

  let checkedImages = 0
  for (const preset of presets) {
    const base = `public/custom-images/${preset.folder}`
    const manifestPath = `${base}/manifest.json`
    if (!existsSync(join(ROOT, manifestPath))) {
      fail(`custom image preset ${preset.id} is missing ${manifestPath}`)
      continue
    }

    let manifest
    try {
      manifest = readJson(manifestPath)
    } catch (err) {
      fail(`${manifestPath} is not valid JSON: ${err.message}`)
      continue
    }

    if (manifest.name !== preset.folder) fail(`${manifestPath} name "${manifest.name}" does not match folder "${preset.folder}"`)
    if (!Number.isInteger(manifest.count) || manifest.count <= 0) fail(`${manifestPath} count must be a positive integer`)
    if (!Number.isInteger(manifest.size) || manifest.size <= 0) fail(`${manifestPath} size must be a positive integer`)
    if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
      fail(`${manifestPath} files must be a non-empty array`)
      continue
    }
    if (manifest.count !== manifest.files.length) fail(`${manifestPath} count ${manifest.count} does not match files length ${manifest.files.length}`)

    const seenFiles = new Set()
    for (const file of manifest.files) {
      if (typeof file !== 'string' || !/^[a-z0-9-]+-\d{3}\.png$/i.test(file)) {
        fail(`${manifestPath} contains invalid preset filename: ${String(file)}`)
        continue
      }
      if (seenFiles.has(file)) {
        fail(`${manifestPath} contains duplicate file: ${file}`)
        continue
      }
      seenFiles.add(file)

      const imagePath = `${base}/${file}`
      const absImagePath = join(ROOT, imagePath)
      if (!existsSync(absImagePath)) {
        fail(`${manifestPath} references missing image: ${file}`)
        continue
      }

      try {
        const metadata = await sharp(absImagePath).metadata()
        if (metadata.format !== 'png') fail(`${imagePath} is ${metadata.format ?? 'unknown'} instead of png`)
        if (metadata.width !== manifest.size || metadata.height !== manifest.size) {
          fail(`${imagePath} is ${metadata.width}x${metadata.height}, expected ${manifest.size}x${manifest.size}`)
        }
        checkedImages += 1
      } catch (err) {
        fail(`${imagePath} could not be read as an image: ${err.message}`)
      }
    }

    const folderPngs = readdirSync(join(ROOT, base)).filter((file) => file.toLowerCase().endsWith('.png')).sort()
    const manifestFileSet = new Set(manifest.files)
    const orphanPngs = folderPngs.filter((file) => !manifestFileSet.has(file))
    if (orphanPngs.length > 0) warn(`${base} contains PNG files not listed in manifest: ${orphanPngs.join(', ')}`)
  }

  if (failures.length === failuresBefore) {
    pass(`custom image preset manifests and PNGs are valid (${checkedImages} images checked)`)
  }
}

await auditCustomImagePresets()

console.log(`\nRelease audit: ${passes.length} passed, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}, ${failures.length} failed`)
if (failures.length > 0) process.exit(1)
