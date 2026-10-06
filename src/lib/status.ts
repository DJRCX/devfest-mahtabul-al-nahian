import type { Requirement, StatusDetail } from './types'

export function computeStatus(
  req: Requirement,
  matchedFileId: string | null | undefined,
  expiryDate: string | undefined,
  deadline: string,
): StatusDetail {
  // If no file matched:
  if (!matchedFileId) {
    if (req.mandatory) {
      return {
        status: 'MISSING',
        blocking: true,
        reasonEn: `Mandatory document "${req.title_en}" is missing.`,
        reasonBn: `বাধ্যতামূলক নথি "${req.title_bn}" অনুপস্থিত।`,
      }
    }
    return {
      status: 'NOT_PROVIDED',
      blocking: false,
      reasonEn: `Optional document "${req.title_en}" not provided.`,
      reasonBn: `ঐচ্ছিক নথি "${req.title_bn}" প্রদান করা হয়নি।`,
    }
  }

  // A file is matched:
  if (req.has_expiry) {
    const trimmedExpiry = (expiryDate || '').trim()
    if (!trimmedExpiry) {
      return {
        status: 'EXPIRY_NEEDED',
        blocking: true,
        reasonEn: `"${req.title_en}" requires an expiry date.`,
        reasonBn: `"${req.title_bn}"-এর জন্য মেয়াদের তারিখ আবশ্যক।`,
      }
    }

    // Lexicographical string comparison for YYYY-MM-DD (safe against timezone drift)
    if (trimmedExpiry < deadline) {
      return {
        status: 'EXPIRED',
        blocking: true,
        reasonEn: `"${req.title_en}" expired on ${trimmedExpiry} (deadline is ${deadline}).`,
        reasonBn: `"${req.title_bn}"-এর মেয়াদ ${trimmedExpiry} তারিখে শেষ হয়েছে (শেষ সময় ${deadline})।`,
      }
    }
  }

  return {
    status: 'OK',
    blocking: false,
    reasonEn: `"${req.title_en}" is verified and valid.`,
    reasonBn: `"${req.title_bn}" যাচাইকৃত ও সঠিক।`,
  }
}
