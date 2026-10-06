import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { Requirement, Tender, UploadedFile } from './types'

export interface BuildPackageParams {
  tender: Tender
  requirements: Requirement[]
  files: UploadedFile[]
  matches: Record<string, string | null>
}

export interface IncludedDocumentInfo {
  order: number
  reqId: string
  title_en: string
  fileName: string
  pageCount: number
}

export async function buildPackage({
  tender,
  requirements,
  files,
  matches,
}: BuildPackageParams): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const mergedDoc = await PDFDocument.create()
  const helvetica = await mergedDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await mergedDoc.embedFont(StandardFonts.HelveticaBold)

  // 1. Filter and sort included requirements (only those with a matched file)
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order)
  const includedDocs: IncludedDocumentInfo[] = []
  const filesToCopy: Array<{ req: Requirement; file: UploadedFile }> = []

  for (const req of sortedReqs) {
    const fileId = matches[req.id]
    if (!fileId) continue
    const file = files.find((f) => f.id === fileId)
    if (!file) continue

    includedDocs.push({
      order: req.order,
      reqId: req.id,
      title_en: req.title_en,
      fileName: file.name,
      pageCount: file.pageCount,
    })

    filesToCopy.push({ req, file })
  }

  // 2. Create Page 1: A4 English Cover Page
  // A4 size: 595.28 x 841.89 pt
  const coverWidth = 595.28
  const coverHeight = 841.89
  const coverPage = mergedDoc.addPage([coverWidth, coverHeight])

  // Header banner / title
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
    size: 16,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

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

  const today = new Date().toISOString().slice(0, 10)
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
    coverPage.drawText(item.val, {
      x: 180,
      y: curY,
      size: 9.5,
      font: item.bold ? helveticaBold : helvetica,
      color: rgb(0.1, 0.1, 0.1),
    })
    curY -= 19
  }

  // Included Documents Table
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

    // Alternate row shading
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
    coverPage.drawText(reqLabel.slice(0, 36), {
      x: 75,
      y: rowY,
      size: 8.5,
      font: helveticaBold,
      color: rgb(0.15, 0.15, 0.15),
    })

    coverPage.drawText(doc.fileName.slice(0, 44), {
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

  // Summary footer note on cover
  const totalDocPages = includedDocs.reduce((acc, d) => acc + d.pageCount, 0)
  coverPage.drawText(
    `Total: ${includedDocs.length} documents (${totalDocPages} document pages + 1 cover page = ${totalDocPages + 1} total pages)`,
    {
      x: 40,
      y: rowY - 15,
      size: 9,
      font: helveticaBold,
      color: rgb(0.25, 0.3, 0.4),
    },
  )

  // 3. Copy pages in requirement order and extend bottom by 28 pt band
  // Store page rotation info for footer placement
  interface PageMeta {
    isCover: boolean
    angle: number
    origX: number
    origY: number
    origWidth: number
    origHeight: number
  }

  const pageMetas: PageMeta[] = []
  pageMetas.push({
    isCover: true,
    angle: 0,
    origX: 0,
    origY: 0,
    origWidth: coverWidth,
    origHeight: coverHeight,
  })

  for (const { file } of filesToCopy) {
    const srcDoc = await PDFDocument.load(file.bytes, { ignoreEncryption: true })
    const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices())

    for (const page of copiedPages) {
      mergedDoc.addPage(page)
      const rot = page.getRotation().angle || 0
      const mb = page.getMediaBox()

      // Extend bottom by 28pt band based on visual orientation
      if (rot === 0) {
        // Standard portrait/landscape: visual bottom is y
        page.setMediaBox(mb.x, mb.y - 28, mb.width, mb.height + 28)
        try {
          const cb = page.getCropBox()
          page.setCropBox(cb.x, cb.y - 28, cb.width, cb.height + 28)
        } catch {
          // ignore
        }
      } else if (rot === 90) {
        // Visual bottom is the right edge in coordinate space
        page.setMediaBox(mb.x, mb.y, mb.width + 28, mb.height)
      } else if (rot === 180) {
        // Visual bottom is top edge in coordinate space
        page.setMediaBox(mb.x, mb.y, mb.width, mb.height + 28)
      } else if (rot === 270) {
        // Visual bottom is left edge in coordinate space
        page.setMediaBox(mb.x - 28, mb.y, mb.width + 28, mb.height)
      }

      pageMetas.push({
        isCover: false,
        angle: rot,
        origX: mb.x,
        origY: mb.y,
        origWidth: mb.width,
        origHeight: mb.height,
      })
    }
  }

  // 4. Second Pass: Draw footer on EVERY page: "<tender_id> | Page X of Y"
  const totalPages = mergedDoc.getPageCount()
  const allPages = mergedDoc.getPages()
  const footerColor = rgb(0.35, 0.35, 0.35)
  const footerFontSize = 9

  for (let i = 0; i < totalPages; i++) {
    const page = allPages[i]
    const meta = pageMetas[i]
    const footerText = `${tender.tender_id} | Page ${i + 1} of ${totalPages}`
    const textWidth = helvetica.widthOfTextAtSize(footerText, footerFontSize)

    if (meta.isCover) {
      // Cover page: Draw inside bottom margin
      const centerX = (coverWidth - textWidth) / 2
      page.drawText(footerText, {
        x: centerX,
        y: 18,
        size: footerFontSize,
        font: helvetica,
        color: footerColor,
      })
    } else {
      // Copied pages: Draw in the newly added 28pt white band
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
        // Text along right edge with 90 deg rotation
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
