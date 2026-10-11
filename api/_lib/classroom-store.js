import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { get, put } from '@vercel/blob'
import { emptyClassroom } from './classroom.js'
import { blobAccess, storeMode, storeSetupError } from './store.js'

const LOCAL_PATH = path.join(process.cwd(), '.data', 'classroom.json')

let memoryStore = null

export function classroomRoot() {
  if (process.env.VERCEL_ENV === 'preview') return 'talk-in-seoul/preview'
  return 'talk-in-seoul'
}

export function classroomBlobPath() {
  return `${classroomRoot()}/classroom.json`
}

export function resetClassroomMemory() {
  memoryStore = null
}

function parseClassroom(text) {
  const parsed = JSON.parse(text)
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.courses)) {
    throw new Error('Classroom data could not be read.')
  }
  if (parsed.courses.length === 0) {
    parsed.courses = emptyClassroom().courses
  }
  if (!Array.isArray(parsed.notices)) parsed.notices = []
  if (!Array.isArray(parsed.homework)) parsed.homework = []
  if (!parsed.codeCourses || typeof parsed.codeCourses !== 'object' || Array.isArray(parsed.codeCourses)) {
    parsed.codeCourses = {}
  }
  parsed.classProgress = cleanClassProgress(parsed.classProgress)
  parsed.progressByCode = cleanProgressByCode(parsed.progressByCode)
  return parsed
}

function cleanClassProgress(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const clean = {}
  for (const [courseId, stepId] of Object.entries(value)) {
    if (typeof stepId !== 'string') continue
    const id = stepId.trim()
    if (!id || id.length > 80) continue
    clean[courseId] = id
  }
  return clean
}

function cleanProgressByCode(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const clean = {}
  for (const [code, courses] of Object.entries(value)) {
    if (!courses || typeof courses !== 'object' || Array.isArray(courses)) continue
    const next = {}
    for (const [courseId, steps] of Object.entries(courses)) {
      if (!Array.isArray(steps)) continue
      const ids = []
      const seen = new Set()
      for (const item of steps) {
        if (typeof item !== 'string') continue
        const id = item.trim()
        if (!id || id.length > 80 || seen.has(id)) continue
        seen.add(id)
        ids.push(id)
      }
      next[courseId] = ids
    }
    clean[code] = next
  }
  return clean
}

async function readBlob() {
  const result = await get(classroomBlobPath(), { access: blobAccess(), useCache: false })
  if (!result?.stream) return emptyClassroom()
  const text = await new Response(result.stream).text()
  if (!text.trim()) return emptyClassroom()
  return parseClassroom(text)
}

async function writeBlob(store) {
  await put(classroomBlobPath(), JSON.stringify(store), {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

async function readFileStore() {
  try {
    const text = await readFile(LOCAL_PATH, 'utf8')
    return parseClassroom(text)
  } catch (error) {
    if (error && error.code === 'ENOENT') return emptyClassroom()
    throw error
  }
}

async function writeFileStore(store) {
  await mkdir(path.dirname(LOCAL_PATH), { recursive: true })
  await writeFile(LOCAL_PATH, JSON.stringify(store, null, 2))
}

export async function loadClassroom() {
  const mode = storeMode()
  if (mode === 'memory') return memoryStore ?? emptyClassroom()
  if (mode === 'file') return readFileStore()
  const setup = storeSetupError()
  if (setup) throw new Error(setup)
  try {
    return await readBlob()
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/not found|404|does not exist/i.test(message)) return emptyClassroom()
    throw error
  }
}

export async function forgetCodeCourse(code) {
  if (!code) return false
  const data = await loadClassroom()
  if (!data.codeCourses || !Object.prototype.hasOwnProperty.call(data.codeCourses, code)) return false
  delete data.codeCourses[code]
  await saveClassroom(data)
  return true
}

export async function saveClassroom(store) {
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
