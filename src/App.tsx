import { useEffect, useReducer } from 'react'
import { appReducer, initialAppState } from './lib/state'
import { sampleRequirements } from './lib/sampleData'
import { useT } from './i18n/useT'
import { LanguageToggle } from './components/LanguageToggle'
import { RequirementsLoader } from './components/RequirementsLoader'
import { TenderSummary } from './components/TenderSummary'
import { FileUploader } from './components/FileUploader'
import { FileList } from './components/FileList'
import { Checklist } from './components/Checklist'
import { GeneratePanel } from './components/GeneratePanel'

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialAppState)
  const { language, t } = useT()

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('sample') === 'true') {
        dispatch({ type: 'SET_REQUIREMENTS', payload: sampleRequirements })
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16">
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
            {(state.tender || state.files.length > 0) && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'RESET_ALL' })}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                Reset All
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
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  state.files.length > 0 ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  2
                </span>
                <h2 className="text-lg font-bold text-slate-900">{t('step2Title')}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t('step2Desc')}</p>
            </div>
            {state.files.length > 0 && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                {state.files.length} / 30 {language === 'bn' ? 'ফাইল' : 'files'}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <FileUploader
              files={state.files}
              onAddFiles={(files) => dispatch({ type: 'ADD_FILES', files })}
              onError={(error) => dispatch({ type: 'SET_UPLOAD_ERROR', error })}
              disabled={!state.tender}
            />

            {state.uploadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium">{language === 'en' ? 'Upload Warning' : 'আপলোড ত্রুটি'}</p>
                  <p className="mt-0.5 text-xs text-red-600">{state.uploadError[language]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_UPLOAD_ERROR', error: null })}
                  className="text-red-400 hover:text-red-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            <FileList
              files={state.files}
              onRemoveFile={(fileId) => dispatch({ type: 'REMOVE_FILE', fileId })}
            />
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
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  state.tender && state.requirements.length > 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-300 text-slate-700'
                }`}>
                  3
                </span>
                <h2 className="text-lg font-bold text-slate-900">{t('step3Title')}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t('step3Desc')}</p>
            </div>
          </div>

          {state.tender && state.requirements.length > 0 ? (
            <Checklist
              tender={state.tender}
              requirements={state.requirements}
              files={state.files}
              matches={state.matches}
              expiries={state.expiries}
              deadline={state.tender.submission_deadline}
              onSetMatch={(requirementId, fileId) =>
                dispatch({ type: 'SET_MATCH', requirementId, fileId })
              }
              onSetExpiry={(requirementId, expiry) =>
                dispatch({ type: 'SET_EXPIRY', requirementId, expiry })
              }
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
              {language === 'bn'
                ? 'চেকলিস্ট দেখতে অনুগ্রহ করে ধাপ ১-এ requirements.json লোড করুন।'
                : 'Load requirements.json in Step 1 to populate the checklist.'}
            </div>
          )}
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
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  state.tender && state.files.length > 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-300 text-slate-700'
                }`}>
                  4
                </span>
                <h2 className="text-lg font-bold text-slate-900">{t('step4Title')}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t('step4Desc')}</p>
            </div>
          </div>

          {state.tender ? (
            <GeneratePanel
              tender={state.tender}
              requirements={state.requirements}
              files={state.files}
              matches={state.matches}
              expiries={state.expiries}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
              {language === 'bn'
                ? 'প্যাকেজ প্রস্তুত করতে অনুগ্রহ করে ধাপ ১-এ requirements.json লোড করুন।'
                : 'Load requirements.json in Step 1 to begin package generation.'}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
