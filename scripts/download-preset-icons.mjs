#!/usr/bin/env node
/**
 * Downloads + normalizes preset avatar libraries for offline bundling.
 *
 * Sets:
 *  - human/         randomuser.me portraits
 *  - abstract/      DiceBear shapes
 *  - punks/         Larva Labs CryptoPunks
 *  - aavegotchi/    Top BRS Aavegotchis (Goldsky on-chain SVG → PNG)
 *  - celebrities/   Wikimedia Commons portrait photos (CC-licensed)
 *
 * All images → square PNG, max 256×256 (scripts/lib/normalize-image.mjs).
 *
 * Usage:
 *   node scripts/download-preset-icons.mjs
 *   node scripts/download-preset-icons.mjs --count=100
 *   node scripts/download-preset-icons.mjs --only=aavegotchi,celebrities
 *   node scripts/download-preset-icons.mjs --normalize-existing
 */
import { mkdirSync, writeFileSync, rmSync, readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import { normalizePresetImage, PRESET_IMAGE_SIZE } from './lib/normalize-image.mjs'
import { CELEBRITY_NAMES } from './lib/celebrity-names.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'custom-images')

const args = process.argv.slice(2)
const COUNT = Number(args.find((a) => a.startsWith('--count='))?.split('=')[1] ?? 100)
const ONLY = args.find((a) => a.startsWith('--only='))?.split('=')[1]?.split(',').filter(Boolean)
const NORMALIZE_EXISTING = args.includes('--normalize-existing')

const USER_AGENT = 'w3pn-anonymizer/1.0 (offline avatar presets; web3privacynow@protonmail.com)'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const GOLDSKY_CORE = 'https://api.goldsky.com/api/public/project_cmh3flagm0001r4p25foufjtt/subgraphs/aavegotchi-core-matic/prod/gn'
const GOLDSKY_SVG = 'https://api.goldsky.com/api/public/project_cmh3flagm0001r4p25foufjtt/subgraphs/aavegotchi-svg-matic/prod/gn'

async function fetchBuffer(url, retries = 4) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': USER_AGENT },
      })
      if (res.status === 429) {
        await sleep(2000 * (i + 1))
        throw new Error(`HTTP 429`)
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 120) throw new Error('Response too small')
      return buf
    } catch (err) {
      if (i === retries - 1) throw err
      await sleep(800 * (i + 1))
    }
  }
  throw new Error('unreachable')
}

async function fetchWikipediaPortrait(name) {
  const title = encodeURIComponent(name.trim().replace(/ /g, '_'))
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  })
  if (res.status === 429) throw new Error('Wikipedia HTTP 429')
  if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status}`)
  const json = await res.json()
  const urls = [json.originalimage?.source, json.thumbnail?.source].filter(Boolean)
  if (!urls.length) throw new Error(`No Wikipedia image for ${name}`)
  let lastErr
  for (const url of urls) {
    try {
      return await fetchBuffer(url)
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

async function fetchWikimediaPortrait(name) {
  try {
    return await fetchWikipediaPortrait(name)
  } catch {
    /* fall through to Commons search */
  }
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: `${name} portrait`,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|mime|size|thumbmime',
    iiurlwidth: String(PRESET_IMAGE_SIZE * 2),
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (res.status === 429) throw new Error('Wikimedia HTTP 429')
  if (!res.ok) throw new Error(`Wikimedia HTTP ${res.status}`)
  const json = await res.json()
  const pages = Object.values(json.query?.pages ?? {})
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    if (!info) continue
    const mime = info.thumbmime || info.mime || ''
    if (!mime.startsWith('image/')) continue
    if (mime.includes('svg')) continue
    const url = info.thumburl || info.url
    if (!url) continue
    return fetchBuffer(url)
  }
  throw new Error(`No portrait for ${name}`)
}

async function gql(url, query) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

async function fetchTopAavegotchiIds(limit) {
  const query = `{ aavegotchis(first: ${limit + 30}, orderBy: baseRarityScore, orderDirection: desc) { id baseRarityScore } }`
  const data = await gql(GOLDSKY_CORE, query)
  return (data?.aavegotchis ?? []).map((g) => String(g.id))
}

/** On-chain SVG includes a full-canvas gotchi-bg layer (white/collateral fill). Strip it for alpha PNG. */
function stripGotchiBackground(svg) {
  return svg.replace(/<g class="gotchi-bg">[\s\S]*?<\/g>/, '')
}

async function fetchGotchiSvgPng(tokenId) {
  const data = await gql(GOLDSKY_SVG, `{ aavegotchi(id: "${tokenId}") { svg } }`)
  const rawSvg = data?.aavegotchi?.svg
  if (!rawSvg || !rawSvg.includes('<svg')) throw new Error('No SVG')
  const svg = stripGotchiBackground(rawSvg)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: PRESET_IMAGE_SIZE * 2 },
    background: 'transparent',
  })
  return Buffer.from(resvg.render().asPng())
}

async function writeNormalizedSet(name, items, metaExtra = {}, normalizeOpts = {}) {
  const dir = join(OUT, name)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const files = []
  let ok = 0
  for (let i = 0; i < items.length; i += 1) {
    const file = `${name}-${String(i + 1).padStart(3, '0')}.png`
    try {
      const raw = await items[i]()
      const png = await normalizePresetImage(raw, normalizeOpts)
      writeFileSync(join(dir, file), png)
      files.push(file)
      ok += 1
      if ((i + 1) % 5 === 0 || i + 1 === items.length) {
        process.stdout.write(`  ${name}: ${i + 1}/${items.length} (${ok} ok)\r`)
      }
    } catch (err) {
      console.warn(`\n  skip ${file}: ${err.message}`)
    }
    await sleep(name === 'celebrities' ? 1400 : 80)
  }
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({
    name,
    count: ok,
    size: PRESET_IMAGE_SIZE,
    files,
    ...metaExtra,
  }, null, 2))
  console.log(`✓ ${ok}/${items.length} ${name} → public/custom-images/${name}/`)
}

async function normalizeExistingFolder(name) {
  const dir = join(OUT, name)
  const manifestPath = join(dir, 'manifest.json')
  let files
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    files = manifest.files ?? readdirSync(dir).filter((f) => f.endsWith('.png'))
  } catch {
    files = readdirSync(dir).filter((f) => f.endsWith('.png'))
  }
  let ok = 0
  for (const file of files) {
    const path = join(dir, file)
    try {
      const png = await normalizePresetImage(readFileSync(path))
      writeFileSync(path, png)
      ok += 1
    } catch (err) {
      console.warn(`  skip normalize ${name}/${file}: ${err.message}`)
    }
  }
  console.log(`✓ normalized ${ok}/${files.length} in ${name}/`)
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    manifest.size = PRESET_IMAGE_SIZE
    manifest.count = ok
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  }
}

async function downloadHuman(count) {
  const items = Array.from({ length: count }, (_, i) => async () => {
    const gender = i % 2 === 0 ? 'women' : 'men'
    const num = (i % 99) + 1
    return fetchBuffer(`https://randomuser.me/api/portraits/${gender}/${num}.jpg`)
  })
  await writeNormalizedSet('human', items, { source: 'randomuser.me', license: 'Random User Generator (free use)' })
}

async function downloadPunks(count) {
  const items = Array.from({ length: count }, (_, i) => async () => {
    const id = String(i + 1).padStart(4, '0')
    return fetchBuffer(`https://www.larvalabs.com/cryptopunks/cryptopunk${id}.png`)
  })
  await writeNormalizedSet('punks', items, { source: 'larvalabs.com/cryptopunks', license: 'CryptoPunks (Larva Labs)' })
}

async function downloadAbstract(count) {
  const items = Array.from({ length: count }, (_, i) => async () => {
    const seed = `abstract-${i + 1}`
    return fetchBuffer(`https://api.dicebear.com/7.x/shapes/png?seed=${encodeURIComponent(seed)}&size=${PRESET_IMAGE_SIZE}`)
  })
  await writeNormalizedSet('abstract', items, { source: 'dicebear.com shapes', license: 'DiceBear (free)' })
}

async function downloadAavegotchi(count) {
  console.log('\n[aavegotchi] starting…')
  console.log('  fetching top token IDs from Goldsky (Polygon)…')
  const ids = await fetchTopAavegotchiIds(count + 20)
  if (ids.length < count) {
    for (let i = 1; ids.length < count + 20; i += 1) ids.push(String(i))
  }
  console.log(`  rendering ${count} assembled gotchi SVGs → PNG…`)
  const items = ids.slice(0, count + 15).map((id) => async () => fetchGotchiSvgPng(id))
  await writeNormalizedSet('aavegotchi', items.slice(0, count), {
    source: 'aavegotchi.com on-chain SVG (Goldsky)',
    license: 'Aavegotchi project assets',
    tokenIds: ids.slice(0, count),
  }, { fit: 'contain' })
}

async function downloadCelebrities(count) {
  console.log('\n[celebrities] starting…')
  const names = CELEBRITY_NAMES.slice(0, count)
  const items = names.map((name) => async () => fetchWikimediaPortrait(name))
  await writeNormalizedSet('celebrities', items, {
    source: 'Wikimedia Commons',
    license: 'Various CC licenses — see commons.wikimedia.org',
    subjects: names,
  })
}

function shouldRun(setName) {
  return !ONLY || ONLY.includes(setName)
}

mkdirSync(OUT, { recursive: true })

if (NORMALIZE_EXISTING) {
  for (const folder of readdirSync(OUT)) {
    if (folder.startsWith('.')) continue
    await normalizeExistingFolder(folder)
  }
  if (!ONLY) {
    console.log('Done.')
    process.exit(0)
  }
}

console.log(`Preset libraries (target ${PRESET_IMAGE_SIZE}px PNG, count=${COUNT})…`)

if (shouldRun('human')) await downloadHuman(COUNT)
if (shouldRun('punks')) await downloadPunks(COUNT)
if (shouldRun('abstract')) await downloadAbstract(COUNT)
if (shouldRun('aavegotchi')) await downloadAavegotchi(COUNT)
if (shouldRun('celebrities')) await downloadCelebrities(COUNT)

console.log('Done.')
