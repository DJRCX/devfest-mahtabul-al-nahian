import type { Requirement, RequirementsPayload, Tender } from './types'

export interface ParseResult {
  success: boolean
  data?: RequirementsPayload
  error?: {
    en: string
    bn: string
  }
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function parseRequirements(input: string | unknown): ParseResult {
  let parsed: unknown

  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input)
    } catch {
      return {
        success: false,
        error: {
          en: 'Invalid JSON file format. Please upload a valid JSON document.',
          bn: 'অবৈধ JSON ফাইল ফরম্যাট। অনুগ্রহ করে একটি সঠিক JSON নথি আপলোড করুন।',
        },
      }
    }
  } else {
    parsed = input
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      success: false,
      error: {
        en: 'JSON root must be an object with "tender" and "requirements".',
        bn: 'JSON রুটে অবশ্যই "tender" এবং "requirements" সম্বলিত অবজেক্ট থাকতে হবে।',
      },
    }
  }

  const raw = parsed as Record<string, unknown>

  // Validate tender object
  if (!raw.tender || typeof raw.tender !== 'object') {
    return {
      success: false,
      error: {
        en: 'Missing or invalid "tender" object in requirements file.',
        bn: 'নথিতে "tender" সংক্রান্ত তথ্য অনুপস্থিত অথবা ভুল।',
      },
    }
  }

  const t = raw.tender as Record<string, unknown>
  const requiredTenderFields: Array<keyof Tender> = [
    'tender_id',
    'title',
    'procuring_entity',
    'bidder',
    'submission_deadline',
  ]

  for (const field of requiredTenderFields) {
    if (typeof t[field] !== 'string' || !t[field]?.trim()) {
      return {
        success: false,
        error: {
          en: `Tender field "${field}" is missing or empty.`,
          bn: `দরপত্রের "${field}" তথ্যটি অনুপস্থিত অথবা ফাঁকা।`,
        },
      }
    }
  }

  const deadline = (t.submission_deadline as string).trim()
  if (!DATE_REGEX.test(deadline)) {
    return {
      success: false,
      error: {
        en: `Invalid submission_deadline "${deadline}". Format must be YYYY-MM-DD.`,
        bn: `জমাদানের শেষ তারিখ "${deadline}" অবৈধ। ফরম্যাটটি অবশ্যই YYYY-MM-DD হতে হবে।`,
      },
    }
  }

  const tender: Tender = {
    tender_id: (t.tender_id as string).trim(),
    title: (t.title as string).trim(),
    procuring_entity: (t.procuring_entity as string).trim(),
    bidder: (t.bidder as string).trim(),
    submission_deadline: deadline,
  }

  // Validate requirements list
  if (!Array.isArray(raw.requirements) || raw.requirements.length === 0) {
    return {
      success: false,
      error: {
        en: 'Requirements list must be a non-empty array.',
        bn: 'প্রয়োজনীয় নথির তালিকা অবশ্যই খালি ছাড়া একটি অ্যারে হতে হবে।',
      },
    }
  }

  const seenIds = new Set<string>()
  const requirements: Requirement[] = []

  for (let i = 0; i < raw.requirements.length; i++) {
    const item = raw.requirements[i]
    if (!item || typeof item !== 'object') {
      return {
        success: false,
        error: {
          en: `Requirement at index ${i} is not a valid object.`,
          bn: `ইনডেক্স ${i}-এর প্রয়োজনীয় নথি তথ্যটি সঠিক নয়।`,
        },
      }
    }

    const r = item as Record<string, unknown>
    if (typeof r.id !== 'string' || !r.id.trim()) {
      return {
        success: false,
        error: {
          en: `Requirement at index ${i} is missing a valid "id".`,
          bn: `ইনডেক্স ${i}-এর প্রয়োজনীয় নথিতে সঠিক "id" নেই।`,
        },
      }
    }

    const id = r.id.trim()
    if (seenIds.has(id)) {
      return {
        success: false,
        error: {
          en: `Duplicate requirement ID found: "${id}".`,
          bn: `অনুরূপ রিকোয়ারমেন্ট আইডি পাওয়া গেছে: "${id}"।`,
        },
      }
    }
    seenIds.add(id)

    if (typeof r.order !== 'number' || !Number.isInteger(r.order)) {
      return {
        success: false,
        error: {
          en: `Requirement "${id}" has an invalid "order" (must be an integer).`,
          bn: `রিকোয়ারমেন্ট "${id}"-এর ক্রম (order) অবশ্যই পূর্ণসংখ্যা হতে হবে।`,
        },
      }
    }

    if (typeof r.title_en !== 'string' || !r.title_en.trim()) {
      return {
        success: false,
        error: {
          en: `Requirement "${id}" is missing "title_en".`,
          bn: `রিকোয়ারমেন্ট "${id}"-এ "title_en" অনুপস্থিত।`,
        },
      }
    }

    if (typeof r.title_bn !== 'string' || !r.title_bn.trim()) {
      return {
        success: false,
        error: {
          en: `Requirement "${id}" is missing "title_bn".`,
          bn: `রিকোয়ারমেন্ট "${id}"-এ "title_bn" অনুপস্থিত।`,
        },
      }
    }

    if (typeof r.mandatory !== 'boolean') {
      return {
        success: false,
        error: {
          en: `Requirement "${id}" has non-boolean "mandatory".`,
          bn: `রিকোয়ারমেন্ট "${id}"-এর "mandatory" মানটি বুলিয়ান হতে হবে।`,
        },
      }
    }

    if (typeof r.has_expiry !== 'boolean') {
      return {
        success: false,
        error: {
          en: `Requirement "${id}" has non-boolean "has_expiry".`,
          bn: `রিকোয়ারমেন্ট "${id}"-এর "has_expiry" মানটি বুলিয়ান হতে হবে।`,
        },
      }
    }

    requirements.push({
      id,
      order: r.order,
      title_en: r.title_en.trim(),
      title_bn: r.title_bn.trim(),
      mandatory: r.mandatory,
      has_expiry: r.has_expiry,
    })
  }

  // Sort strictly by order ascending
  requirements.sort((a, b) => a.order - b.order)

  return {
    success: true,
    data: {
      tender,
      requirements,
    },
  }
}
