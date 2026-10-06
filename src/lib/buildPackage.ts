import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { Requirement, Tender, UploadedFile } from './types'
import { renderTextToPng } from './renderBanglaCanvas.ts'

export interface BuildPackageParams {
  tender: Tender
  requirements: Requirement[]
  files: UploadedFile[]
  matches: Record<string, string | null>
  includeIndexPage?: boolean
}

export interface IncludedDocumentInfo {
  order: number
  reqId: string
  title_en: string
  title_bn: string
  fileName: string
  pageCount: number
  startPage: number // 1-indexed in final package
  endPage: number
}

export async function buildPackage({
  tender,
  requirements,
  files,
  matches,
  includeIndexPage = false,
}: BuildPackageParams): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const mergedDoc = await PDFDocument.create()
  const helvetica = await mergedDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await mergedDoc.embedFont(StandardFonts.HelveticaBold)

  // Helvetica (WinAnsi) throws on characters it cannot encode, e.g. Bangla file names
  const winAnsiChars = new Set(helvetica.getCharacterSet())
  const safe = (text: string) =>
    Array.from(text, (ch) => (winAnsiChars.has(ch.codePointAt(0) ?? 0) ? ch : '?')).join('')

  // 1. Filter and sort included requirements (only those with a matched file)
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order)
  const includedDocs: IncludedDocumentInfo[] = []
  const filesToCopy: Array<{ req: Requirement; file: UploadedFile }> = []

  // Document pages start at page 2 (or page 3 if index page is included)
  let currentStartPage = includeIndexPage ? 3 : 2

  for (const req of sortedReqs) {
    const fileId = matches[req.id]
    if (!fileId) continue
    const file = files.find((f) => f.id === fileId)
    if (!file) continue

    includedDocs.push({
      order: req.order,
      reqId: req.id,
      title_en: req.title_en,
      title_bn: req.title_bn,
      fileName: file.name,
      pageCount: file.pageCount,
      startPage: currentStartPage,
      endPage: currentStartPage + file.pageCount - 1,
    })

    currentStartPage += file.pageCount
    filesToCopy.push({ req, file })
  }

  // 2. Create Page 1: A4 Cover Page (595.28 x 841.89 pt)
  const coverWidth = 595.28
  const coverHeight = 841.89
  const coverPage = mergedDoc.addPage([coverWidth, coverHeight])

  // Header banner
  coverPage.drawRectangle({
    x: 40,
    y: coverHeight - 80,
    width: coverWidth - 80,
    height: 40,
    color: rgb(0.12, 0.23, 0.45),
  })

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 55,
    y: coverHeight - 65,
    size: 15,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  // Bangla Subtitle on Cover Header
  const bnHeaderPng = renderTextToPng('দরপত্র নথি দাখিল প্যাকেজ', {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: 'bold',
  })
  if (bnHeaderPng) {
    try {
      const bnImg = await mergedDoc.embedPng(bnHeaderPng)
      coverPage.drawImage(bnImg, {
        x: coverWidth - 220,
        y: coverHeight - 66,
        width: 160,
        height: 15,
      })
    } catch {
      // ignore
    }
  }

  // Tender Metadata Box
  const metaTop = coverHeight - 105
  coverPage.drawRectangle({
    x: 40,
    y: metaTop - 130,
    width: coverWidth - 80,
    height: 130,
    color: rgb(0.96, 0.97, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  })

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const metaLines = [
    { label: 'Tender ID:', val: tender.tender_id, bold: true },
    { label: 'Tender Title:', val: tender.title, bold: false },
    { label: 'Procuring Entity:', val: tender.procuring_entity, bold: false },
    { label: 'Bidder Name:', val: tender.bidder, bold: true },
    { label: 'Submission Deadline:', val: tender.submission_deadline, bold: false },
    { label: 'Package Date:', val: today, bold: false },
  ]

  let curY = metaTop - 20
  for (const item of metaLines) {
    coverPage.drawText(item.label, {
      x: 55,
      y: curY,
      size: 9.5,
      font: helveticaBold,
      color: rgb(0.2, 0.25, 0.35),
    })
    coverPage.drawText(safe(item.val), {
      x: 180,
      y: curY,
      size: 9.5,
      font: item.bold ? helveticaBold : helvetica,
      color: rgb(0.1, 0.1, 0.1),
    })
    curY -= 19
  }

  // Included Documents Table on Cover
  const tableTop = metaTop - 150
  coverPage.drawText('INCLUDED DOCUMENTS SCHEDULE', {
    x: 40,
    y: tableTop,
    size: 12,
    font: helveticaBold,
    color: rgb(0.12, 0.23, 0.45),
  })

  // Table Header Row
  const tableHeaderY = tableTop - 22
  coverPage.drawRectangle({
    x: 40,
    y: tableHeaderY - 5,
    width: coverWidth - 80,
    height: 20,
    color: rgb(0.9, 0.93, 0.96),
  })

  coverPage.drawText('#', { x: 48, y: tableHeaderY, size: 9, font: helveticaBold })
  coverPage.drawText('Requirement', { x: 75, y: tableHeaderY, size: 9, font: helveticaBold })
  coverPage.drawText('Matched File Name', { x: 260, y: tableHeaderY, size: 9, font: helveticaBold })
  coverPage.drawText('Pages', { x: 505, y: tableHeaderY, size: 9, font: helveticaBold })

  let rowY = tableHeaderY - 20
  for (let idx = 0; idx < includedDocs.length; idx++) {
    const doc = includedDocs[idx]

    if (idx % 2 === 1) {
      coverPage.drawRectangle({
        x: 40,
        y: rowY - 4,
        width: coverWidth - 80,
        height: 18,
        color: rgb(0.98, 0.98, 0.99),
      })
    }

    coverPage.drawText(String(doc.order), {
      x: 50,
      y: rowY,
      size: 8.5,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2),
    })

    const reqLabel = `${doc.reqId} - ${doc.title_en}`
    coverPage.drawText(safe(reqLabel.slice(0, 36)), {
      x: 75,
      y: rowY,
      size: 8.5,
      font: helveticaBold,
      color: rgb(0.15, 0.15, 0.15),
    })

    coverPage.drawText(safe(doc.fileName.slice(0, 44)), {
      x: 260,
      y: rowY,
      size: 8.5,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2),
    })

    coverPage.drawText(String(doc.pageCount), {
      x: 515,
      y: rowY,
      size: 8.5,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2),
    })

    rowY -= 18
  }

  const totalDocPages = includedDocs.reduce((acc, d) => acc + d.pageCount, 0)
  const initialExtraPages = includeIndexPage ? 2 : 1
  coverPage.drawText(
    `Total: ${includedDocs.length} documents (${totalDocPages} document pages + ${initialExtraPages} cover/index = ${totalDocPages + initialExtraPages} total pages)`,
    {
      x: 40,
      y: rowY - 15,
      size: 9,
      font: helveticaBold,
      color: rgb(0.25, 0.3, 0.4),
    },
  )

  // Track page metadata for the second-pass footer
  interface PageMeta {
    isSpecial: boolean
    angle: number
    origX: number
    origY: number
    origWidth: number
    origHeight: number
  }

  const pageMetas: PageMeta[] = []
  pageMetas.push({
    isSpecial: true,
    angle: 0,
    origX: 0,
    origY: 0,
    origWidth: coverWidth,
    origHeight: coverHeight,
  })

  // 3. Optional Bonus: Create Page 2: Index Page
  if (includeIndexPage) {
    const indexPage = mergedDoc.addPage([coverWidth, coverHeight])

    indexPage.drawRectangle({
      x: 40,
      y: coverHeight - 70,
      width: coverWidth - 80,
      height: 35,
      color: rgb(0.15, 0.3, 0.55),
    })

    indexPage.drawText('DOCUMENT INDEX', {
      x: 55,
      y: coverHeight - 57,
      size: 14,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    })

    const bnIndexPng = renderTextToPng('নথি সূচিপত্র', {
      fontSize: 12,
      color: '#e2e8f0',
      fontWeight: 'bold',
    })
    if (bnIndexPng) {
      try {
        const bnImg = await mergedDoc.embedPng(bnIndexPng)
        indexPage.drawImage(bnImg, {
          x: coverWidth - 180,
          y: coverHeight - 58,
          width: 120,
          height: 14,
        })
      } catch {
        // ignore
      }
    }

    // Index table header
    const idxHeaderY = coverHeight - 100
    indexPage.drawRectangle({
      x: 40,
      y: idxHeaderY - 5,
      width: coverWidth - 80,
      height: 22,
      color: rgb(0.9, 0.93, 0.96),
    })

    indexPage.drawText('#', { x: 48, y: idxHeaderY, size: 9, font: helveticaBold })
    indexPage.drawText('Document Name', { x: 75, y: idxHeaderY, size: 9, font: helveticaBold })
    indexPage.drawText('File Name', { x: 260, y: idxHeaderY, size: 9, font: helveticaBold })
    indexPage.drawText('Pages', { x: 435, y: idxHeaderY, size: 9, font: helveticaBold })
    indexPage.drawText('Starts At', { x: 485, y: idxHeaderY, size: 9, font: helveticaBold })

    let idxRowY = idxHeaderY - 24
    for (let i = 0; i < includedDocs.length; i++) {
      const doc = includedDocs[i]

      if (i % 2 === 1) {
        indexPage.drawRectangle({
          x: 40,
          y: idxRowY - 5,
          width: coverWidth - 80,
          height: 20,
          color: rgb(0.98, 0.98, 0.99),
        })
      }

      indexPage.drawText(String(doc.order), {
        x: 50,
        y: idxRowY,
        size: 8.5,
        font: helvetica,
      })

      const reqLabel = `${doc.reqId} - ${doc.title_en}`
      indexPage.drawText(safe(reqLabel.slice(0, 34)), {
        x: 75,
        y: idxRowY,
        size: 8.5,
        font: helveticaBold,
      })

      // Render Bengali title if canvas available
      const bnTitlePng = renderTextToPng(doc.title_bn, {
        fontSize: 10,
        color: '#475569',
      })
      if (bnTitlePng) {
        try {
          const bnImg = await mergedDoc.embedPng(bnTitlePng)
          indexPage.drawImage(bnImg, {
            x: 75,
            y: idxRowY - 8,
            width: 100,
            height: 9,
          })
        } catch {
          // ignore
        }
      }

      indexPage.drawText(safe(doc.fileName.slice(0, 32)), {
        x: 260,
        y: idxRowY,
        size: 8.5,
        font: helvetica,
      })

      indexPage.drawText(String(doc.pageCount), {
        x: 442,
        y: idxRowY,
        size: 8.5,
        font: helvetica,
      })

      indexPage.drawText(`Page ${doc.startPage}`, {
        x: 485,
        y: idxRowY,
        size: 8.5,
        font: helveticaBold,
        color: rgb(0.1, 0.3, 0.6),
      })

      idxRowY -= 22
    }

    pageMetas.push({
      isSpecial: true,
      angle: 0,
      origX: 0,
      origY: 0,
      origWidth: coverWidth,
      origHeight: coverHeight,
    })
  }

  // 4. Copy pages from uploaded files in requirement order
  for (const { file } of filesToCopy) {
    let srcDoc: PDFDocument
    try {
      srcDoc = await PDFDocument.load(file.bytes, { ignoreEncryption: true })
    } catch {
      throw new Error(`Failed to load file "${file.name}": Damaged or password-protected PDF.`)
    }

    const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices())

    for (const page of copiedPages) {
      mergedDoc.addPage(page)
      const rot = page.getRotation().angle || 0
      const mb = page.getMediaBox()

      // Extend bottom by 28pt band based on visual orientation
      if (rot === 0) {
        page.setMediaBox(mb.x, mb.y - 28, mb.width, mb.height + 28)
        try {
          const cb = page.getCropBox()
          page.setCropBox(cb.x, cb.y - 28, cb.width, cb.height + 28)
        } catch {
          // ignore
        }
      } else if (rot === 90) {
        page.setMediaBox(mb.x, mb.y, mb.width + 28, mb.height)
      } else if (rot === 180) {
        page.setMediaBox(mb.x, mb.y, mb.width, mb.height + 28)
      } else if (rot === 270) {
        page.setMediaBox(mb.x - 28, mb.y, mb.width + 28, mb.height)
      }

      pageMetas.push({
        isSpecial: false,
        angle: rot,
        origX: mb.x,
        origY: mb.y,
        origWidth: mb.width,
        origHeight: mb.height,
      })
    }
  }

  // 5. Second-pass Footer: "<tender_id> | Page X of Y"
  const totalPages = mergedDoc.getPageCount()
  const allPages = mergedDoc.getPages()
  const footerColor = rgb(0.35, 0.35, 0.35)
  const footerFontSize = 9

  for (let i = 0; i < totalPages; i++) {
    const page = allPages[i]
    const meta = pageMetas[i]
    const footerText = safe(`${tender.tender_id} | Page ${i + 1} of ${totalPages}`)
    const textWidth = helvetica.widthOfTextAtSize(footerText, footerFontSize)

    if (meta.isSpecial) {
      // Cover / Index page
      const centerX = (coverWidth - textWidth) / 2
      page.drawText(footerText, {
        x: centerX,
        y: 18,
        size: footerFontSize,
        font: helvetica,
        color: footerColor,
      })
    } else {
      // Copied pages in 28pt band
      if (meta.angle === 0) {
        const centerX = meta.origX + (meta.origWidth - textWidth) / 2
        const footerY = meta.origY - 28 + 9
        page.drawText(footerText, {
          x: centerX,
          y: footerY,
          size: footerFontSize,
          font: helvetica,
          color: footerColor,
        })
      } else if (meta.angle === 90) {
        const centerY = meta.origY + (meta.origHeight - textWidth) / 2
        page.drawText(footerText, {
          x: meta.origX + meta.origWidth + 18,
          y: centerY,
          size: footerFontSize,
          font: helvetica,
          color: footerColor,
          rotate: degrees(90),
        })
      } else if (meta.angle === 180) {
        const centerX = meta.origX + (meta.origWidth + textWidth) / 2
        page.drawText(footerText, {
          x: centerX,
          y: meta.origY + meta.origHeight + 18,
          size: footerFontSize,
          font: helvetica,
          color: footerColor,
          rotate: degrees(180),
        })
      } else if (meta.angle === 270) {
        const centerY = meta.origY + (meta.origHeight + textWidth) / 2
        page.drawText(footerText, {
          x: meta.origX - 18,
          y: centerY,
          size: footerFontSize,
          font: helvetica,
          color: footerColor,
          rotate: degrees(270),
        })
      }
    }
  }

  const pdfBytes = await mergedDoc.save()
  return {
    pdfBytes,
    pageCount: totalPages,
  }
}
