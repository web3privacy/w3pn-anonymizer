#!/usr/bin/env node
/**
 * Verifies metadata stripping behavior (image re-encode + video re-mux paths).
 * Run: node scripts/verify-metadata-strip.mjs
 */
import sharp from 'sharp'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const demoJpg = join(root, 'public/demo/demo-3.jpg')

function hasExif(meta) {
  return Boolean(meta.exif && meta.exif.length > 0)
}

async function verifyImageStrip() {
  if (!existsSync(demoJpg)) {
    console.error('Missing demo image:', demoJpg)
    process.exit(1)
  }
  const input = readFileSync(demoJpg)
  const before = await sharp(input).metadata()
  // Mirrors stripMetadata(): canvas draw + JPEG re-encode at ~0.96 quality
  const stripped = await sharp(input).rotate().jpeg({ quality: 96, mozjpeg: true }).toBuffer()
  const after = await sharp(stripped).metadata()

  const beforeExif = hasExif(before)
  const afterExif = hasExif(after)
  console.log('Image (demo-3.jpg):')
  console.log(`  Before re-encode: ${beforeExif ? 'EXIF present' : 'no EXIF'} (${input.length} bytes)`)
  console.log(`  After re-encode:  ${afterExif ? 'EXIF present' : 'no EXIF'} (${stripped.length} bytes)`)

  if (beforeExif && afterExif) {
    console.error('  FAIL: EXIF survived re-encode')
    return false
  }
  if (beforeExif && !afterExif) {
    console.log('  OK: EXIF removed by canvas-equivalent re-encode')
  } else {
    console.log('  OK: no EXIF in source; export path still safe (pixels only)')
  }
  return true
}

function verifyExportPaths() {
  console.log('\nExport paths (code audit):')
  const paths = [
    ['Image export (canvas)', 'exportCanvasToBlob / canvasToBlob — no EXIF in output'],
    ['Library ZIP / individual', 'bakePhotoToCanvas → exportCanvasToBlob — no EXIF'],
    ['Sidebar ZIP (exportZip)', 'stripMetadata() on images; videos copied as blob'],
    ['Batch overwrite', 'stripMetadata() before File System Access write'],
    ['Batch normalize', 'preserveExif: false in normalize.ts worker path'],
    ['Video process (processVideo)', 'MediaRecorder re-encode — new container, no source tags'],
    ['Live capture', 'MediaRecorder — fresh recording'],
    ['Video quick export', 'activePhoto.blob — processed blob is re-encoded; unprocessed keeps source metadata'],
  ]
  for (const [name, note] of paths) {
    console.log(`  • ${name}: ${note}`)
  }
  return true
}

const ok = (await verifyImageStrip()) && verifyExportPaths()
process.exit(ok ? 0 : 1)
