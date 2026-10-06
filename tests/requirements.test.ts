import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parseRequirements } from '../src/lib/requirements.ts'

test('parseRequirements parses official sample requirements.json correctly', () => {
  const json = fs.readFileSync('docs/problem-pack/sample-pack/requirements.json', 'utf8')
  const result = parseRequirements(json)

  assert.equal(result.success, true)
  assert.ok(result.data)
  assert.equal(result.data.tender.tender_id, 'T-2026-0417')
  assert.equal(result.data.tender.submission_deadline, '2026-10-20')
  assert.equal(result.data.requirements.length, 10)

  // Verify sorted by order
  for (let i = 0; i < result.data.requirements.length - 1; i++) {
    assert.ok(result.data.requirements[i].order <= result.data.requirements[i + 1].order)
  }
})

test('parseRequirements catches invalid JSON string', () => {
  const result = parseRequirements('{ invalid json')
  assert.equal(result.success, false)
  assert.ok(result.error?.en.includes('Invalid JSON'))
  assert.ok(result.error?.bn)
})

test('parseRequirements catches missing tender fields', () => {
  const result = parseRequirements(JSON.stringify({
    tender: { tender_id: 'T-1' },
    requirements: []
  }))
  assert.equal(result.success, false)
  assert.ok(result.error?.en)
  assert.ok(result.error?.bn)
})

test('parseRequirements catches invalid submission_deadline', () => {
  const result = parseRequirements(JSON.stringify({
    tender: {
      tender_id: 'T-1',
      title: 'Test',
      procuring_entity: 'Gov',
      bidder: 'Bidder Inc',
      submission_deadline: '20-10-2026' // Not YYYY-MM-DD
    },
    requirements: [
      { id: 'R01', order: 1, title_en: 'A', title_bn: 'ক', mandatory: true, has_expiry: false }
    ]
  }))
  assert.equal(result.success, false)
  assert.ok(result.error?.en.includes('submission_deadline'))
})

test('parseRequirements catches duplicate requirement ID', () => {
  const result = parseRequirements(JSON.stringify({
    tender: {
      tender_id: 'T-1',
      title: 'Test',
      procuring_entity: 'Gov',
      bidder: 'Bidder Inc',
      submission_deadline: '2026-10-20'
    },
    requirements: [
      { id: 'R01', order: 1, title_en: 'A', title_bn: 'ক', mandatory: true, has_expiry: false },
      { id: 'R01', order: 2, title_en: 'B', title_bn: 'খ', mandatory: true, has_expiry: false }
    ]
  }))
  assert.equal(result.success, false)
  assert.ok(result.error?.en.includes('Duplicate requirement ID'))
})
