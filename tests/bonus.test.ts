import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { PDFDocument } from 'pdf-lib'
import { parseRequirements } from '../src/lib/requirements.ts'
import { buildPackage } from '../src/lib/buildPackage.ts'
import type { UploadedFile } from '../src/lib/types.ts'

const sampleDir = 'docs/problem-pack/sample-pack'
const docsDir = path.join(sampleDir, 'documents')

test('Bonus 1: buildPackage with includeIndexPage generates 17 pages with start page numbers', async () => {
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
    includeIndexPage: true,
  })

  // 17 pages total: 1 cover + 1 index + 15 doc pages = 17
  assert.equal(pageCount, 17)

  const doc = await PDFDocument.load(pdfBytes)
  assert.equal(doc.getPageCount(), 17)
})
