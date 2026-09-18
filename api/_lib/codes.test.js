import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  chicagoToday,
  generateCode,
  isExpired,
  normalizeCode,
  redeemProblem,
  statusLabel,
  validateCodeFormat,
  validateExpiry,
} from './codes.js'

function code(partial) {
  return {
    code: 'POP-TEST',
    expiresAt: '2099-01-01',
    active: true,
    createdAt: '2026-09-18T00:00:00.000Z',
    ...partial,
  }
}

describe('access codes', () => {
  it('normalizes student input', () => {
    assert.equal(normalizeCode('  pop-4k9p  '), 'POP-4K9P')
    assert.equal(normalizeCode('pop 4k9p'), 'POP4K9P')
  })

  it('accepts store-owner friendly codes', () => {
    assert.equal(validateCodeFormat('POP-4K9P'), null)
    assert.equal(validateCodeFormat('SAT'), null)
    assert.notEqual(validateCodeFormat('hi'), null)
    assert.notEqual(validateCodeFormat('***'), null)
  })

  it('rejects bad expiry dates', () => {
    assert.equal(validateExpiry('2026-12-31'), null)
    assert.notEqual(validateExpiry('2026-13-40'), null)
    assert.notEqual(validateExpiry(''), null)
  })

  it('treats expiry as inclusive on the Chicago calendar', () => {
    const today = chicagoToday(new Date('2026-09-18T17:00:00Z'))
    assert.equal(isExpired(today, new Date('2026-09-18T17:00:00Z')), false)
    assert.equal(isExpired('2026-09-17', new Date('2026-09-18T17:00:00Z')), true)
  })

  it('generates unique POP- codes', () => {
    const used = new Set(['POP-AAAA'])
    const next = generateCode(used)
    assert.match(next, /^POP-[A-Z0-9]{4}$/)
    assert.equal(used.has(next), false)
  })

  it('blocks redeem for missing, stopped, and expired codes', () => {
    assert.equal(redeemProblem(undefined), 'That access code was not found.')
    assert.match(redeemProblem(code({ active: false })) ?? '', /stopped/)
    assert.match(redeemProblem(code({ expiresAt: '2020-01-01' })) ?? '', /expired/)
    assert.equal(redeemProblem(code({})), null)
  })

  it('labels expired ahead of the active toggle', () => {
    assert.equal(statusLabel(code({ expiresAt: '2020-01-01', active: true })), 'expired')
    assert.equal(statusLabel(code({ active: false })), 'stopped')
    assert.equal(statusLabel(code({})), 'active')
  })
})
