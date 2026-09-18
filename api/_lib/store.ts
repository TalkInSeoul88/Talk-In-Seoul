import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { get, put } from '@vercel/blob'
import { emptyStore, type CodeStore } from './codes.ts'

const BLOB_PATH = 'talk-in-seoul/access-codes.json'
const LOCAL_PATH = path.join(process.cwd(), '.data', 'access-codes.json')

let memoryStore: CodeStore | null = null

export type StoreMode = 'blob' | 'file' | 'memory'

export function blobAccess(): 'private' | 'public' {
  return process.env.BLOB_ACCESS === 'public' ? 'public' : 'private'
}

export function storeMode(): StoreMode {
  if (process.env.ACCESS_CODES_STORE === 'memory') return 'memory'
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return 'blob'
  if (process.env.VERCEL) return 'blob'
  return 'file'
}

export function storeSetupError(): string | null {
  if (storeMode() !== 'blob') return null
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return null
  return 'Connect a Vercel Blob store to this project (Storage → Blob), or set BLOB_READ_WRITE_TOKEN. Codes are not saved in localStorage.'
}

async function readBlob(): Promise<CodeStore> {
  const result = await get(BLOB_PATH, { access: blobAccess(), useCache: false })
  if (!result?.stream) return emptyStore()
  const text = await new Response(result.stream).text()
  if (!text.trim()) return emptyStore()
  const parsed = JSON.parse(text) as CodeStore
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.codes)) return emptyStore()
  return parsed
}

async function writeBlob(store: CodeStore): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(store), {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

async function readFileStore(): Promise<CodeStore> {
  try {
    const text = await readFile(LOCAL_PATH, 'utf8')
    const parsed = JSON.parse(text) as CodeStore
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.codes)) return emptyStore()
    return parsed
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return emptyStore()
    throw error
  }
}

async function writeFileStore(store: CodeStore): Promise<void> {
  await mkdir(path.dirname(LOCAL_PATH), { recursive: true })
  await writeFile(LOCAL_PATH, JSON.stringify(store, null, 2))
}

export async function loadCodes(): Promise<CodeStore> {
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

export async function saveCodes(store: CodeStore): Promise<void> {
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

export function resetMemoryStore(): void {
  memoryStore = null
}
