import { PDFDocument } from 'pdf-lib'
import type { UploadedFile } from './types'

export interface ReadPdfResult {
  success: boolean
  file?: UploadedFile
  error?: {
    en: string
    bn: string
  }
}

// Convert ArrayBuffer to hex string
function bufToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

export async function readPdf(file: File): Promise<ReadPdfResult> {
  // 1. Check extension and MIME type
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf')
  if (!isPdfExt) {
    return {
      success: false,
      error: {
        en: `Rejected "${file.name}": Only PDF documents are allowed.`,
        bn: `"${file.name}" বাতিল করা হয়েছে: শুধুমাত্র পিডিএফ নথি অনুমোদিত।`,
      },
    }
  }

  let arrayBuffer: ArrayBuffer
  try {
    arrayBuffer = await file.arrayBuffer()
  } catch {
    return {
      success: false,
      error: {
        en: `Could not read file "${file.name}".`,
        bn: `"${file.name}" ফাইলটি পড়তে ব্যর্থ হয়েছে।`,
      },
    }
  }

  const bytes = new Uint8Array(arrayBuffer)

  // 2. Check %PDF- magic bytes (first 5 bytes)
  // 0x25 = '%', 0x50 = 'P', 0x44 = 'D', 0x46 = 'F', 0x2D = '-'
  const isMagicPdf =
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d

  if (!isMagicPdf) {
    return {
      success: false,
      error: {
        en: `Rejected "${file.name}": File is not a valid PDF (invalid magic header).`,
        bn: `"${file.name}" বাতিল করা হয়েছে: ফাইলটি সঠিক পিডিএফ নয় (হেডার ত্রুটিপূর্ণ)।`,
      },
    }
  }

  // 3. Compute SHA-256 hash
  let hashHex = ''
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    hashHex = bufToHex(hashBuffer)
  } catch {
    // Fallback simple hash if subtle crypto fails
    let simple = 0
    for (let i = 0; i < Math.min(bytes.length, 1024); i++) {
      simple = (simple * 31 + bytes[i]) >>> 0
    }
    hashHex = `fallback_${simple}`
  }

  // 4. Count pages using PDFDocument.load
  let pageCount = 0
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
    pageCount = doc.getPageCount()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      error: {
        en: `Cannot process "${file.name}": Damaged or unreadable PDF (${msg}).`,
        bn: `"${file.name}" প্রক্রিয়াকরণ করা সম্ভব নয়: ফাইলটি ত্রুটিপূর্ণ বা সুরক্ষিত (${msg})।`,
      },
    }
  }

  const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    success: true,
    file: {
      id,
      name: file.name,
      size: file.size,
      bytes,
      pageCount,
      hash: hashHex,
    },
  }
}
