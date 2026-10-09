import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import {
  handleAdminCourses,
  handleAdminFile,
  handleAdminHomework,
  handleAdminHomeworkFile,
  handleAdminNotices,
  handleStudentFile,
  handleStudentHomework,
  handleStudentNotices,
} from './classroom-handlers.js'
import { COURSE_CLOSED } from './codes.js'
import { classroomRoot } from './classroom-store.js'
import { resetClassroomMemory } from './classroom-store.js'
import { resetMemoryFiles } from './files.js'
import { handleAdminCodes, handleAdminLogin } from './handlers.js'
import { resetMemoryStore } from './store.js'

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

function ctx(method, body = {}, header = () => '', extra = {}) {
  return { method, body, header, query: {}, rawBody: null, contentType: '', ...extra }
}

function multipart(fields, file) {
  const boundary = '----talkboundary'
  const chunks = [
    ...Object.entries(fields).map(([name, value]) =>
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`),
    ),
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n`,
    ),
    file.data,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]
  return {
    rawBody: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  }
}

describe('classroom notices and homework', () => {
  let auth = () => ''

  before(() => {
    process.env.ADMIN_PASSWORD = 'store-owner-secret'
    process.env.ACCESS_CODES_STORE = 'memory'
    delete process.env.BLOB_READ_WRITE_TOKEN
    delete process.env.BLOB_STORE_ID
    delete process.env.VERCEL
    delete process.env.VERCEL_ENV
  })

  beforeEach(async () => {
    delete process.env.VERCEL_ENV
    resetMemoryStore()
    resetClassroomMemory()
    resetMemoryFiles()
    const login = await handleAdminLogin(ctx('POST', { password: 'store-owner-secret' }))
    auth = () => `Bearer ${login.body.token}`
    await handleAdminCodes(ctx('POST', { code: 'POP-WEEK', expiresAt: '2099-12-31' }, auth))
    await handleAdminCodes(ctx('POST', { code: 'POP-NEXT', expiresAt: '2099-12-31' }, auth))
  })

  after(() => {
    delete process.env.ADMIN_PASSWORD
    delete process.env.ACCESS_CODES_STORE
    resetMemoryStore()
    resetClassroomMemory()
    resetMemoryFiles()
  })

  it('starts with a Beginner course of 8 weeks', async () => {
    const listed = await handleAdminCourses(ctx('GET', {}, auth))
    assert.equal(listed.status, 200)
    assert.equal(listed.body.courses.length, 1)
    assert.equal(listed.body.courses[0].id, 'beginner')
    assert.equal(listed.body.courses[0].name, 'Beginner')
    assert.equal(listed.body.courses[0].weeks, 8)
  })

  it('lets the teacher add a course and point a code at it', async () => {
    const created = await handleAdminCourses(ctx('POST', { name: 'Intermediate', weeks: 10 }, auth))
    assert.equal(created.status, 201)
    assert.equal(created.body.course.weeks, 10)

    const assigned = await handleAdminCourses(
      ctx('PATCH', { code: 'pop-next', courseId: created.body.course.id }, auth),
    )
    assert.equal(assigned.status, 200)
    assert.equal(assigned.body.courseId, created.body.course.id)

    const cleared = await handleAdminCourses(ctx('PATCH', { code: 'POP-NEXT', courseId: null }, auth))
    assert.equal(cleared.status, 200)
    assert.equal(cleared.body.courseId, null)
  })

  it('keeps the course when the expiry changes and drops it when the code is deleted', async () => {
    const created = await handleAdminCourses(ctx('POST', { name: 'Intermediate', weeks: 10 }, auth))
    const courseId = created.body.course.id
    await handleAdminCourses(ctx('PATCH', { code: 'POP-WEEK', courseId }, auth))
    await handleAdminCourses(ctx('PATCH', { code: 'POP-NEXT', courseId }, auth))

    const dated = await handleAdminCodes(ctx('PATCH', { code: 'POP-WEEK', expiresAt: '2031-06-01' }, auth))
    assert.equal(dated.status, 200)
    assert.equal(dated.body.code.expiresAt, '2031-06-01')

    const stopped = await handleAdminCodes(ctx('PATCH', { code: 'POP-WEEK', active: false }, auth))
    assert.equal(stopped.status, 200)
    assert.equal(stopped.body.code.active, false)

    let listed = await handleAdminCourses(ctx('GET', {}, auth))
    assert.equal(listed.body.codeCourses['POP-WEEK'], courseId)
    assert.equal(listed.body.codeCourses['POP-NEXT'], courseId)

    const removed = await handleAdminCodes(ctx('DELETE', { code: 'POP-NEXT' }, auth))
    assert.equal(removed.status, 200)
    listed = await handleAdminCourses(ctx('GET', {}, auth))
    assert.equal(listed.body.codeCourses['POP-NEXT'], undefined)
    assert.equal(listed.body.codeCourses['POP-WEEK'], courseId)

    const codes = await handleAdminCodes(ctx('GET', {}, auth))
    assert.equal(codes.body.codes.some((item) => item.code === 'POP-NEXT'), false)
    assert.equal(codes.body.codes.some((item) => item.code === 'POP-WEEK'), true)
  })

  it('rejects a week count that would hide homework', async () => {
    const created = await handleAdminHomework(
      ctx('POST', { courseId: 'beginner', week: 6, title: 'Review', instructions: 'Read page 1.', dueDate: '' }, auth),
    )
    assert.equal(created.status, 201)
    const shrunk = await handleAdminCourses(ctx('PATCH', { id: 'beginner', weeks: 4 }, auth))
    assert.equal(shrunk.status, 400)
    assert.match(shrunk.body.error, /Week 6/)
  })

  it('sorts pinned notices first and hides course notices from other classes', async () => {
    const course = await handleAdminCourses(ctx('POST', { name: 'Intermediate', weeks: 8 }, auth))
    const courseId = course.body.course.id
    await handleAdminNotices(
      ctx('POST', { title: 'Old', body: 'Bring a pencil.', date: '2026-10-01', pinned: false, courseId: null }, auth),
    )
    await handleAdminNotices(
      ctx(
        'POST',
        { title: 'Pinned', body: 'Class is at 10.', date: '2026-09-01', pinned: true, courseId: null },
        auth,
      ),
    )
    await handleAdminNotices(
      ctx(
        'POST',
        { title: 'Beginner only', body: 'Week 1 sheet.', date: '2026-10-09', pinned: false, courseId: 'beginner' },
        auth,
      ),
    )
    await handleAdminCourses(ctx('PATCH', { code: 'POP-NEXT', courseId }, auth))

    const beginner = await handleStudentNotices(ctx('GET', {}, () => '', { header: () => 'POP-WEEK' }))
    assert.equal(beginner.status, 200)
    assert.deepEqual(
      beginner.body.notices.map((item) => item.title),
      ['Pinned', 'Beginner only', 'Old'],
    )
    assert.equal(beginner.body.notices[0].pinned, true)

    const studentHeader = (name) => (name === 'x-access-code' ? 'POP-NEXT' : '')
    const other = await handleStudentNotices(ctx('GET', {}, studentHeader))
    assert.equal(other.body.course.name, 'Intermediate')
    assert.deepEqual(
      other.body.notices.map((item) => item.title),
      ['Pinned', 'Old'],
    )
  })

  it('serves week 1 homework files only to the matching course', async () => {
    const course = await handleAdminCourses(ctx('POST', { name: 'Intermediate', weeks: 6 }, auth))
    await handleAdminCourses(ctx('PATCH', { code: 'POP-NEXT', courseId: course.body.course.id }, auth))
    const homework = await handleAdminHomework(
      ctx(
        'POST',
        {
          courseId: 'beginner',
          week: 1,
          title: 'Week 1 review',
          instructions: 'Open the sheet and trace the letters.',
          dueDate: '2026-10-16',
        },
        auth,
      ),
    )
    const form = multipart(
      { homeworkId: homework.body.homework.id },
      { name: 'Week 1 review.png', type: 'image/png', data: PNG },
    )
    const uploaded = await handleAdminHomeworkFile(
      ctx('POST', {}, auth, { rawBody: form.rawBody, contentType: form.contentType }),
    )
    assert.equal(uploaded.status, 201)
    assert.equal(uploaded.body.file.name, 'Week 1 review.png')
    assert.equal(uploaded.body.file.kind, 'Photo')

    const listed = await handleStudentHomework(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-WEEK' : '')))
    assert.equal(listed.body.course.name, 'Beginner')
    assert.equal(listed.body.weeks.length, 8)
    assert.equal(listed.body.weeks[0].week, 1)
    assert.equal(listed.body.weeks[0].items[0].title, 'Week 1 review')
    assert.equal(listed.body.weeks[0].items[0].files[0].name, 'Week 1 review.png')

    const fileUrl = new URL(listed.body.weeks[0].items[0].files[0].href, 'http://localhost')
    const downloaded = await handleStudentFile(
      ctx('GET', {}, () => '', { query: Object.fromEntries(fileUrl.searchParams) }),
    )
    assert.equal(downloaded.status, 200)
    assert.equal(downloaded.bytes.length, PNG.length)
    assert.match(downloaded.headers['Content-Type'], /image\/png/)

    const other = await handleStudentHomework(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-NEXT' : '')))
    assert.equal(other.body.course.name, 'Intermediate')
    assert.equal(other.body.weeks[0].items.length, 0)
    const blocked = await handleStudentFile(
      ctx('GET', {}, () => '', {
        query: { id: uploaded.body.file.id, code: 'POP-NEXT' },
      }),
    )
    assert.equal(blocked.status, 404)
  })

  it('keeps practice and notices open when homework access is off', async () => {
    const homework = await handleAdminHomework(
      ctx('POST', { courseId: 'beginner', week: 1, title: 'Week 1 review', instructions: 'Trace.', dueDate: '' }, auth),
    )
    const form = multipart({ homeworkId: homework.body.homework.id }, { name: 'sheet.png', type: 'image/png', data: PNG })
    const uploaded = await handleAdminHomeworkFile(
      ctx('POST', {}, auth, { rawBody: form.rawBody, contentType: form.contentType }),
    )
    assert.equal(uploaded.status, 201)
    await handleAdminNotices(
      ctx('POST', { title: 'Saturday', body: 'See you at the store.', date: '2026-10-10', pinned: false, courseId: null }, auth),
    )

    const closed = await handleAdminCodes(ctx('PATCH', { code: 'POP-NEXT', homeworkAccess: false }, auth))
    assert.equal(closed.status, 200)
    assert.equal(closed.body.code.homeworkAccess, false)

    const notices = await handleStudentNotices(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-NEXT' : '')))
    assert.equal(notices.status, 200)
    assert.equal(notices.body.notices.some((item) => item.title === 'Saturday'), true)

    const listed = await handleStudentHomework(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-NEXT' : '')))
    assert.equal(listed.status, 403)
    assert.equal(listed.body.error, COURSE_CLOSED)

    const file = await handleStudentFile(
      ctx('GET', {}, () => '', { query: { id: uploaded.body.file.id, code: 'POP-NEXT' } }),
    )
    assert.equal(file.status, 403)
    assert.equal(file.body.error, COURSE_CLOSED)
    assert.equal(file.bytes, undefined)

    const access = await handleStudentNotices(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-NEXT' : '')))
    assert.equal(access.status, 200)
    assert.equal(access.body.courseAccess, false)
    const openAccess = await handleStudentNotices(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-WEEK' : '')))
    assert.equal(openAccess.body.courseAccess, true)

    const sheet = await handleStudentFile(
      ctx('GET', {}, () => '', { query: { sheet: 'week-1-consonant-writing', code: 'POP-NEXT' } }),
    )
    assert.equal(sheet.status, 403)
    assert.equal(sheet.body.error, COURSE_CLOSED)
    assert.equal(sheet.bytes, undefined)
    const guessed = await handleStudentFile(
      ctx('GET', {}, () => '', { query: { sheet: 'week-1-word-writing' } }),
    )
    assert.equal(guessed.status, 401)
    assert.equal(guessed.bytes, undefined)
    const opened = await handleStudentFile(
      ctx('GET', {}, () => '', { query: { sheet: 'week-1-consonant-writing', code: 'POP-WEEK' } }),
    )
    assert.equal(opened.status, 200)
    assert.equal(Buffer.from(opened.bytes).subarray(0, 5).toString(), '%PDF-')

    const open = await handleStudentHomework(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-WEEK' : '')))
    assert.equal(open.status, 200)
    assert.equal(open.body.weeks[0].items[0].files[0].name, 'sheet.png')
  })

  it('edits and deletes a notice, and blocks a missing code', async () => {
    const created = await handleAdminNotices(
      ctx('POST', { title: 'Hello', body: 'See you Saturday.', date: '2026-10-10', pinned: false }, auth),
    )
    const edited = await handleAdminNotices(
      ctx('PATCH', { id: created.body.notice.id, title: 'Hello class', pinned: true }, auth),
    )
    assert.equal(edited.status, 200)
    assert.equal(edited.body.notice.title, 'Hello class')
    assert.equal(edited.body.notice.pinned, true)
    const removed = await handleAdminNotices(ctx('DELETE', { id: created.body.notice.id }, auth))
    assert.equal(removed.status, 200)
    const locked = await handleStudentNotices(ctx('GET'))
    assert.equal(locked.status, 401)
    const stopped = await handleAdminCodes(ctx('PATCH', { code: 'POP-WEEK', active: false }, auth))
    assert.equal(stopped.status, 200)
    const denied = await handleStudentHomework(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-WEEK' : '')))
    assert.equal(denied.status, 401)
  })

  it('removes a file and keeps preview files in their own folder', async () => {
    const homework = await handleAdminHomework(
      ctx('POST', { courseId: 'beginner', week: 1, title: 'Sheet', instructions: 'Look at the picture.', dueDate: null }, auth),
    )
    const form = multipart({ homeworkId: homework.body.homework.id }, { name: 'sheet.pdf', type: 'application/pdf', data: Buffer.from('%PDF-1.4') })
    const uploaded = await handleAdminHomeworkFile(
      ctx('POST', {}, auth, { rawBody: form.rawBody, contentType: form.contentType }),
    )
    const open = new URL(uploaded.body.file.href, 'http://localhost')
    const adminOpen = await handleAdminFile(ctx('GET', {}, () => '', { query: Object.fromEntries(open.searchParams) }))
    assert.equal(adminOpen.status, 200)
    const removed = await handleAdminHomeworkFile(ctx('DELETE', { fileId: uploaded.body.file.id }, auth))
    assert.equal(removed.status, 200)
    const gone = await handleAdminFile(ctx('GET', {}, () => '', { query: Object.fromEntries(open.searchParams) }))
    assert.equal(gone.status, 404)

    process.env.VERCEL_ENV = 'preview'
    assert.equal(classroomRoot(), 'talk-in-seoul/preview')
    delete process.env.VERCEL_ENV
    assert.equal(classroomRoot(), 'talk-in-seoul')
  })
})
