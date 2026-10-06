import type { Language, RequirementStatus } from '../lib/types'

export const translations = {
  en: {
    appTitle: 'Tender Document Package Builder',
    appSubtitle: 'Client-side tender PDF packaging, ordering & validation',
    languageToggle: 'বাংলা',
    currentLanguageName: 'English',

    // Steps
    step1Title: '1. Load Requirements',
    step1Desc: 'Upload the official requirements.json file to initialize tender guidelines.',
    step2Title: '2. Upload Documents',
    step2Desc: 'Upload PDF files for this submission (max 30 files, up to 50 MB total).',
    step3Title: '3. Match & Verify',
    step3Desc: 'Assign uploaded PDFs to tender requirements and check validity dates.',
    step4Title: '4. Generate Package',
    step4Desc: 'Compile verified documents with cover page and non-overlapping footers.',

    // Loader
    loadRequirementsBtn: 'Choose requirements.json',
    dragDropJson: 'Drag & drop requirements.json here, or click to browse',
    loadSampleBtn: 'Load Sample Pack (T-2026-0417)',
    loadedFile: 'Loaded file',
    changeFile: 'Change file',

    // Tender Summary
    tenderSummaryTitle: 'Tender Summary',
    tenderId: 'Tender ID',
    tenderTitle: 'Title',
    procuringEntity: 'Procuring Entity',
    bidder: 'Bidder',
    submissionDeadline: 'Submission Deadline',
    totalRequirements: 'Total Items',
    mandatoryCount: 'Mandatory',
    optionalCount: 'Optional',
    expiryNeededCount: 'Requires Expiry',
    summaryOrder: 'Order',
    summaryItem: 'Requirement',
    summaryType: 'Type',
    summaryExpiryRule: 'Expiry Rule',
    badgeMandatory: 'Mandatory',
    badgeOptional: 'Optional',
    badgeHasExpiry: 'Has Expiry',
    badgeNoExpiry: 'No Expiry',

    // Uploader
    uploadBtn: 'Select PDF Files',
    dragDropPdfs: 'Drag & drop PDF files here, or click to upload',
    uploadedFilesCount: 'Uploaded Files',
    totalSize: 'Total Size',
    fileLimitWarning: 'Limit: 30 files, 50 MB total',
    removeFile: 'Remove',
    previewFile: 'Preview',
    duplicateBadge: 'Duplicate',
    duplicateOf: 'Duplicate of',
    nonPdfRejected: 'Rejected "{name}": Only PDF documents are allowed.',
    limitExceededFiles: 'Cannot add more files: 30 file limit reached.',
    limitExceededSize: 'Total size would exceed 50 MB limit.',
    emptyFileList: 'No PDF documents uploaded yet.',

    // Checklist / Matching
    checklistTitle: 'Requirements Checklist',
    colOrder: '#',
    colRequirement: 'Requirement',
    colMatchedFile: 'Matched Document',
    colExpiryDate: 'Expiry Date',
    colStatus: 'Status',
    selectPlaceholder: '-- Choose document --',
    unmatchOption: '-- None (Unmatched) --',
    usedFor: '(used for {id})',
    duplicateLocked: '(duplicate of matched file)',
    noExpiryNeeded: 'Not required',
    enterExpiryDate: 'Select expiry date',

    // Statuses
    status_OK: 'OK',
    status_MISSING: 'Missing',
    status_EXPIRY_NEEDED: 'Expiry date needed',
    status_EXPIRED: 'Expired',
    status_NOT_PROVIDED: 'Not provided',

    // Reasons
    reasonMissing: 'Mandatory document has not been uploaded or matched.',
    reasonExpiryNeeded: 'Expiry date must be provided for this requirement.',
    reasonExpired: 'Expired on {date} (must be valid through deadline {deadline}).',
    reasonNotProvided: 'Optional document not provided (allowed).',
    reasonOk: 'Requirement fulfilled.',

    // Generate
    generateTitle: 'Package Generation',
    generateBtn: 'Generate & Download Package PDF',
    generating: 'Generating PDF Package...',
    readyToGenerate: 'All mandatory requirements satisfied. Ready to compile.',
    cannotGenerate: 'Cannot generate package. Please fix the following blocking issues:',
    totalDocPages: 'Total document pages',
    coverPageCount: '+1 cover page',
    expectedOutputName: 'Output file name',
    downloadSuccess: 'Package generated successfully!',
  },
  bn: {
    appTitle: 'দরপত্র নথি প্যাকেজ প্রস্তুতকারক',
    appSubtitle: 'ব্রাউজারভিত্তিক দরপত্র পিডিএফ প্যাকেজিং, ক্রমবিন্যাস ও যাচাইকরণ',
    languageToggle: 'English',
    currentLanguageName: 'বাংলা',

    // Steps
    step1Title: '১. প্রয়োজনীয় তালিকা লোড করুন',
    step1Desc: 'দরপত্রের নির্দেশিকা শুরু করতে অফিশিয়াল requirements.json ফাইলটি আপলোড করুন।',
    step2Title: '২. নথি আপলোড করুন',
    step2Desc: 'এই দরপত্রের জন্য পিডিএফ ফাইলগুলো আপলোড করুন (সর্বোচ্চ ৩০টি ফাইল, ৫০ মেগাবাইট পর্যন্ত)।',
    step3Title: '৩. মেলান ও যাচাই করুন',
    step3Desc: 'আপলোড করা ফাইলগুলো দরপত্রের শর্ত অনুযায়ী সংযুক্ত করুন এবং মেয়াদের তারিখ যাচাই করুন।',
    step4Title: '৪. প্যাকেজ তৈরি করুন',
    step4Desc: 'কভার পেজ এবং নিখুঁত ফুটারসহ যাচাইকৃত নথিগুলো একত্রিত করে ডাউনলোড করুন।',

    // Loader
    loadRequirementsBtn: 'requirements.json নির্বাচন করুন',
    dragDropJson: 'এখানে requirements.json ড্রপ করুন অথবা ব্রাউজ করতে ক্লিক করুন',
    loadSampleBtn: 'নমুনা প্যাক লোড করুন (T-2026-0417)',
    loadedFile: 'লোড করা ফাইল',
    changeFile: 'ফাইল পরিবর্তন করুন',

    // Tender Summary
    tenderSummaryTitle: 'দরপত্রের সংক্ষিপ্ত বিবরণ',
    tenderId: 'দরপত্র আইডি',
    tenderTitle: 'শিরোনাম',
    procuringEntity: 'ক্রয়কারী সংস্থা',
    bidder: 'দরদাতা',
    submissionDeadline: 'জমাদানের শেষ সময়',
    totalRequirements: 'মোট প্রয়োজনীয় আইটেম',
    mandatoryCount: 'বাধ্যতামূলক',
    optionalCount: 'ঐচ্ছিক',
    expiryNeededCount: 'মেয়াদ প্রয়োজন',
    summaryOrder: 'ক্রম',
    summaryItem: 'প্রয়োজনীয় দলিল',
    summaryType: 'ধরন',
    summaryExpiryRule: 'মেয়াদের শর্ত',
    badgeMandatory: 'বাধ্যতামূলক',
    badgeOptional: 'ঐচ্ছিক',
    badgeHasExpiry: 'মেয়াদ আছে',
    badgeNoExpiry: 'মেয়াদ নেই',

    // Uploader
    uploadBtn: 'পিডিএফ ফাইল নির্বাচন করুন',
    dragDropPdfs: 'এখানে পিডিএফ ফাইল ড্রপ করুন অথবা নির্বাচন করতে ক্লিক করুন',
    uploadedFilesCount: 'আপলোডকৃত ফাইল',
    totalSize: 'মোট সাইজ',
    fileLimitWarning: 'সীমা: সর্বোচ্চ ৩০টি ফাইল, মোট ৫০ মেগাবাইট',
    removeFile: 'মুছুন',
    previewFile: 'প্রিভিউ',
    duplicateBadge: 'ডুপ্লিকেট',
    duplicateOf: 'এর হুবহু প্রতিরূপ',
    nonPdfRejected: 'বাতিল করা হয়েছে "{name}": শুধুমাত্র পিডিএফ ফাইল অনুমোদিত।',
    limitExceededFiles: 'আর ফাইল যোগ করা সম্ভব নয়: ৩০টি ফাইলের সীমা পূর্ণ হয়েছে।',
    limitExceededSize: 'মোট ফাইলের সাইজ ৫০ মেগাবাইট সীমা অতিক্রম করবে।',
    emptyFileList: 'এখনও কোনো পিডিএফ নথি আপলোড করা হয়নি।',

    // Checklist / Matching
    checklistTitle: 'প্রয়োজনীয় দলিলের তালিকা',
    colOrder: '#',
    colRequirement: 'প্রয়োজনীয় দলিল',
    colMatchedFile: 'সংযুক্ত নথি',
    colExpiryDate: 'মেয়াদের তারিখ',
    colStatus: 'অবস্থা',
    selectPlaceholder: '-- নথি নির্বাচন করুন --',
    unmatchOption: '-- কোনোটি নয় (বাতিল) --',
    usedFor: '({id}-এ ব্যবহৃত)',
    duplicateLocked: '(সংযুক্ত ফাইলের ডুপ্লিকেট কপি)',
    noExpiryNeeded: 'প্রয়োজন নেই',
    enterExpiryDate: 'মেয়াদের তারিখ দিন',

    // Statuses
    status_OK: 'ঠিক আছে',
    status_MISSING: 'অনুপস্থিত',
    status_EXPIRY_NEEDED: 'মেয়াদের তারিখ দিন',
    status_EXPIRED: 'মেয়াদোত্তীর্ণ',
    status_NOT_PROVIDED: 'দেওয়া হয়নি',

    // Reasons
    reasonMissing: 'বাধ্যতামূলক নথিটি আপলোড বা সংযুক্ত করা হয়নি।',
    reasonExpiryNeeded: 'এই নথির জন্য মেয়াদের তারিখ প্রদান করা আবশ্যক।',
    reasonExpired: '{date} তারিখে মেয়াদ শেষ হয়েছে (জমাদানের শেষ তারিখ {deadline} পর্যন্ত বৈধ হতে হবে)।',
    reasonNotProvided: 'ঐচ্ছিক নথি দেওয়া হয়নি (অনুমোদিত)।',
    reasonOk: 'শর্ত পূরণ হয়েছে।',

    // Generate
    generateTitle: 'প্যাকেজ তৈরি',
    generateBtn: 'প্যাকেজ পিডিএফ তৈরি ও ডাউনলোড করুন',
    generating: 'পিডিএফ প্যাকেজ তৈরি হচ্ছে...',
    readyToGenerate: 'সকল বাধ্যতামূলক শর্ত পূরণ হয়েছে। প্যাকেজ তৈরির জন্য প্রস্তুত।',
    cannotGenerate: 'প্যাকেজ তৈরি করা যাচ্ছে না। অনুগ্রহ করে নিচের সমস্যাগুলো সমাধান করুন:',
    totalDocPages: 'নথির মোট পৃষ্ঠা',
    coverPageCount: '+১ কভার পেজ',
    expectedOutputName: 'আউটপুট ফাইলের নাম',
    downloadSuccess: 'প্যাকেজ সফলভাবে তৈরি হয়েছে!',
  },
} as const

export type TranslationKey = keyof typeof translations.en

export function getStatusLabel(status: RequirementStatus, lang: Language): string {
  const key = `status_${status}` as TranslationKey
  return translations[lang][key] || status
}
