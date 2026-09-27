import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('trace-success.mp3 is a real doorbell file', () => {
  const file = new URL('../../public/audio/trace-success.mp3', import.meta.url)
  const bytes = readFileSync(file)
  assert.ok(bytes.length > 4000, `expected a real mp3, got ${bytes.length} bytes`)
  const id3 = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33
  const frame = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0
  assert.ok(id3 || frame, 'file does not start like an mp3')
})
