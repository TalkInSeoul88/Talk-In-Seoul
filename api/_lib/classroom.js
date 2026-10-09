import { randomUUID } from 'node:crypto'

export const BEGINNER_COURSE_ID = 'beginner'
export const MIN_WEEKS = 1
export const MAX_WEEKS = 52
export const MAX_FILES = 8

export function emptyClassroom(now = new Date().toISOString()) {
  return {
    version: 1,
    courses: [
      {
        id: BEGINNER_COURSE_ID,
        name: 'Beginner',
        weeks: 8,
        createdAt: now,
        updatedAt: now,
      },
    ],
    notices: [],
    homework: [],
    codeCourses: {},
  }
}

export function newId() {
  return randomUUID()
}

export function readWeeks(value) {
  const weeks = typeof value === 'number' ? value : Number(String(value ?? '').trim())
  if (!Number.isInteger(weeks) || weeks < MIN_WEEKS || weeks > MAX_WEEKS) {
    return { error: 'Weeks must be a whole number from 1 to 52.' }
  }
  return { weeks }
}

export function validateCourseName(name, courses, ignoreId = '') {
  const text = String(name ?? '').trim().replace(/\s+/g, ' ')
  if (!text) return { error: 'Add a course name.' }
  if (text.length > 40) return { error: 'Course name is too long.' }
  const clash = courses.find((item) => item.id !== ignoreId && item.name.toLowerCase() === text.toLowerCase())
  if (clash) return { error: 'A course with that name already exists.' }
  return { name: text }
}

export function validateDay(value, required) {
  const text = String(value ?? '').trim()
  if (!text) return required ? { error: 'Pick a date.' } : { day: null }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return { error: 'Use a real date.' }
  const [year, month, day] = text.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    return { error: 'Use a real date.' }
  }
  return { day: text }
}

function readBodyText(value, max, emptyError, tooLong) {
  const text = String(value ?? '').replace(/\r\n/g, '\n').trim()
  if (!text) return { error: emptyError }
  if (text.length > max) return { error: tooLong }
  return { text }
}

export function courseById(data, id) {
  return data.courses.find((item) => item.id === id) || null
}

export function courseForCode(data, code) {
  const mappedId = data.codeCourses?.[code]
  const mapped = mappedId ? courseById(data, mappedId) : null
  if (mapped) return mapped
  return (
    courseById(data, BEGINNER_COURSE_ID) ||
    data.courses.find((item) => item.name.toLowerCase() === 'beginner') ||
    data.courses[0] ||
    null
  )
}

export function sortNotices(notices) {
  return [...notices].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export function noticesForCourse(data, courseId) {
  return sortNotices(
    data.notices.filter((item) => item.courseId === null || item.courseId === courseId),
  )
}

export function homeworkWeeks(data, course) {
  const items = data.homework.filter((item) => item.courseId === course.id)
  const weeks = []
  for (let week = 1; week <= course.weeks; week += 1) {
    weeks.push({
      week,
      items: items
        .filter((item) => item.week === week)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    })
  }
  return weeks
}

export function findFile(data, fileId) {
  for (const homework of data.homework) {
    const file = homework.files.find((item) => item.id === fileId)
    if (file) return { homework, file }
  }
  return null
}

export function fileKind(contentType) {
  if (contentType === 'application/pdf') return 'PDF'
  if (String(contentType || '').startsWith('image/')) return 'Photo'
  return 'File'
}

export function publicCourse(course) {
  return { id: course.id, name: course.name, weeks: course.weeks }
}

export function validateNotice(input, courses) {
  const title = readBodyText(input.title, 80, 'Add a title.', 'Title is too long.')
  if (title.error) return title
  const body = readBodyText(input.body, 2000, 'Add a message.', 'Message is too long.')
  if (body.error) return body
  const date = validateDay(input.date, true)
  if (date.error) return date
  const pinned = input.pinned === true
  let courseId = null
  if (input.courseId) {
    const course = courseById({ courses }, input.courseId)
    if (!course) return { error: 'Pick a course, or choose all students.' }
    courseId = course.id
  }
  return {
    value: { title: title.text, body: body.text, date: date.day, pinned, courseId },
  }
}

export function validateHomework(input, courses) {
  const course = courseById({ courses }, input.courseId)
  if (!course) return { error: 'Pick a course.' }
  const week = readWeeks(input.week)
  if (week.error) return week
  if (week.weeks > course.weeks) {
    return { error: `${course.name} only has ${course.weeks} weeks.` }
  }
  const title = readBodyText(input.title, 80, 'Add a title.', 'Title is too long.')
  if (title.error) return title
  const instructions = readBodyText(
    input.instructions,
    4000,
    'Add instructions.',
    'Instructions are too long.',
  )
  if (instructions.error) return instructions
  const due = validateDay(input.dueDate, false)
  if (due.error) return due
  return {
    value: {
      courseId: course.id,
      week: week.weeks,
      title: title.text,
      instructions: instructions.text,
      dueDate: due.day,
    },
  }
}

export function highestHomeworkWeek(data, courseId) {
  return data.homework.reduce((max, item) => {
    if (item.courseId !== courseId) return max
    return Math.max(max, item.week)
  }, 0)
}
