import type { Requirement, Tender } from '../lib/types'
import { useT } from '../i18n/useT'

interface TenderSummaryProps {
  tender: Tender
  requirements: Requirement[]
}

export function TenderSummary({ tender, requirements }: TenderSummaryProps) {
  const { language, t } = useT()

  const mandatoryCount = requirements.filter((r) => r.mandatory).length
  const optionalCount = requirements.filter((r) => !r.mandatory).length
  const expiryCount = requirements.filter((r) => r.has_expiry).length

  return (
    <div className="space-y-6">
      {/* Top Tender Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 font-mono">
              {tender.tender_id}
            </span>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{tender.title}</h2>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200/80 px-3 py-2 text-right">
            <div className="text-xs font-medium text-amber-800">{t('submissionDeadline')}</div>
            <div className="text-sm font-bold font-mono text-amber-950">{tender.submission_deadline}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t('procuringEntity')}
            </span>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{tender.procuring_entity}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t('bidder')}
            </span>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{tender.bidder}</p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center sm:grid-cols-4">
          <div className="rounded-md bg-slate-100/60 p-2">
            <div className="text-xs text-slate-500">{t('totalRequirements')}</div>
            <div className="text-lg font-bold text-slate-800">{requirements.length}</div>
          </div>
          <div className="rounded-md bg-rose-50 p-2">
            <div className="text-xs text-rose-700">{t('mandatoryCount')}</div>
            <div className="text-lg font-bold text-rose-900">{mandatoryCount}</div>
          </div>
          <div className="rounded-md bg-slate-100/60 p-2">
            <div className="text-xs text-slate-600">{t('optionalCount')}</div>
            <div className="text-lg font-bold text-slate-800">{optionalCount}</div>
          </div>
          <div className="rounded-md bg-amber-50 p-2">
            <div className="text-xs text-amber-700">{t('expiryNeededCount')}</div>
            <div className="text-lg font-bold text-amber-900">{expiryCount}</div>
          </div>
        </div>
      </div>

      {/* Requirements Table List (Sorted by order) */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-800">{t('summaryItem')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/40 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3 text-center w-12">{t('summaryOrder')}</th>
                <th className="px-4 py-3">{t('summaryItem')}</th>
                <th className="px-4 py-3 text-center">{t('summaryType')}</th>
                <th className="px-4 py-3 text-center">{t('summaryExpiryRule')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {requirements.map((req) => {
                const title = language === 'bn' ? req.title_bn : req.title_en
                return (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-2.5 text-center font-mono text-xs font-semibold text-slate-500">
                      {req.order}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {req.id}
                        </span>
                        <span className="font-medium text-slate-900">{title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {req.mandatory ? (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200/60">
                          {t('badgeMandatory')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {t('badgeOptional')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {req.has_expiry ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/60">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('badgeHasExpiry')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {t('badgeNoExpiry')}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
