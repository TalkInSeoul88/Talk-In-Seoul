import { issueFileGrant, verifyFileGrant } from './auth.js'
import {
  courseById,
  courseForCode,
  fileKind,
  findFile,
  highestHomeworkWeek,
  homeworkWeeks,
  newId,
  noticesForCourse,
  publicCourse,
  readWeeks,
  sortNotices,
  validateCourseName,
  validateHomework,
  validateNotice,
  MAX_FILES,
} from './classroom.js'
import { loadClassroom, saveClassroom } from './classroom-store.js'
import { COURSE_CLOSED } from './codes.js'
import { readWeekSheet } from './week-sheets.js'
import {
  attachmentHeaders,
  deleteFileBytes,
  filePath,
  MAX_FILE_BYTES,
  normalizeUpload,
  parseMultipart,
  readFileBytes,
  SERVER_UPLOAD_MAX,
  writeFileBytes,
} from './files.js'
import { requireAdmin, requireStudent } from './guard.js'
import { storeMode } from './store.js'

function json(status, body) {
  return { status, body }
}

function failure(error) {
  const message = error instanceof Error ? error.message : 'Could not save that.'
  return json(500, { error: message })
}

function adminFile(file) {
  return {
    id: file.id,
    name: file.name,
    contentType: file.contentType,
    size: file.size,
    kind: fileKind(file.contentType),
    pending: Boolean(file.pending),
    href: file.pending ? '' : adminFileHref(file.id),
  }
}

function adminFileHref(fileId) {
  const grant = issueFileGrant(fileId)
  return `/api/admin/file?id=${encodeURIComponent(fileId)}&exp=${encodeURIComponent(grant.exp)}&sig=${encodeURIComponent(grant.sig)}`
}

function studentHref(fileId, code) {
  return `/api/class/file?id=${encodeURIComponent(fileId)}&code=${encodeURIComponent(code)}`
}

function presentHomework(item, hrefFor) {
  return {
    id: item.id,
    courseId: item.courseId,
    week: item.week,
    title: item.title,
    instructions: item.instructions,
    dueDate: item.dueDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    files: item.files.filter((file) => hrefFor === adminFile || !file.pending).map((file) => {
      if (hrefFor === adminFile) return adminFile(file)
      return {
        id: file.id,
        name: file.name,
        contentType: file.contentType,
        size: file.size,
        kind: fileKind(file.contentType),
        href: hrefFor(file.id),
      }
    }),
  }
}

function presentNotice(item) {
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    date: item.date,
    pinned: Boolean(item.pinned),
    courseId: item.courseId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

async function dropFiles(files) {
  await Promise.all(files.map((file) => deleteFileBytes(file.pathname)))
}

export async function handleAdminCourses(ctx) {
  const admin = requireAdmin(ctx)
  if (!admin.ok) return json(admin.status, { error: admin.error })
  try {
    if (ctx.method === 'GET') {
      const data = await loadClassroom()
      return json(200, {
        courses: data.courses.map(publicCourse),
        codeCourses: data.codeCourses,
        store: storeMode(),
      })
    }

    const data = await loadClassroom()
    const now = new Date().toISOString()

    if (ctx.method === 'POST') {
      const name = validateCourseName(ctx.body?.name, data.courses)
      if (name.error) return json(400, { error: name.error })
      const weeks = readWeeks(ctx.body?.weeks)
      if (weeks.error) return json(400, { error: weeks.error })
      const course = {
        id: `${name.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'course'}-${newId().slice(0, 8)}`,
        name: name.name,
        weeks: weeks.weeks,
        createdAt: now,
        updatedAt: now,
      }
      data.courses.push(course)
      await saveClassroom(data)
      return json(201, { course: publicCourse(course) })
    }

    if (ctx.method === 'PATCH' && ctx.body?.code && !ctx.body?.id) {
      const { normalizeCode, validateCodeFormat } = await import('./codes.js')
      const { loadCodes } = await import('./store.js')
      const code = normalizeCode(ctx.body.code)
      const formatError = validateCodeFormat(code)
      if (formatError) return json(400, { error: formatError })
      const codes = await loadCodes()
      if (!codes.codes.some((item) => item.code === code)) {
        return json(404, { error: 'That code was not found.' })
      }
      const courseId = ctx.body.courseId ? String(ctx.body.courseId) : ''
      if (!courseId) {
        delete data.codeCourses[code]
      } else if (!courseById(data, courseId)) {
        return json(400, { error: 'Pick a course.' })
      } else {
        data.codeCourses[code] = courseId
      }
      await saveClassroom(data)
      return json(200, { code, courseId: courseId || null })
    }

    if (ctx.method === 'PATCH') {
      const course = courseById(data, String(ctx.body?.id || ''))
      if (!course) return json(404, { error: 'That course was not found.' })
      if (ctx.body?.name !== undefined) {
        const name = validateCourseName(ctx.body.name, data.courses, course.id)
        if (name.error) return json(400, { error: name.error })
        course.name = name.name
      }
      if (ctx.body?.weeks !== undefined) {
        const weeks = readWeeks(ctx.body.weeks)
        if (weeks.error) return json(400, { error: weeks.error })
        const highest = highestHomeworkWeek(data, course.id)
        if (weeks.weeks < highest) {
          return json(400, {
            error: `Week ${highest} already has homework. Leave at least ${highest} weeks.`,
          })
        }
        course.weeks = weeks.weeks
      }
      course.updatedAt = now
      await saveClassroom(data)
      return json(200, { course: publicCourse(course) })
    }

    if (ctx.method === 'DELETE') {
      const id = String(ctx.body?.id || '')
      const course = courseById(data, id)
      if (!course) return json(404, { error: 'That course was not found.' })
      if (data.courses.length <= 1) return json(400, { error: 'Keep at least one course.' })
      const doomed = data.homework.filter((item) => item.courseId === id)
      await dropFiles(doomed.flatMap((item) => item.files))
      data.homework = data.homework.filter((item) => item.courseId !== id)
      data.notices = data.notices.filter((item) => item.courseId !== id)
      for (const [code, courseId] of Object.entries(data.codeCourses)) {
        if (courseId === id) delete data.codeCourses[code]
      }
      data.courses = data.courses.filter((item) => item.id !== id)
      await saveClassroom(data)
      return json(200, { ok: true })
    }

    return json(405, { error: 'Use GET, POST, PATCH, or DELETE.' })
  } catch (error) {
    return failure(error)
  }
}

export async function handleAdminNotices(ctx) {
  const admin = requireAdmin(ctx)
  if (!admin.ok) return json(admin.status, { error: admin.error })
  try {
    if (ctx.method === 'GET') {
      const data = await loadClassroom()
      return json(200, {
        notices: sortNotices(data.notices).map(presentNotice),
        courses: data.courses.map(publicCourse),
      })
    }

    const data = await loadClassroom()
    const now = new Date().toISOString()

    if (ctx.method === 'POST') {
      const parsed = validateNotice(ctx.body || {}, data.courses)
      if (parsed.error) return json(400, { error: parsed.error })
      const notice = { id: newId(), ...parsed.value, createdAt: now, updatedAt: now }
      data.notices.push(notice)
      await saveClassroom(data)
      return json(201, { notice: presentNotice(notice) })
    }

    if (ctx.method === 'PATCH') {
      const notice = data.notices.find((item) => item.id === ctx.body?.id)
      if (!notice) return json(404, { error: 'That notice was not found.' })
      const parsed = validateNotice(
        {
          title: ctx.body?.title ?? notice.title,
          body: ctx.body?.body ?? notice.body,
          date: ctx.body?.date ?? notice.date,
          pinned: ctx.body?.pinned === undefined ? notice.pinned : ctx.body.pinned,
          courseId: ctx.body?.courseId === undefined ? notice.courseId : ctx.body.courseId,
        },
        data.courses,
      )
      if (parsed.error) return json(400, { error: parsed.error })
      Object.assign(notice, parsed.value, { updatedAt: now })
      await saveClassroom(data)
      return json(200, { notice: presentNotice(notice) })
    }

    if (ctx.method === 'DELETE') {
      const before = data.notices.length
      data.notices = data.notices.filter((item) => item.id !== ctx.body?.id)
      if (data.notices.length === before) return json(404, { error: 'That notice was not found.' })
      await saveClassroom(data)
      return json(200, { ok: true })
    }

    return json(405, { error: 'Use GET, POST, PATCH, or DELETE.' })
  } catch (error) {
    return failure(error)
  }
}

export async function handleAdminHomework(ctx) {
  const admin = requireAdmin(ctx)
  if (!admin.ok) return json(admin.status, { error: admin.error })
  try {
    if (ctx.method === 'GET') {
      const data = await loadClassroom()
      return json(200, {
        courses: data.courses.map(publicCourse),
        homework: data.homework
          .slice()
          .sort((a, b) => a.week - b.week || b.createdAt.localeCompare(a.createdAt))
          .map((item) => presentHomework(item, adminFile)),
        store: storeMode(),
        serverUploadMax: SERVER_UPLOAD_MAX,
      })
    }

    const data = await loadClassroom()
    const now = new Date().toISOString()

    if (ctx.method === 'POST') {
      const parsed = validateHomework(ctx.body || {}, data.courses)
      if (parsed.error) return json(400, { error: parsed.error })
      const item = { id: newId(), ...parsed.value, files: [], createdAt: now, updatedAt: now }
      data.homework.push(item)
      await saveClassroom(data)
      return json(201, { homework: presentHomework(item, adminFile) })
    }

    if (ctx.method === 'PATCH') {
      const item = data.homework.find((entry) => entry.id === ctx.body?.id)
      if (!item) return json(404, { error: 'That homework was not found.' })
      const parsed = validateHomework(
        {
          courseId: ctx.body?.courseId ?? item.courseId,
          week: ctx.body?.week ?? item.week,
          title: ctx.body?.title ?? item.title,
          instructions: ctx.body?.instructions ?? item.instructions,
          dueDate: ctx.body?.dueDate === undefined ? item.dueDate : ctx.body.dueDate,
        },
        data.courses,
      )
      if (parsed.error) return json(400, { error: parsed.error })
      Object.assign(item, parsed.value, { updatedAt: now })
      await saveClassroom(data)
      return json(200, { homework: presentHomework(item, adminFile) })
    }

    if (ctx.method === 'DELETE') {
      const item = data.homework.find((entry) => entry.id === ctx.body?.id)
      if (!item) return json(404, { error: 'That homework was not found.' })
      await dropFiles(item.files)
      data.homework = data.homework.filter((entry) => entry.id !== item.id)
      await saveClassroom(data)
      return json(200, { ok: true })
    }

    return json(405, { error: 'Use GET, POST, PATCH, or DELETE.' })
  } catch (error) {
    return failure(error)
  }
}

function tooBig(size) {
  return !Number.isFinite(size) || size <= 0 || size > MAX_FILE_BYTES
}

export async function handleAdminHomeworkFile(ctx) {
  const admin = requireAdmin(ctx)
  if (!admin.ok) return json(admin.status, { error: admin.error })
  try {
    if (ctx.method === 'DELETE') {
      const data = await loadClassroom()
      const found = findFile(data, String(ctx.body?.fileId || ''))
      if (!found) return json(404, { error: 'That file was not found.' })
      await deleteFileBytes(found.file.pathname)
      found.homework.files = found.homework.files.filter((file) => file.id !== found.file.id)
      found.homework.updatedAt = new Date().toISOString()
      await saveClassroom(data)
      return json(200, { ok: true })
    }

    if (ctx.method !== 'POST') return json(405, { error: 'Use POST or DELETE.' })

    if (ctx.body?.prepare) return prepareFile(ctx)
    if (ctx.body?.complete) return completeFile(ctx)
    return saveMultipart(ctx)
  } catch (error) {
    return failure(error)
  }
}

async function prepareFile(ctx) {
  const data = await loadClassroom()
  const homework = data.homework.find((item) => item.id === ctx.body?.homeworkId)
  if (!homework) return json(404, { error: 'That homework was not found.' })
  const kept = homework.files.filter((file) => !file.pending)
  if (kept.length >= MAX_FILES) return json(400, { error: 'That homework already has 8 files.' })
  const upload = normalizeUpload(ctx.body?.name, ctx.body?.contentType)
  if (upload.error) return json(400, { error: upload.error })
  const size = Number(ctx.body?.size)
  if (tooBig(size)) return json(400, { error: 'That file is too big. Keep it under 12 MB.' })
  const file = {
    id: newId(),
    name: upload.name,
    contentType: upload.contentType,
    size,
    pathname: '',
    pending: true,
    createdAt: new Date().toISOString(),
  }
  file.pathname = filePath(file.id, file.name)
  homework.files.push(file)
  homework.updatedAt = file.createdAt
  await saveClassroom(data)
  return json(200, {
    mode: 'blob',
    fileId: file.id,
    access: (await import('./store.js')).blobAccess(),
  })
}

async function completeFile(ctx) {
  const data = await loadClassroom()
  const found = findFile(data, String(ctx.body?.fileId || ''))
  if (!found) return json(404, { error: 'That file was not found.' })
  let stored = await readFileBytes(found.file.pathname)
  if (!stored) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    stored = await readFileBytes(found.file.pathname)
  }
  if (!stored) return json(400, { error: 'The upload did not finish. Try that file again.' })
  if (stored.bytes.length > MAX_FILE_BYTES) {
    await deleteFileBytes(found.file.pathname)
    found.homework.files = found.homework.files.filter((file) => file.id !== found.file.id)
    await saveClassroom(data)
    return json(400, { error: 'That file is too big. Keep it under 12 MB.' })
  }
  found.file.pending = false
  found.file.size = stored.bytes.length
  if (stored.contentType) found.file.contentType = stored.contentType.split(';')[0].trim() || found.file.contentType
  found.homework.updatedAt = new Date().toISOString()
  await saveClassroom(data)
  return json(200, { file: adminFile(found.file) })
}

async function saveMultipart(ctx) {
  const parts = parseMultipart(ctx.rawBody, ctx.contentType)
  const homeworkId = fieldText(parts, 'homeworkId')
  const fileId = fieldText(parts, 'fileId')
  const filePart = parts.find((part) => part.name === 'file')
  if (!filePart || !filePart.data?.length) return json(400, { error: 'Choose a file.' })
  const mode = storeMode()
  const limit = mode === 'blob' ? SERVER_UPLOAD_MAX : MAX_FILE_BYTES
  if (filePart.data.length > limit) {
    return json(400, {
      error:
        mode === 'blob'
          ? 'That photo is over 4 MB, so this phone sends it straight to storage. Try again.'
          : 'That file is too big. Keep it under 12 MB.',
    })
  }
  const data = await loadClassroom()
  const now = new Date().toISOString()
  if (fileId) {
    const found = findFile(data, fileId)
    if (!found || !found.file.pending) return json(404, { error: 'That file is not waiting for an upload.' })
    await writeFileBytes(found.file.pathname, filePart.data, found.file.contentType)
    found.file.pending = false
    found.file.size = filePart.data.length
    found.homework.updatedAt = now
    await saveClassroom(data)
    return json(200, { file: adminFile(found.file) })
  }
  const homework = data.homework.find((item) => item.id === homeworkId)
  if (!homework) return json(404, { error: 'That homework was not found.' })
  if (homework.files.filter((file) => !file.pending).length >= MAX_FILES) {
    return json(400, { error: 'That homework already has 8 files.' })
  }
  const upload = normalizeUpload(filePart.filename || 'file', filePart.contentType)
  if (upload.error) return json(400, { error: upload.error })
  const file = {
    id: newId(),
    name: upload.name,
    contentType: upload.contentType,
    size: filePart.data.length,
    pathname: '',
    pending: false,
    createdAt: now,
  }
  file.pathname = filePath(file.id, file.name)
  await writeFileBytes(file.pathname, filePart.data, file.contentType)
  homework.files.push(file)
  homework.updatedAt = now
  await saveClassroom(data)
  return json(201, { file: adminFile(file) })
}

function fieldText(parts, name) {
  const part = parts.find((item) => item.name === name && !item.filename)
  return part ? part.data.toString('utf8').trim() : ''
}

export async function handleBlobUpload(ctx) {
  const admin = requireAdmin(ctx)
  if (!admin.ok) return json(admin.status, { error: admin.error })
  if (ctx.method !== 'POST') return json(405, { error: 'Use POST.' })
  try {
    const data = await loadClassroom()
    const found = findFile(data, String(ctx.body?.fileId || ''))
    if (!found || !found.file.pending) return json(404, { error: 'That file is not waiting for an upload.' })
    const { issueSignedToken, parseStoreIdFromDelegationToken, presignUrl } = await import('@vercel/blob')
    const { blobAccess } = await import('./store.js')
    const access = blobAccess()
    const signed = await issueSignedToken({
      pathname: found.file.pathname,
      operations: ['put'],
      allowedContentTypes: [found.file.contentType],
      maximumSizeInBytes: MAX_FILE_BYTES,
    })
    const presigned = await presignUrl(
      { clientSigningToken: signed.clientSigningToken, delegationToken: signed.delegationToken },
      {
        access,
        operation: 'put',
        pathname: found.file.pathname,
        allowedContentTypes: [found.file.contentType],
        maximumSizeInBytes: MAX_FILE_BYTES,
        addRandomSuffix: false,
        allowOverwrite: true,
      },
    )
    return json(200, {
      uploadUrl: presigned.presignedUrl,
      access,
      contentType: found.file.contentType,
      storeId: parseStoreIdFromDelegationToken(signed.delegationToken),
    })
  } catch (error) {
    return failure(error)
  }
}

export async function handleStudentAccess(ctx) {
  if (ctx.method !== 'GET') return json(405, { error: 'Use GET.' })
  const student = await requireStudent(ctx)
  if (!student.ok) return json(student.status, { error: student.error })
  return json(200, { courseAccess: Boolean(student.homeworkAccess) })
}

export async function handleStudentMaterial(ctx) {
  if (ctx.method !== 'GET') return json(405, { error: 'Use GET.' })
  const student = await requireStudent(ctx)
  if (!student.ok) return json(student.status, { error: student.error })
  if (!student.homeworkAccess) return json(403, { error: COURSE_CLOSED })
  try {
    const sheet = await readWeekSheet(ctx.query?.id)
    if (!sheet) return json(404, { error: 'That file was not found.' })
    return {
      status: 200,
      bytes: sheet.bytes,
      headers: attachmentHeaders({
        name: sheet.name,
        bytes: sheet.bytes,
        contentType: 'application/pdf',
      }),
    }
  } catch (error) {
    return failure(error)
  }
}

export async function handleStudentNotices(ctx) {
  if (ctx.method !== 'GET') return json(405, { error: 'Use GET.' })
  const student = await requireStudent(ctx)
  if (!student.ok) return json(student.status, { error: student.error })
  try {
    const data = await loadClassroom()
    const course = courseForCode(data, student.code)
    return json(200, {
      course: course ? publicCourse(course) : null,
      notices: noticesForCourse(data, course?.id || '').map((item) => ({
        ...presentNotice(item),
        audience: item.courseId ? course?.name || '' : '',
      })),
    })
  } catch (error) {
    return failure(error)
  }
}

export async function handleStudentHomework(ctx) {
  if (ctx.method !== 'GET') return json(405, { error: 'Use GET.' })
  const student = await requireStudent(ctx)
  if (!student.ok) return json(student.status, { error: student.error })
  if (!student.homeworkAccess) return json(403, { error: COURSE_CLOSED })
  try {
    const data = await loadClassroom()
    const course = courseForCode(data, student.code)
    if (!course) return json(200, { course: null, weeks: [] })
    const hrefFor = (fileId) => studentHref(fileId, student.code)
    return json(200, {
      course: publicCourse(course),
      weeks: homeworkWeeks(data, course).map((week) => ({
        week: week.week,
        items: week.items.map((item) => presentHomework(item, hrefFor)),
      })),
    })
  } catch (error) {
    return failure(error)
  }
}

export async function handleStudentFile(ctx) {
  if (ctx.method !== 'GET') return json(405, { error: 'Use GET.' })
  const student = await requireStudent(ctx)
  if (!student.ok) return json(student.status, { error: student.error })
  if (!student.homeworkAccess) return json(403, { error: COURSE_CLOSED })
  try {
    const data = await loadClassroom()
    const found = findFile(data, String(ctx.query?.id || ''))
    const course = courseForCode(data, student.code)
    if (!found || found.file.pending || !course || found.homework.courseId !== course.id) {
      return json(404, { error: 'That file was not found.' })
    }
    return sendStoredFile(found.file)
  } catch (error) {
    return failure(error)
  }
}

export async function handleAdminFile(ctx) {
  if (ctx.method !== 'GET') return json(405, { error: 'Use GET.' })
  const id = String(ctx.query?.id || '')
  if (!verifyFileGrant(id, ctx.query?.exp, ctx.query?.sig)) {
    return json(401, { error: 'Unlock admin first.' })
  }
  try {
    const data = await loadClassroom()
    const found = findFile(data, id)
    if (!found || found.file.pending) return json(404, { error: 'That file was not found.' })
    return sendStoredFile(found.file)
  } catch (error) {
    return failure(error)
  }
}

async function sendStoredFile(file) {
  const stored = await readFileBytes(file.pathname)
  if (!stored) return json(404, { error: 'That file was not found.' })
  return {
    status: 200,
    bytes: stored.bytes,
    headers: attachmentHeaders({ ...file, bytes: stored.bytes, contentType: file.contentType }),
  }
}
