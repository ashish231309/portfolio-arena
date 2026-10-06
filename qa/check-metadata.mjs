#!/usr/bin/env node
/**
 * qa/check-metadata.mjs — enforce that no asset in public/ carries embedded metadata.
 *
 *   npm run check:meta
 *
 * Scans public/ recursively, prints a per-file verdict, and exits non-zero if ANY
 * metadata is found. On success it prints "0 files with metadata".
 *
 * WHAT COUNTS AS METADATA (a failure):
 *   PDF   Info dictionary (Author, Creator, Producer, Title, dates, Keywords, …), any XMP
 *         packet, and metadata inside embedded images — the checks below inflate
 *         FlateDecode streams and parse DCTDecode streams as JPEGs, so metadata hidden
 *         inside a page image is caught too.
 *   JPEG  APP1 (EXIF/XMP), APP2 ICC_PROFILE colour profile, APP12 (Ducky),
 *         APP13 (IPTC/Photoshop), COM (comment)
 *   PNG   tEXt, iTXt, zTXt, tIME, eXIf chunks
 *   SVG   XML comments, <metadata>, <title>, <desc> nodes
 *   WebP  EXIF / XMP chunks
 *   WOFF2 optional metadata block and private-data block (both must be absent)
 *
 * WHAT IS ALLOWED (structural, not metadata about a person or device):
 *   JPEG APP0/JFIF and APP14/Adobe headers, DQT/DHT/SOF/SOS image structure;
 *   PNG IHDR/sRGB/gAMA/pHYs/PLTE/tRNS/IDAT/IEND. These describe the picture format,
 *   not who made it, when, or on what device.
 *
 * Usage: node qa/check-metadata.mjs [dir]      (default: public)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, extname, resolve } from 'node:path'
import { inflateSync } from 'node:zlib'

const ROOT = resolve(process.cwd(), process.argv[2] ?? 'public')

const PNG_META = new Set(['tEXt', 'iTXt', 'zTXt', 'tIME', 'eXIf'])
const JPEG_META = new Map([
  [0xe1, 'APP1 (EXIF/XMP)'],
  [0xec, 'APP12 (Ducky)'],
  [0xed, 'APP13 (IPTC/Photoshop)'],
  [0xfe, 'COM (comment)'],
])
const JPEG_OK = new Set([0xe0, 0xee])          // JFIF header, Adobe transform marker

// ---------------------------------------------------------------- walk
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

// ---------------------------------------------------------------- JPEG markers
/** Parse a JPEG marker chain. Returns { found, kept } or null if the bytes aren't a JPEG. */
function jpegMarkers(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  const found = []
  const kept = []
  let pos = 2
  while (pos + 1 < buf.length) {
    if (buf[pos] !== 0xff) return null                    // desynced: not a real JPEG
    const marker = buf[pos + 1]
    if (marker === 0xda) return { found, kept }           // start of scan
    if (marker === 0xd9) return { found, kept }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) { pos += 2; continue }
    if (pos + 4 > buf.length) return null
    const len = buf.readUInt16BE(pos + 2)
    if (len < 2 || pos + 2 + len > buf.length) return null
    const payload = buf.subarray(pos + 4, pos + 2 + len)
    if (JPEG_META.has(marker)) found.push(`${JPEG_META.get(marker)} (${len + 2} bytes)`)
    else if (marker === 0xe2 && payload.subarray(0, 12).toString('latin1') === 'ICC_PROFILE\0') {
      found.push(`APP2 ICC_PROFILE colour profile (${len + 2} bytes)`)
    } else if (JPEG_OK.has(marker)) kept.push(marker === 0xe0 ? 'APP0/JFIF' : 'APP14/Adobe')
    else if (marker >= 0xe0 && marker <= 0xef) found.push(`APP${marker - 0xe0} (metadata segment, ${len + 2} bytes)`)
    pos += 2 + len
  }
  return { found, kept }
}

// ---------------------------------------------------------------- PNG chunks
function pngChunks(buf) {
  const found = []
  const chunks = []
  let pos = 8
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    chunks.push(type)
    if (PNG_META.has(type)) found.push(`PNG ${type} chunk (${len} bytes)`)
    pos += 12 + len
    if (type === 'IEND') break
  }
  return { found, chunks }
}

/** Scan a decoded byte block for JPEG/PNG/XMP/EXIF payloads (used inside PDF streams). */
function scanPayload(buf, where, found) {
  if (buf.length > 8 && buf[0] === 0x89 && buf.toString('latin1', 1, 4) === 'PNG') {
    for (const f of pngChunks(buf).found) found.push(`${where}: ${f}`)
  }
  const soi = buf.indexOf(Buffer.from([0xff, 0xd8, 0xff]))
  if (soi >= 0) {
    const r = jpegMarkers(buf.subarray(soi))
    if (r) for (const f of r.found) found.push(`${where}: embedded JPEG ${f}`)
  }
  const text = buf.toString('latin1')
  if (text.includes('<x:xmpmeta') || text.includes('<?xpacket')) found.push(`${where}: XMP packet bytes`)
  if (text.includes('Exif\0\0')) found.push(`${where}: EXIF header bytes`)
  if (text.includes('Photoshop 3.0')) found.push(`${where}: Photoshop/IPTC header bytes`)
}

// ---------------------------------------------------------------- PDF
function checkPdf(buf) {
  const found = []
  const s = buf.toString('latin1')

  // 1. Info dictionary
  const infoRef = s.match(/\/Info\s+(\d+)\s+0\s+R/)
  if (infoRef) {
    const n = infoRef[1]
    const m = s.match(new RegExp(`(?:^|[^0-9])${n}\\s+0\\s+obj([\\s\\S]{0,4000}?)endobj`))
    if (m) {
      const keys = [...m[1].matchAll(/\/([A-Za-z][A-Za-z0-9]*)\s*(?:\(|<|\/|\[|\d)/g)]
        .map((x) => x[1])
        .filter((k) => !['Length', 'Type', 'Filter', 'DecodeParms'].includes(k))
      if (keys.length) found.push(`Info dictionary (${keys.map((k) => '/' + k).join(', ')})`)
    } else {
      found.push(`trailer references an Info object (${n} 0 R)`)
    }
  } else if (/\/Info\s*[<[]/.test(s)) {
    found.push('Info dictionary')
  }

  // 2. XMP packet anywhere in the file
  if (s.includes('<x:xmpmeta') || s.includes('<?xpacket')) found.push('XMP packet bytes')
  if (/\/Metadata\s/.test(s)) found.push('catalog /Metadata (XMP) stream')

  // 3. every stream, including embedded images behind FlateDecode
  let inspected = 0
  let uninspected = 0
  const objRe = /(\d+)\s+0\s+obj\b/g
  let m
  while ((m = objRe.exec(s)) !== null) {
    const start = m.index
    const endObj = s.indexOf('endobj', start)
    if (endObj < 0) continue
    const region = s.slice(start, endObj)
    const sIdx = region.indexOf('stream')
    if (sIdx < 0) continue
    const dict = region.slice(0, sIdx)
    let dataStart = start + sIdx + 6
    if (buf[dataStart] === 0x0d) dataStart++
    if (buf[dataStart] === 0x0a) dataStart++
    const lenMatch = dict.match(/\/Length\s+(\d+)(?!\s+0\s+R)/)
    let dataEnd
    if (lenMatch) dataEnd = dataStart + Number(lenMatch[1])
    else {
      const e = s.indexOf('endstream', dataStart)
      if (e < 0) continue
      dataEnd = e
    }
    const data = buf.subarray(dataStart, Math.min(dataEnd, buf.length))
    const flate = /\/FlateDecode/.test(dict)
    const dct = /\/DCTDecode/.test(dict)
    inspected++
    if (dct && /\/Subtype\s*\/Image/.test(dict)) {
      const i = data.indexOf(Buffer.from([0xff, 0xd8, 0xff]))
      const r = i >= 0 ? jpegMarkers(data.subarray(i)) : null
      if (r) for (const f of r.found) found.push(`embedded image: ${f}`)
      else uninspected++
    } else if (flate) {
      try {
        const inflated = inflateSync(data)
        scanPayload(inflated, 'stream', found)
      } catch {
        // couldn't inflate: fall back to a raw scan of the compressed bytes
        uninspected++
        scanPayload(data, 'stream (raw)', found)
      }
    } else {
      scanPayload(data, 'stream (raw)', found)
    }
    objRe.lastIndex = endObj
  }

  return { found: [...new Set(found)], inspected, uninspected }
}

// ---------------------------------------------------------------- SVG
function checkSvg(buf) {
  const src = buf.toString('utf8')
  const found = []
  const comments = src.match(/<!--[\s\S]*?-->/g) ?? []
  if (comments.length) found.push(`${comments.length} XML comment(s)`)
  for (const [tag, label] of [['metadata', '<metadata>'], ['title', '<title>'], ['desc', '<desc>']]) {
    const n = (src.match(new RegExp(`<${tag}[\\s>]`, 'gi')) ?? []).length
    if (n) found.push(`${n} ${label} node(s)`)
  }
  return found
}

// ---------------------------------------------------------------- WebP
function checkWebp(buf) {
  const found = []
  if (buf.subarray(12, 16).toString('ascii') !== 'VP8X') return found
  let pos = 12
  while (pos + 8 <= buf.length) {
    const fourcc = buf.toString('ascii', pos, pos + 4)
    const size = buf.readUInt32LE(pos + 4)
    if (fourcc === 'EXIF') found.push('EXIF chunk')
    if (fourcc === 'XMP ') found.push('XMP chunk')
    pos += 8 + size + (size % 2)
  }
  return found
}

// ---------------------------------------------------------------- WOFF2
/**
 * A WOFF2 (T32 self-hosted fonts) may carry an optional metadata block and an
 * optional private-data block. Both are metadata-bearing by definition, so any
 * non-zero offset/length is a failure — the copies we ship have metaOffset=0
 * and privOffset=0, and this keeps it that way if a font is ever replaced.
 */
function checkWoff2(buf) {
  const found = []
  if (buf.length < 48 || buf.subarray(0, 4).toString('ascii') !== 'wOF2') {
    return ['file is not a parseable WOFF2']
  }
  const metaOffset = buf.readUInt32BE(28)
  const metaLength = buf.readUInt32BE(32)
  const privOffset = buf.readUInt32BE(40)
  const privLength = buf.readUInt32BE(44)
  if (metaOffset !== 0 || metaLength !== 0) found.push(`WOFF2 metadata block (offset ${metaOffset}, ${metaLength} B)`)
  if (privOffset !== 0 || privLength !== 0) found.push(`WOFF2 private-data block (offset ${privOffset}, ${privLength} B)`)
  return found
}

// ---------------------------------------------------------------- main
const files = walk(ROOT).sort()
let bad = 0
let clean = 0
const skipped = []

console.log(`\nMetadata check — ${relative(process.cwd(), ROOT) || ROOT}/\n`)

for (const file of files) {
  const rel = file.startsWith(process.cwd()) ? relative(process.cwd(), file) : file
  const ext = extname(file).toLowerCase()
  const buf = readFileSync(file)
  let found = []
  let note = ''

  if (ext === '.pdf') {
    const r = checkPdf(buf)
    found = r.found
    note = `${r.inspected} stream(s) inspected${r.uninspected ? `, ${r.uninspected} not decodable` : ''}`
  } else if (ext === '.png') {
    const r = pngChunks(buf)
    found = r.found
    note = `chunks: ${[...new Set(r.chunks)].join(',')}`
  } else if (ext === '.jpg' || ext === '.jpeg') {
    const r = jpegMarkers(buf)
    if (r) {
      found = r.found
      note = r.kept.length ? `kept structural: ${[...new Set(r.kept)].join(',')}` : ''
    } else {
      found = ['file is not a parseable JPEG']
    }
  } else if (ext === '.svg') found = checkSvg(buf)
  else if (ext === '.webp') found = checkWebp(buf)
  else if (ext === '.woff2') {
    found = checkWoff2(buf)
    note = 'metaOffset/privOffset must be 0'
  }
  else { skipped.push(rel); continue }

  if (found.length) {
    bad++
    console.log(`  ✗ ${rel}`)
    for (const f of found) console.log(`      metadata: ${f}`)
  } else {
    clean++
    console.log(`  ✓ ${rel}${note ? `   (${note})` : ''}`)
  }
}

console.log('')
console.log(`  files scanned        : ${files.length - skipped.length}`)
console.log(`  files with metadata  : ${bad}`)
console.log(`  files clean          : ${clean}`)
if (skipped.length) console.log(`  not covered by this checker: ${skipped.length} → ${skipped.join(', ')}`)
console.log(`\n  ${bad} files with metadata\n`)

process.exit(bad === 0 ? 0 : 1)
