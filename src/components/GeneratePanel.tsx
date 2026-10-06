import { useState } from 'react'
import type { Requirement, Tender, UploadedFile, Matches, Expiries } from '../lib/types'
import { computeStatus } from '../lib/status'
import { buildPackage } from '../lib/buildPackage'
import { useT } from '../i18n/useT'

interface GeneratePanelProps {
  tender: Tender | null
  requirements: Requirement[]
  files: UploadedFile[]
  matches: Matches
  expiries: Expiries
}

export function GeneratePanel({
  tender,
  requirements,
  files,
  matches,
  expiries,
}: GeneratePanelProps) {
  const { language, t } = useT()
  const [generating, setGenerating] = useState(false)
  const [lastGeneratedName, setLastGeneratedName] = useState<string | null>(null)

  if (!tender) {
    return null
  }

  // 1. Calculate status and blocking issues
  const blockingIssues: Array<{ id: string; title: string; reason: string }> = []
  let matchedDocsCount = 0
  let totalDocPages = 0

  for (const req of requirements) {
    const fileId = matches[req.id]
    const expiry = expiries[req.id]
    const detail = computeStatus(req, fileId, expiry, tender.submission_deadline)

    if (detail.blocking) {
      blockingIssues.push({
        id: req.id,
        title: language === 'bn' ? req.title_bn : req.title_en,
        reason: (language === 'bn' ? detail.reasonBn : detail.reasonEn) || 'Issue detected',
      })
    }

    if (fileId) {
      const f = files.find((file) => file.id === fileId)
      if (f) {
        matchedDocsCount++
        totalDocPages += f.pageCount
      }
    }
  }

  const isBlocked = blockingIssues.length > 0 || matchedDocsCount === 0
  const expectedFileName = `${tender.tender_id}_Package.pdf`
  const totalPackagePages = totalDocPages + 1 // + 1 cover page

  const handleGenerate = async () => {
    if (isBlocked || generating) return
    setGenerating(true)

    try {
      const { pdfBytes } = await buildPackage({
        tender,
        requirements,
        files,
        matches,
      })

      // Trigger browser download via Blob and <a download>
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = expectedFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setTimeout(() => URL.revokeObjectURL(url), 30000)
      setLastGeneratedName(expectedFileName)
    } catch (err) {
      console.error('Error generating package:', err)
      alert(`Error generating PDF package: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview box */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {t('colMatchedFile')}
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {matchedDocsCount} <span className="text-sm font-normal text-slate-500">/ {requirements.length}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {t('totalDocPages')}
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalDocPages} <span className="text-sm font-normal text-slate-500">{t('coverPageCount')}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {t('expectedOutputName')}
          </span>
          <p className="mt-1 text-xs font-bold font-mono text-blue-700 truncate" title={expectedFileName}>
            {expectedFileName}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            ({totalPackagePages} {language === 'bn' ? 'মোট পৃষ্ঠা' : 'total pages'})
          </p>
        </div>
      </div>

      {/* Gate Status: Ready vs Blocking Issues */}
      {isBlocked ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-900">
                {matchedDocsCount === 0
                  ? language === 'bn'
                    ? 'কোনো নথি সংযুক্ত করা হয়নি'
                    : 'No documents have been matched yet'
                  : t('cannotGenerate')}
              </h4>

              {blockingIssues.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-xs text-rose-800">
                  {blockingIssues.map((issue) => (
                    <li key={issue.id} className="flex items-start gap-2">
                      <span className="font-bold text-rose-900 font-mono shrink-0">
                        [{issue.id}] {issue.title}:
                      </span>
                      <span>{issue.reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">{t('readyToGenerate')}</p>
              <p className="text-xs text-emerald-700">
                {language === 'bn'
                  ? `কভার পেজসহ মোট ${totalPackagePages} পৃষ্ঠার সংকলিত পিডিএফ তৈরি করা হবে।`
                  : `Package of ${totalPackagePages} pages with cover and footer bands will be compiled.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex flex-col items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isBlocked || generating}
          className={`inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-bold shadow-md transition ${
            isBlocked || generating
              ? 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
          }`}
        >
          {generating ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>{t('generating')}</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>{t('generateBtn')}</span>
            </>
          )}
        </button>

        {lastGeneratedName && (
          <p className="text-xs font-semibold text-emerald-700">
            ✓ {t('downloadSuccess')} ({lastGeneratedName})
          </p>
        )}
      </div>
    </div>
  )
}
