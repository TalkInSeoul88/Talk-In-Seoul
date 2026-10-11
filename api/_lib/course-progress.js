/** Step lists keyed by course id. Add `intermediate-1` when that class exists. */
export const COURSE_PROGRESS = {
  beginner: [
    {
      id: 'taste-day',
      title: 'Taste Korean Day',
      learn: 'First meet + hello. 저는 ___예요. (jeo-neun ___ ye-yo)',
    },
    {
      id: 'week-1',
      title: 'Week 1',
      learn: 'Hello + vowels. 안녕하세요. (an-nyeong-ha-se-yo)',
    },
    {
      id: 'week-2',
      title: 'Week 2',
      learn: 'First consonants. 감사합니다. (gam-sa-ham-ni-da)',
    },
    {
      id: 'week-3',
      title: 'Week 3',
      learn: 'More consonants. 이거 주세요. (i-geo ju-se-yo)',
    },
    {
      id: 'week-4',
      title: 'Week 4',
      learn: 'Tight sounds + halfway check. 얼마예요? (eol-ma-ye-yo)',
    },
    {
      id: 'week-5',
      title: 'Week 5',
      learn: 'Glued vowels. 커피 주세요. (keo-pi ju-se-yo)',
    },
    {
      id: 'week-6',
      title: 'Week 6',
      learn: 'Bottom sounds + store labels. 맛있어요! (ma-si-sseo-yo)',
    },
    {
      id: 'week-7',
      title: 'Week 7',
      learn: 'Numbers + spicy? 김밥 하나 주세요. (gim-bap ha-na ju-se-yo)',
    },
    {
      id: 'week-8',
      title: 'Week 8',
      learn: 'Your first conversation. 안녕히 계세요. (an-nyeong-hi gye-se-yo)',
    },
  ],
}

function nameKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function stepsForCourse(course) {
  if (!course) return []
  if (Array.isArray(COURSE_PROGRESS[course.id])) return COURSE_PROGRESS[course.id]
  const steps = COURSE_PROGRESS[nameKey(course.name)]
  return Array.isArray(steps) ? steps : []
}

/** Steps from the start of the list through the class position, inclusive. */
export function coveredThrough(steps, classAt) {
  const index = steps.findIndex((step) => step.id === classAt)
  if (index < 0) return []
  return steps.slice(0, index + 1)
}
