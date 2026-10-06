import test from 'node:test'
import assert from 'node:assert/strict'
import { computeStatus } from '../src/lib/status.ts'
import type { Requirement } from '../src/lib/types.ts'

const reqMandatoryWithExpiry: Requirement = {
  id: 'R01',
  order: 1,
  title_en: 'Trade License',
  title_bn: 'ট্রেড লাইসেন্স',
  mandatory: true,
  has_expiry: true,
}

const reqMandatoryNoExpiry: Requirement = {
  id: 'R02',
  order: 2,
  title_en: 'TIN Certificate',
  title_bn: 'টিআইএন সনদ',
  mandatory: true,
  has_expiry: false,
}

const reqOptionalWithExpiry: Requirement = {
  id: 'R07',
  order: 7,
  title_en: "Manufacturer's Authorization",
  title_bn: 'প্রস্তুতকারকের অনুমোদনপত্র',
  mandatory: false,
  has_expiry: true,
}

const reqOptionalNoExpiry: Requirement = {
  id: 'R06',
  order: 6,
  title_en: 'Audited Financial Statement',
  title_bn: 'নিরীক্ষিত আর্থিক বিবরণী',
  mandatory: false,
  has_expiry: false,
}

const deadline = '2026-10-20'

test('computeStatus: unmatched mandatory is MISSING and blocking', () => {
  const result = computeStatus(reqMandatoryNoExpiry, null, undefined, deadline)
  assert.equal(result.status, 'MISSING')
  assert.equal(result.blocking, true)
})

test('computeStatus: unmatched optional is NOT_PROVIDED and non-blocking', () => {
  const result = computeStatus(reqOptionalNoExpiry, null, undefined, deadline)
  assert.equal(result.status, 'NOT_PROVIDED')
  assert.equal(result.blocking, false)
})

test('computeStatus: matched req needing expiry with empty expiry is EXPIRY_NEEDED and blocking', () => {
  const result = computeStatus(reqMandatoryWithExpiry, 'file-1', '', deadline)
  assert.equal(result.status, 'EXPIRY_NEEDED')
  assert.equal(result.blocking, true)
})

test('computeStatus: matched req with expiry before deadline is EXPIRED and blocking', () => {
  const result = computeStatus(reqMandatoryWithExpiry, 'file-1', '2025-06-30', deadline)
  assert.equal(result.status, 'EXPIRED')
  assert.equal(result.blocking, true)
})

test('computeStatus: matched req with expiry on deadline day is OK and non-blocking', () => {
  const result = computeStatus(reqMandatoryWithExpiry, 'file-1', '2026-10-20', deadline)
  assert.equal(result.status, 'OK')
  assert.equal(result.blocking, false)
})

test('computeStatus: matched req with expiry after deadline is OK and non-blocking', () => {
  const result = computeStatus(reqMandatoryWithExpiry, 'file-1', '2027-06-30', deadline)
  assert.equal(result.status, 'OK')
  assert.equal(result.blocking, false)
})

test('computeStatus: matched optional req with expired date still blocks', () => {
  const result = computeStatus(reqOptionalWithExpiry, 'file-2', '2025-01-01', deadline)
  assert.equal(result.status, 'EXPIRED')
  assert.equal(result.blocking, true)
})
