import type { Requirement, Tender, UploadedFile, Matches, Expiries } from './types'
import { computeStatus } from './status'

export function exportChecklistCsv(
  tender: Tender,
  requirements: Requirement[],
  files: UploadedFile[],
  matches: Matches,
  expiries: Expiries,
) {
  const headers = [
    'Order',
    'Requirement ID',
    'Title (EN)',
    'Title (BN)',
    'Mandatory',
    'Matched File',
    'Page Count',
    'Expiry Date',
    'Status',
  ]

  const rows: string[][] = []

  for (const req of requirements) {
    const fileId = matches[req.id]
    const matchedFile = fileId ? files.find((f) => f.id === fileId) : null
    const expiry = expiries[req.id] || ''
    const status = computeStatus(req, fileId, expiry, tender.submission_deadline).status

    rows.push([
      String(req.order),
      req.id,
      `"${req.title_en.replace(/"/g, '""')}"`,
      `"${req.title_bn.replace(/"/g, '""')}"`,
      req.mandatory ? 'Yes' : 'No',
      matchedFile ? `"${matchedFile.name.replace(/"/g, '""')}"` : 'None',
      matchedFile ? String(matchedFile.pageCount) : '0',
      expiry ? expiry : 'N/A',
      status,
    ])
  }

  // Prepend UTF-8 BOM so Microsoft Excel and other viewers display Bangla/Unicode correctly
  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${tender.tender_id}_Checklist.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
