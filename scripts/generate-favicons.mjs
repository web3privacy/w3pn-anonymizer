#!/usr/bin/env node
/**
 * Generates favicon / PWA icons from the brand favicon master PNG.
 *
 * Run:  npm run icons:favicons
 */
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const SOURCE = join(PUBLIC, 'brand', 'favicon-source.png')

const BG = { r: 0, g: 0, b: 0, alpha: 1 }
const PADDING = 0.06

async function renderPng(size) {
  const logoSize = Math.round(size * (1 - PADDING * 2))
  const offset = Math.round((size - logoSize) / 2)

  const logo = await sharp(SOURCE)
    .resize(logoSize, logoSize, { fit: 'contain', background: BG })
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, left: offset, top: offset }])
    .png()
    .toBuffer()
}

async function writeFaviconSvg() {
  const png512 = await renderPng(512)
  const dataUri = `data:image/png;base64,${png512.toString('base64')}`
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
    `<image href="${dataUri}" width="512" height="512"/>`,
    '</svg>',
  ].join('')
  writeFileSync(join(PUBLIC, 'favicon.svg'), svg)
}

function pngBuffersToIco(entries) {
  const headerSize = 6
  const entrySize = 16
  const directorySize = headerSize + entries.length * entrySize
  const header = Buffer.alloc(directorySize)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(entries.length, 4)

  let offset = directorySize
  entries.forEach(({ size, buffer }, index) => {
    const entryOffset = headerSize + index * entrySize
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset)
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1)
    header.writeUInt8(0, entryOffset + 2)
    header.writeUInt8(0, entryOffset + 3)
    header.writeUInt16LE(1, entryOffset + 4)
    header.writeUInt16LE(32, entryOffset + 6)
    header.writeUInt32LE(buffer.length, entryOffset + 8)
    header.writeUInt32LE(offset, entryOffset + 12)
    offset += buffer.length
  })

  return Buffer.concat([header, ...entries.map(({ buffer }) => buffer)])
}

const PNG_OUTPUTS = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
  ['favicon-96.png', 96],
  ['favicon.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]

console.log('Generating favicons from', SOURCE)

const icoSizes = [16, 32, 48]
const icoBuffers = []

for (const [file, size] of PNG_OUTPUTS) {
  const buf = await renderPng(size)
  writeFileSync(join(PUBLIC, file), buf)
  console.log(`  ✓ ${file} (${size}×${size})`)
  if (icoSizes.includes(size)) icoBuffers.push({ size, buffer: buf })
}

writeFileSync(join(PUBLIC, 'favicon.ico'), pngBuffersToIco(icoBuffers))
console.log('  ✓ favicon.ico (16, 32, 48)')

await writeFaviconSvg()
console.log('  ✓ favicon.svg')

console.log('Done.')
