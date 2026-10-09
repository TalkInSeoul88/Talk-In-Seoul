import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { del, get, put } from '@vercel/blob'
import { blobAccess, storeMode } from './store.js'
import { classroomRoot } from './classroom-store.js'

export const MAX_FILE_BYTES = 12 * 1024 * 1024
export const SERVER_UPLOAD_MAX = 4 * 1024 * 1024

export const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]

const EXT_TYPES = new Map([
  ['pdf', 'application/pdf'],
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['webp', 'image/webp'],
  ['gif', 'image/gif'],
  ['heic', 'image/heic'],
  ['heif', 'image/heif'],
])

const memoryFiles = new Map()

export function resetMemoryFiles() {
  memoryFiles.clear()
}

export function displayFileName(name) {
  const base = String(name || 'file').split(/[/\\]/).pop() || 'file'
  let cleaned = ''
  for (const char of base) {
    const code = char.charCodeAt(0)
    if (code < 32 || code === 127 || char === '"' || char === '\\') continue
    cleaned += char
  }
  return cleaned.trim().slice(0, 80) || 'file'
}

export function safeFileName(name) {
  const base = displayFileName(name)
  const cleaned = base.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
  return cleaned || 'file'
}

export function normalizeUpload(name, contentType) {
  const display = displayFileName(name)
  const safe = safeFileName(display)
  const ext = safe.includes('.') ? safe.split('.').pop().toLowerCase() : ''
  const fromExt = EXT_TYPES.get(ext) || ''
  const type = String(contentType || '').split(';')[0].trim().toLowerCase()
  const normalizedType = type === 'image/jpg' ? 'image/jpeg' : type
  let resolved = ''
  if (fromExt && (!normalizedType || normalizedType === 'application/octet-stream' || normalizedType === fromExt)) {
    resolved = fromExt
  } else if (normalizedType === 'image/jpeg' && !fromExt) {
    resolved = 'image/jpeg'
  } else if (fromExt && ALLOWED_CONTENT_TYPES.includes(normalizedType)) {
    resolved = fromExt
  }
  if (!resolved) return { error: 'Use a PDF or a photo (JPG, PNG, WEBP, GIF, or HEIC).' }
  const withExt = ext || (resolved === 'image/jpeg' ? 'jpg' : '')
  const named = ext ? display : withExt ? `${display}.${withExt}` : display
  return { name: named, contentType: resolved }
}

export function filePath(fileId, name) {
  return `${classroomRoot()}/files/${fileId}/${safeFileName(name)}`
}

function assertSafePath(pathname) {
  const root = classroomRoot()
  if (!pathname || pathname.includes('..') || !pathname.startsWith(`${root}/files/`)) {
    throw new Error('Unexpected file path.')
  }
}

function localPath(pathname) {
  return path.join(process.cwd(), '.data', 'blob', pathname)
}

export async function writeFileBytes(pathname, bytes, contentType) {
  assertSafePath(pathname)
  const body = Buffer.from(bytes)
  const mode = storeMode()
  if (mode === 'memory') {
    memoryFiles.set(pathname, { bytes: body, contentType })
    return
  }
  if (mode === 'file') {
    const full = localPath(pathname)
    await mkdir(path.dirname(full), { recursive: true })
    await writeFile(full, body)
    await writeFile(`${full}.type`, contentType)
    return
  }
  await put(pathname, body, {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  })
}

export async function readFileBytes(pathname) {
  assertSafePath(pathname)
  const mode = storeMode()
  if (mode === 'memory') {
    const saved = memoryFiles.get(pathname)
    return saved ? { bytes: saved.bytes, contentType: saved.contentType } : null
  }
  if (mode === 'file') {
    try {
      const full = localPath(pathname)
      const bytes = await readFile(full)
      let contentType = 'application/octet-stream'
      try {
        contentType = (await readFile(`${full}.type`, 'utf8')).trim() || contentType
      } catch {
        /* type sidecar is optional */
      }
      return { bytes, contentType }
    } catch (error) {
      if (error && error.code === 'ENOENT') return null
      throw error
    }
  }
  const result = await get(pathname, { access: blobAccess(), useCache: false })
  if (!result?.stream) return null
  const bytes = Buffer.from(await new Response(result.stream).arrayBuffer())
  const contentType = result.blob?.contentType || result.headers?.get?.('content-type') || 'application/octet-stream'
  return { bytes, contentType }
}

export async function deleteFileBytes(pathname) {
  try {
    assertSafePath(pathname)
  } catch {
    return
  }
  const mode = storeMode()
  if (mode === 'memory') {
    memoryFiles.delete(pathname)
    return
  }
  if (mode === 'file') {
    await rm(localPath(pathname), { force: true })
    await rm(`${localPath(pathname)}.type`, { force: true })
    return
  }
  try {
    await del(pathname)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/not found|404|does not exist/i.test(message)) return
    throw error
  }
}

export function parseMultipart(buffer, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(String(contentType || ''))
  if (!match || !buffer?.length) return []
  const boundary = (match[1] || match[2] || '').trim()
  if (!boundary) return []
  const source = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
  const delim = Buffer.from(`--${boundary}`)
  const parts = []
  let cursor = source.indexOf(delim)
  if (cursor < 0) return []
  cursor += delim.length
  while (cursor < source.length) {
    if (source[cursor] === 45 && source[cursor + 1] === 45) break
    if (source[cursor] === 13 && source[cursor + 1] === 10) cursor += 2
    else if (source[cursor] === 10) cursor += 1
    const headerEnd = indexOfBuffer(source, Buffer.from('\r\n\r\n'), cursor)
    const headerSep = headerEnd >= 0 ? 4 : 0
    const headerEndLf = headerEnd >= 0 ? headerEnd : indexOfBuffer(source, Buffer.from('\n\n'), cursor)
    const end = headerEnd >= 0 ? headerEnd : headerEndLf
    const sep = headerEnd >= 0 ? headerSep : 2
    if (end < 0) break
    const headers = source.slice(cursor, end).toString('utf8')
    const bodyStart = end + sep
    const next = indexOfBuffer(source, delim, bodyStart)
    if (next < 0) break
    let bodyEnd = next
    if (bodyEnd >= 2 && source[bodyEnd - 2] === 13 && source[bodyEnd - 1] === 10) bodyEnd -= 2
    else if (bodyEnd >= 1 && source[bodyEnd - 1] === 10) bodyEnd -= 1
    const name = /name="([^"]*)"/.exec(headers)?.[1] || ''
    const filename = /filename="([^"]*)"/.exec(headers)?.[1] || ''
    const type = /content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim() || ''
    parts.push({ name, filename, contentType: type, data: source.subarray(bodyStart, bodyEnd) })
    cursor = next + delim.length
  }
  return parts
}

function indexOfBuffer(source, needle, from) {
  return source.indexOf(needle, from)
}

export function attachmentHeaders(file) {
  let ascii = ''
  for (const char of String(file.name || 'file')) {
    const code = char.charCodeAt(0)
    ascii += code >= 32 && code <= 126 && char !== '"' && char !== '\\' ? char : '_'
  }
  return {
    'Content-Type': file.contentType || 'application/octet-stream',
    'Content-Length': String(file.bytes?.length || file.size || 0),
    'Content-Disposition': `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name || 'file')}`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  }
}
