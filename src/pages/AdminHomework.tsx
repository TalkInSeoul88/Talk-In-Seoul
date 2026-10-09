import { useEffect, useMemo, useState, type FormEvent } from 'react'
import AdminGate from '../components/AdminGate'
import { formatExpiry } from '../lib/enrollment.ts'
import { formatSize, readError } from '../lib/http.ts'
import { uploadHomeworkFile } from '../lib/upload-file.ts'

type Course = { id: string; name: string; weeks: number }
type HomeworkFile = {
  id: string
  name: string
  kind: string
  size: number
  href: string
  pending?: boolean
}
type HomeworkItem = {
  id: string
  courseId: string
  week: number
  title: string
  instructions: string
  dueDate: string | null
  files: HomeworkFile[]
}

const ACCEPT = 'application/pdf,image/*,.pdf,.png,.jpg,.jpeg,.webp,.gif,.heic,.heif'

export default function AdminHomework() {
  return <AdminGate>{(token) => <HomeworkEditor token={token} />}</AdminGate>
}

function HomeworkEditor({ token }: { token: string }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [homework, setHomework] = useState<HomeworkItem[]>([])
  const [store, setStore] = useState('file')
  const [serverUploadMax, setServerUploadMax] = useState(4 * 1024 * 1024)
  const [courseId, setCourseId] = useState('')
  const [week, setWeek] = useState(1)
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileKey, setFileKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  const course = courses.find((item) => item.id === courseId) || courses[0]
  const weeks = course?.weeks || 8
  const visible = useMemo(
    () => homework.filter((item) => item.courseId === (course?.id || '')),
    [homework, course?.id],
  )

  async function load() {
    const response = await fetch('/api/admin/homework', { headers: { Authorization: `Bearer ${token}` } })
    if (response.status === 401) {
      setError('Unlock admin again.')
      return
    }
    if (!response.ok) throw new Error(await readError(response))
    const payload = (await response.json()) as {
      courses: Course[]
      homework: HomeworkItem[]
      store: string
      serverUploadMax: number
    }
    setCourses(payload.courses)
    setHomework(payload.homework)
    setStore(payload.store)
    setServerUploadMax(payload.serverUploadMax)
    setCourseId((current) => current || payload.courses.find((item) => item.id === 'beginner')?.id || payload.courses[0]?.id || '')
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        await load()
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load homework.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // load uses the unlock token from this session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!course) return
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/homework', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          week,
          title,
          instructions,
          dueDate: dueDate || null,
        }),
      })
      if (!response.ok) {
        setError(await readError(response))
        return
      }
      const payload = (await response.json()) as { homework: HomeworkItem }
      for (let index = 0; index < files.length; index += 1) {
        setStatus(`Saving file ${index + 1} of ${files.length}…`)
        await uploadHomeworkFile({
          token,
          homeworkId: payload.homework.id,
          file: files[index],
          store,
          serverUploadMax,
        })
      }
      setTitle('')
      setInstructions('')
      setDueDate('')
      setFiles([])
      setFileKey((value) => value + 1)
      setStatus('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that homework.')
    } finally {
      setBusy(false)
      setStatus('')
    }
  }

  async function uploadOnto(item: HomeworkItem, list: FileList | null) {
    if (!list?.length) return
    setBusy(true)
    setError(null)
    try {
      const chosen = Array.from(list)
      for (let index = 0; index < chosen.length; index += 1) {
        setStatus(`Saving file ${index + 1} of ${chosen.length}…`)
        await uploadHomeworkFile({
          token,
          homeworkId: item.id,
          file: chosen[index],
          store,
          serverUploadMax,
        })
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that file.')
    } finally {
      setBusy(false)
      setStatus('')
    }
  }

  async function removeFile(fileId: string) {
    setError(null)
    const response = await fetch('/api/admin/homework-file', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
    })
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    await load()
  }

  async function removeHomework(item: HomeworkItem) {
    if (!window.confirm('Delete this homework? The files go away too.')) return
    setError(null)
    const response = await fetch('/api/admin/homework', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    })
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    await load()
  }

  async function saveEdit(item: HomeworkItem, next: { title: string; instructions: string; dueDate: string; week: number; courseId: string }) {
    const response = await fetch('/api/admin/homework', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, ...next, dueDate: next.dueDate || null }),
    })
    if (!response.ok) throw new Error(await readError(response))
    await load()
  }

  return (
    <>
      <header>
        <p className="kicker">Homework</p>
        <h2 className="page-title">New homework</h2>
        <p className="lede">Pick the class and the week, then add a PDF or a photo. Students open it on their phone.</p>
      </header>

      <form className="card" onSubmit={(event) => void onSubmit(event)}>
        <label className="field">
          <span>Course</span>
          <select
            value={course?.id || ''}
            onChange={(event) => {
              const next = courses.find((item) => item.id === event.target.value)
              setCourseId(event.target.value)
              if (next && week > next.weeks) setWeek(1)
            }}
          >
            {courses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Week</span>
          <select value={week} onChange={(event) => setWeek(Number(event.target.value))}>
            {Array.from({ length: weeks }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                Week {value}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Week 1 review" />
        </label>
        <label className="field">
          <span>Instructions</span>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Open the sheet and trace the letters."
          />
        </label>
        <label className="field">
          <span>Due date (optional)</span>
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <label className="field">
          <span>Files</span>
          <input
            key={fileKey}
            type="file"
            accept={ACCEPT}
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
          />
        </label>
        <p className="tiny">PDF or photo. Up to 12 MB each.</p>
        {files.length > 0 ? (
          <ul className="picked-files">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}`}>{file.name}</li>
            ))}
          </ul>
        ) : null}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={busy || !title.trim() || !instructions.trim() || !course}>
          {busy ? status || 'Saving…' : 'Create homework'}
        </button>
      </form>

      {loading ? <p className="tiny">Loading…</p> : null}
      {Array.from({ length: weeks }, (_, index) => index + 1).map((value) => {
        const items = visible.filter((item) => item.week === value)
        if (items.length === 0) return null
        return (
          <section key={value} className="week-block">
            <h2 className="section-title">
              {course?.name} · Week {value}
            </h2>
            {items.map((item) => (
              <HomeworkCard
                key={`${item.id}:${item.title}:${item.week}:${item.courseId}:${item.dueDate || ''}:${item.files.length}`}
                item={item}
                courses={courses}
                busy={busy}
                onUpload={(list) => uploadOnto(item, list)}
                onRemoveFile={(fileId) => void removeFile(fileId)}
                onDelete={() => void removeHomework(item)}
                onSave={(next) => saveEdit(item, next)}
              />
            ))}
          </section>
        )
      })}
    </>
  )
}

function HomeworkCard({
  item,
  courses,
  busy,
  onUpload,
  onRemoveFile,
  onDelete,
  onSave,
}: {
  item: HomeworkItem
  courses: Course[]
  busy: boolean
  onUpload: (list: FileList | null) => Promise<void>
  onRemoveFile: (fileId: string) => void
  onDelete: () => void
  onSave: (next: { title: string; instructions: string; dueDate: string; week: number; courseId: string }) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [instructions, setInstructions] = useState(item.instructions)
  const [dueDate, setDueDate] = useState(item.dueDate || '')
  const [week, setWeek] = useState(item.week)
  const [courseId, setCourseId] = useState(item.courseId)
  const [saving, setSaving] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const course = courses.find((entry) => entry.id === courseId)

  return (
    <article className="card homework-card">
      {editing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setSaving(true)
            setCardError(null)
            void onSave({ title, instructions, dueDate, week, courseId })
              .then(() => setEditing(false))
              .catch((err: unknown) => setCardError(err instanceof Error ? err.message : 'Could not save.'))
              .finally(() => setSaving(false))
          }}
        >
          <label className="field">
            <span>Course</span>
            <select
              value={courseId}
              onChange={(event) => {
                setCourseId(event.target.value)
                const next = courses.find((entry) => entry.id === event.target.value)
                if (next && week > next.weeks) setWeek(1)
              }}
            >
              {courses.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Week</span>
            <select value={week} onChange={(event) => setWeek(Number(event.target.value))}>
              {Array.from({ length: course?.weeks || 1 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  Week {value}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Instructions</span>
            <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} />
          </label>
          <label className="field">
            <span>Due date (optional)</span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          {cardError && (
            <p className="form-error" role="alert">
              {cardError}
            </p>
          )}
          <div className="action-row">
            <button className="btn" type="submit" disabled={saving || busy}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn secondary" type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2>{item.title}</h2>
          {item.dueDate ? <p className="tiny">Due {formatExpiry(item.dueDate)}</p> : null}
          <p className="notice-body">{item.instructions}</p>
        </>
      )}

      <div className="file-list">
        {item.files.map((file) => (
          <div key={file.id} className="file-row">
            {file.pending || !file.href ? (
              <p className="tiny">Upload did not finish · {file.name}</p>
            ) : (
              <a className="file-link" href={file.href} target="_blank" rel="noreferrer">
                <span>
                  <strong>{file.name}</strong>
                  <span className="tiny">
                    {file.kind} · {formatSize(file.size)} · Open
                  </span>
                </span>
                <span className="material-kind">{file.kind}</span>
              </a>
            )}
            <button className="text-btn" type="button" onClick={() => onRemoveFile(file.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <label className="field">
        <span>Add a file</span>
        <input
          type="file"
          accept={ACCEPT}
          multiple
          disabled={busy}
          onChange={(event) => {
            const list = event.target.files
            event.target.value = ''
            void onUpload(list)
          }}
        />
      </label>
      {!editing ? (
        <div className="action-row">
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              setTitle(item.title)
              setInstructions(item.instructions)
              setDueDate(item.dueDate || '')
              setWeek(item.week)
              setCourseId(item.courseId)
              setEditing(true)
            }}
          >
            Edit
          </button>
          <button className="btn secondary" type="button" onClick={onDelete}>
            Delete
          </button>
        </div>
      ) : null}
    </article>
  )
}
