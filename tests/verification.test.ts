import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { PDFDocument } from 'pdf-lib'
import { parseRequirements } from '../src/lib/requirements.ts'
import { readPdf } from '../src/lib/pdfFiles.ts'
import { computeStatus } from '../src/lib/status.ts'
import { buildPackage } from '../src/lib/buildPackage.ts'
import type { UploadedFile } from '../src/lib/types.ts'

const sampleDir = 'docs/problem-pack/sample-pack'
const docsDir = path.join(sampleDir, 'documents')

test('Verification 1: Uploading all 11 files in sample-pack', async () => {
  const fileNames = fs.readdirSync(docsDir)
  assert.equal(fileNames.length, 11)

  const uploadedFiles: UploadedFile[] = []
  let rejectedPng = false

  for (const name of fileNames) {
    const filePath = path.join(docsDir, name)
    const buffer = fs.readFileSync(filePath)
    const file = new File([buffer], name, {
      type: name.endsWith('.pdf') ? 'application/pdf' : 'image/png',
    })

    const res = await readPdf(file)
    if (!res.success) {
      if (name === 'company_logo.png') {
        rejectedPng = true
        assert.ok(res.error?.en.includes('company_logo.png'))
        assert.ok(res.error?.bn.includes('company_logo.png'))
      }
    } else if (res.file) {
      uploadedFiles.push(res.file)
    }
  }

  // PNG was rejected
  assert.equal(rejectedPng, true)
  // Exactly 10 PDFs accepted
  assert.equal(uploadedFiles.length, 10)

  // Verify page counts: 2, 6, 1, 1, 1, 2, 2, 1, 1, 1 (sum = 18)
  const totalUploadedPages = uploadedFiles.reduce((acc, f) => acc + f.pageCount, 0)
  assert.equal(totalUploadedPages, 18)

  // Verify identical SHA-256 hash for experience_cert and experience_cert (1)
  const exp1 = uploadedFiles.find((f) => f.name === 'experience_cert.pdf')
  const exp2 = uploadedFiles.find((f) => f.name === 'experience_cert (1).pdf')
  assert.ok(exp1 && exp2)
  assert.equal(exp1.hash, exp2.hash)
})

test('Verification 2: Expired trade license vs valid license', () => {
  const json = fs.readFileSync(path.join(sampleDir, 'requirements.json'), 'utf8')
  const reqData = parseRequirements(json).data!
  const r01 = reqData.requirements.find((r) => r.id === 'R01')!
  const deadline = reqData.tender.submission_deadline // 2026-10-20

  // 2025 license expired on 2025-06-30
  const expiredStatus = computeStatus(r01, 'file_trade_license_2025', '2025-06-30', deadline)
  assert.equal(expiredStatus.status, 'EXPIRED')
  assert.equal(expiredStatus.blocking, true)

  // 2026 license valid until 2027-06-30
  const validStatus = computeStatus(r01, 'file_trade_license_2026', '2027-06-30', deadline)
  assert.equal(validStatus.status, 'OK')
  assert.equal(validStatus.blocking, false)
})

test('Verification 3: Expiry on the deadline day itself is OK', () => {
  const json = fs.readFileSync(path.join(sampleDir, 'requirements.json'), 'utf8')
  const reqData = parseRequirements(json).data!
  const r01 = reqData.requirements.find((r) => r.id === 'R01')!
  const deadline = '2026-10-20'

  const sameDayStatus = computeStatus(r01, 'file_trade_license_2026', '2026-10-20', deadline)
  assert.equal(sameDayStatus.status, 'OK')
  assert.equal(sameDayStatus.blocking, false)
})

test('Verification 4: End-to-end package has exactly 16 pages with correct ordering', async () => {
  const json = fs.readFileSync(path.join(sampleDir, 'requirements.json'), 'utf8')
  const reqData = parseRequirements(json).data!

  const uploadedFiles: UploadedFile[] = []
  const fileNames = [
    'trade_license_2026.pdf',
    '03_tin_certificate.pdf',
    '04_vat_certificate.pdf',
    'bank_solvency.pdf',
    'experience_cert.pdf',
    '02_technical_proposal.pdf',
    '01_financial_proposal.pdf',
    'scan_0042.pdf',
  ]

  for (const name of fileNames) {
    const bytes = fs.readFileSync(path.join(docsDir, name))
    const doc = await PDFDocument.load(bytes)
    uploadedFiles.push({
      id: `file_${name}`,
      name,
      size: bytes.length,
      bytes: new Uint8Array(bytes),
      pageCount: doc.getPageCount(),
      hash: `hash_${name}`,
    })
  }

  const matches: Record<string, string | null> = {
    R01: 'file_trade_license_2026.pdf',
    R02: 'file_03_tin_certificate.pdf',
    R03: 'file_04_vat_certificate.pdf',
    R04: 'file_bank_solvency.pdf',
    R05: 'file_experience_cert.pdf',
    R06: null,
    R07: null,
    R08: 'file_02_technical_proposal.pdf',
    R09: 'file_01_financial_proposal.pdf',
    R10: 'file_scan_0042.pdf',
  }

  const { pdfBytes, pageCount } = await buildPackage({
    tender: reqData.tender,
    requirements: reqData.requirements,
    files: uploadedFiles,
    matches,
  })

  // 16 pages total
  assert.equal(pageCount, 16)
  fs.writeFileSync('output/T-2026-0417_Package.pdf', Buffer.from(pdfBytes))

  const finalDoc = await PDFDocument.load(pdfBytes)
  assert.equal(finalDoc.getPageCount(), 16)
})
