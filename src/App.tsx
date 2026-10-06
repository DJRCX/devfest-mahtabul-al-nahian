import { useReducer } from 'react'
import { appReducer, initialAppState } from './lib/state'
import { useT } from './i18n/useT'
import { LanguageToggle } from './components/LanguageToggle'
import { RequirementsLoader } from './components/RequirementsLoader'
import { TenderSummary } from './components/TenderSummary'

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialAppState)
  const { t } = useT()

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                {t('appTitle')}
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {state.tender && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'RESET_ALL' })}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                Reset
              </button>
            )}
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
        {/* Step 1: Load Requirements */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </span>
                <h2 className="text-lg font-bold text-slate-900">{t('step1Title')}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t('step1Desc')}</p>
            </div>
            {state.tender && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                ✓ Loaded
              </span>
            )}
          </div>

          <RequirementsLoader
            onLoad={(payload) => dispatch({ type: 'SET_REQUIREMENTS', payload })}
            onError={(error) => dispatch({ type: 'SET_REQUIREMENTS_ERROR', error })}
            error={state.requirementsError}
          />

          {state.tender && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <TenderSummary tender={state.tender} requirements={state.requirements} />
            </div>
          )}
        </section>

        {/* Step 2: Upload Documents */}
        <section
          className={`rounded-2xl border bg-white p-6 shadow-xs transition ${
            state.tender ? 'border-slate-200 opacity-100' : 'border-slate-200/60 opacity-60'
          }`}
        >
          <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700">
                  2
                </span>
                <h2 className="text-lg font-bold text-slate-900">{t('step2Title')}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t('step2Desc')}</p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
            {state.tender ? t('dragDropPdfs') : 'Complete Step 1 to upload documents.'}
          </div>
        </section>

        {/* Step 3: Match & Verify */}
        <section
          className={`rounded-2xl border bg-white p-6 shadow-xs transition ${
            state.tender ? 'border-slate-200 opacity-100' : 'border-slate-200/60 opacity-60'
          }`}
        >
          <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700">
                  3
                </span>
                <h2 className="text-lg font-bold text-slate-900">{t('step3Title')}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t('step3Desc')}</p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
            {t('checklistTitle')}
          </div>
        </section>

        {/* Step 4: Generate Package */}
        <section
          className={`rounded-2xl border bg-white p-6 shadow-xs transition ${
            state.tender ? 'border-slate-200 opacity-100' : 'border-slate-200/60 opacity-60'
          }`}
        >
          <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700">
                  4
                </span>
                <h2 className="text-lg font-bold text-slate-900">{t('step4Title')}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t('step4Desc')}</p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
            {t('generateTitle')}
          </div>
        </section>
      </main>
    </div>
  )
}
