import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { get, put } from '@vercel/blob'
import { emptyStore } from './codes.js'

const BLOB_PATH = 'talk-in-seoul/access-codes.json'
const LOCAL_PATH = path.join(process.cwd(), '.data', 'access-codes.json')

let memoryStore = null

export function blobAccess() {
  return process.env.BLOB_ACCESS === 'public' ? 'public' : 'private'
}

export function storeMode() {
  if (process.env.ACCESS_CODES_STORE === 'memory') return 'memory'
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return 'blob'
  if (process.env.VERCEL) return 'blob'
  return 'file'
}

export function storeSetupError() {
  if (storeMode() !== 'blob') return null
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return null
  return 'Connect a Vercel Blob store to this project (Storage → Blob), or set BLOB_READ_WRITE_TOKEN. Codes are not saved in localStorage.'
}

function parseStore(text) {
  const parsed = JSON.parse(text)
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.codes)) return emptyStore()
  return parsed
}

async function readBlob() {
  const result = await get(BLOB_PATH, { access: blobAccess(), useCache: false })
  if (!result?.stream) return emptyStore()
  const text = await new Response(result.stream).text()
  if (!text.trim()) return emptyStore()
  return parseStore(text)
}

async function writeBlob(store) {
  await put(BLOB_PATH, JSON.stringify(store), {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

async function readFileStore() {
  try {
    const text = await readFile(LOCAL_PATH, 'utf8')
    return parseStore(text)
  } catch (error) {
    if (error && error.code === 'ENOENT') return emptyStore()
    throw error
  }
}

async function writeFileStore(store) {
  await mkdir(path.dirname(LOCAL_PATH), { recursive: true })
  await writeFile(LOCAL_PATH, JSON.stringify(store, null, 2))
}

export async function loadCodes() {
  const mode = storeMode()
  if (mode === 'memory') return memoryStore ?? emptyStore()
  if (mode === 'file') return readFileStore()
  const setup = storeSetupError()
  if (setup) throw new Error(setup)
  try {
    return await readBlob()
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/not found|404|does not exist/i.test(message)) return emptyStore()
    throw error
  }
}

export async function saveCodes(store) {
  const mode = storeMode()
  if (mode === 'memory') {
    memoryStore = store
    return
  }
  if (mode === 'file') {
    await writeFileStore(store)
    return
  }
  const setup = storeSetupError()
  if (setup) throw new Error(setup)
  await writeBlob(store)
}

export function resetMemoryStore() {
  memoryStore = null
}
