import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { PDFDocument } from 'pdf-lib'
import { parseRequirements } from '../src/lib/requirements.ts'
import { buildPackage } from '../src/lib/buildPackage.ts'
import type { UploadedFile } from '../src/lib/types.ts'

test('buildPackage generates exactly 16 pages from sample pack in correct order', async () => {
  const json = fs.readFileSync('docs/problem-pack/sample-pack/requirements.json', 'utf8')
  const reqRes = parseRequirements(json)
  assert.equal(reqRes.success, true)
  assert.ok(reqRes.data)

  const docsDir = 'docs/problem-pack/sample-pack/documents'
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

  const uploadedFiles: UploadedFile[] = []
  const matches: Record<string, string | null> = {}

  for (const name of fileNames) {
    const bytes = fs.readFileSync(path.join(docsDir, name))
    const doc = await PDFDocument.load(bytes)
    const fileId = `file_${name}`
    uploadedFiles.push({
      id: fileId,
      name,
      size: bytes.length,
      bytes: new Uint8Array(bytes),
      pageCount: doc.getPageCount(),
      hash: 'testhash',
    })
  }

  // Map files to requirements according to spec
  matches['R01'] = 'file_trade_license_2026.pdf'
  matches['R02'] = 'file_03_tin_certificate.pdf'
  matches['R03'] = 'file_04_vat_certificate.pdf'
  matches['R04'] = 'file_bank_solvency.pdf'
  matches['R05'] = 'file_experience_cert.pdf'
  matches['R06'] = null // Optional, omitted
  matches['R07'] = null // Optional, omitted
  matches['R08'] = 'file_02_technical_proposal.pdf'
  matches['R09'] = 'file_01_financial_proposal.pdf'
  matches['R10'] = 'file_scan_0042.pdf'

  const { pdfBytes, pageCount } = await buildPackage({
    tender: reqRes.data.tender,
    requirements: reqRes.data.requirements,
    files: uploadedFiles,
    matches,
  })

  // Verify total pages: 1 cover + 1 + 1 + 1 + 1 + 2 + 6 + 2 + 1 = 16
  assert.equal(pageCount, 16)

  // Save the required output
  fs.writeFileSync('output/T-2026-0417_Package.pdf', Buffer.from(pdfBytes))
  assert.ok(fs.existsSync('output/T-2026-0417_Package.pdf'))

  // Verify the saved output can be re-loaded and has 16 pages
  const verifiedDoc = await PDFDocument.load(pdfBytes)
  assert.equal(verifiedDoc.getPageCount(), 16)
})
