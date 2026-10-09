import { readError } from './http.ts'

type UploadOptions = {
  token: string
  homeworkId: string
  file: File
  store: string
  serverUploadMax: number
}

export async function uploadHomeworkFile({ token, homeworkId, file, store, serverUploadMax }: UploadOptions) {
  const direct = store !== 'blob' || file.size <= serverUploadMax
  if (direct) {
    const body = new FormData()
    body.append('homeworkId', homeworkId)
    body.append('file', file)
    const response = await fetch('/api/admin/homework-file', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    if (!response.ok) throw new Error(await readError(response))
    return
  }

  const prepared = await fetch('/api/admin/homework-file', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prepare: true,
      homeworkId,
      name: file.name,
      contentType: file.type,
      size: file.size,
    }),
  })
  if (!prepared.ok) throw new Error(await readError(prepared))
  const prep = (await prepared.json()) as { fileId: string }

  const ticket = await fetch('/api/admin/blob-upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId: prep.fileId }),
  })
  if (!ticket.ok) throw new Error(await readError(ticket))
  const upload = (await ticket.json()) as {
    uploadUrl: string
    access: string
    contentType: string
    storeId: string
  }

  let put: Response
  try {
    put = await fetch(upload.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'x-api-version': '12',
        'x-vercel-blob-access': upload.access,
        'x-content-type': upload.contentType,
        'x-vercel-blob-store-id': upload.storeId,
        'x-content-length': String(file.size),
      },
    })
  } catch {
    throw new Error('Could not upload that file. Check wifi, then try again.')
  }
  if (!put.ok) throw new Error('Could not upload that file. Check wifi, then try again.')

  const done = await fetch('/api/admin/homework-file', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ complete: true, fileId: prep.fileId }),
  })
  if (!done.ok) throw new Error(await readError(done))
}
