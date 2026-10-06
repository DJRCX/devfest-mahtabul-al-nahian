import type { ChangeEvent } from 'react'
import type { Requirement, UploadedFile, Matches, Expiries, Tender } from '../lib/types'
import { computeStatus } from '../lib/status'
import { exportChecklistCsv } from '../lib/exportCsv'
import { useT } from '../i18n/useT'
import { getStatusLabel } from '../i18n/strings'

interface ChecklistProps {
  tender: Tender
  requirements: Requirement[]
  files: UploadedFile[]
  matches: Matches
  expiries: Expiries
  deadline: string
  onSetMatch: (requirementId: string, fileId: string | null) => void
  onSetExpiry: (requirementId: string, expiry: string) => void
}

export function Checklist({
  tender,
  requirements,
  files,
  matches,
  expiries,
  deadline,
  onSetMatch,
  onSetExpiry,
}: ChecklistProps) {
  const { language, t } = useT()

  // 1. Build map of fileId -> requirementId currently using it
  const fileToMatchedReq = new Map<string, string>()
  for (const [reqId, fId] of Object.entries(matches)) {
    if (fId) {
      fileToMatchedReq.set(fId, reqId)
    }
  }

  // 2. Build map of hash -> requirementId if any file with that hash is matched
  const hashToMatchedReq = new Map<string, { reqId: string; fileId: string }>()
  for (const [reqId, fId] of Object.entries(matches)) {
    if (fId) {
      const fileObj = files.find((f) => f.id === fId)
      if (fileObj) {
        hashToMatchedReq.set(fileObj.hash, { reqId, fileId: fId })
      }
    }
  }

  // Helper to render status badge with icon and label
  const renderStatusBadge = (req: Requirement) => {
    const matchedFileId = matches[req.id]
    const expiry = expiries[req.id]
    const detail = computeStatus(req, matchedFileId, expiry, deadline)
    const label = getStatusLabel(detail.status, language)

    switch (detail.status) {
      case 'OK':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            {label}
          </span>
        )

      case 'MISSING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800">
            <svg className="h-3.5 w-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {label}
          </span>
        )

      case 'EXPIRY_NEEDED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
            <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {label}
          </span>
        )

      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-900">
            <svg className="h-3.5 w-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {label}
          </span>
        )

      case 'NOT_PROVIDED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
            </svg>
            {label}
          </span>
        )
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {language === 'bn' ? 'দরপত্রের শর্তাবলি ও ফাইল সংযোগ' : 'Tender Documents & Status'}
        </span>
        <button
          type="button"
          onClick={() =>
            exportChecklistCsv(tender, requirements, files, matches, expiries)
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs"
          title="Download checklist summary as CSV spreadsheet"
        >
          <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{language === 'bn' ? 'এক্সপোর্ট চেকলিস্ট (CSV)' : 'Export Checklist (CSV)'}</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
        <thead className="bg-slate-50/70 text-xs font-semibold text-slate-600">
          <tr>
            <th className="px-3.5 py-3 text-center w-12">{t('colOrder')}</th>
            <th className="px-4 py-3">{t('colRequirement')}</th>
            <th className="px-4 py-3 min-w-[260px]">{t('colMatchedFile')}</th>
            <th className="px-4 py-3 min-w-[170px]">{t('colExpiryDate')}</th>
            <th className="px-4 py-3 text-center min-w-[140px]">{t('colStatus')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {requirements.map((req) => {
            const title = language === 'bn' ? req.title_bn : req.title_en
            const currentMatch = matches[req.id] || ''
            const expiry = expiries[req.id] || ''

            return (
              <tr key={req.id} className="hover:bg-slate-50/60 transition">
                {/* Order */}
                <td className="px-3.5 py-3.5 text-center font-mono text-xs font-semibold text-slate-500">
                  {req.order}
                </td>

                {/* Requirement Title and Badges */}
                <td className="px-4 py-3.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {req.id}
                      </span>
                      <span className="font-medium text-slate-900">{title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.mandatory ? (
                        <span className="text-[11px] font-semibold text-rose-700">
                          {t('badgeMandatory')}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500">
                          {t('badgeOptional')}
                        </span>
                      )}
                      {req.has_expiry && (
                        <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                          • {t('badgeHasExpiry')}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Matched File Dropdown */}
                <td className="px-4 py-3.5">
                  <select
                    value={currentMatch}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      const val = e.target.value
                      onSetMatch(req.id, val ? val : null)
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">{t('selectPlaceholder')}</option>
                    {currentMatch && <option value="">{t('unmatchOption')}</option>}

                    {files.map((file) => {
                      const isCurrentlySelected = currentMatch === file.id
                      const usedInReq = fileToMatchedReq.get(file.id)
                      const isUsedElsewhere = !!usedInReq && usedInReq !== req.id

                      // Duplicate lock: If another file with the exact same hash is matched to another requirement
                      const duplicateMatch = hashToMatchedReq.get(file.hash)
                      const isDuplicateMatchedElsewhere =
                        !isCurrentlySelected &&
                        !isUsedElsewhere &&
                        !!duplicateMatch &&
                        duplicateMatch.fileId !== file.id &&
                        duplicateMatch.reqId !== req.id

                      let label = `${file.name} (${file.pageCount} ${
                        language === 'bn' ? 'পৃষ্ঠা' : 'p'
                      })`

                      if (isUsedElsewhere) {
                        label += ` — ${t('usedFor', { id: usedInReq })}`
                      } else if (isDuplicateMatchedElsewhere) {
                        label += ` — ${t('duplicateLocked')}`
                      }

                      const isDisabled = isUsedElsewhere || isDuplicateMatchedElsewhere

                      return (
                        <option
                          key={file.id}
                          value={file.id}
                          disabled={isDisabled}
                          className={isDisabled ? 'text-slate-400 bg-slate-50' : 'text-slate-900'}
                        >
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </td>

                {/* Expiry Date Input */}
                <td className="px-4 py-3.5">
                  {req.has_expiry && currentMatch ? (
                    <input
                      type="date"
                      value={expiry}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onSetExpiry(req.id, e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-mono text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      title={t('enterExpiryDate')}
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      {req.has_expiry ? (
                        language === 'bn'
                          ? 'ফাইল নির্বাচন করুন'
                          : 'Select document first'
                      ) : (
                        t('noExpiryNeeded')
                      )}
                    </span>
                  )}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3.5 text-center">
                  {renderStatusBadge(req)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </div>
  )
}
