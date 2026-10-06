import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { parseRequirements } from '../lib/requirements'
import { sampleRequirements } from '../lib/sampleData'
import type { RequirementsPayload } from '../lib/types'
import { useT } from '../i18n/useT'

interface RequirementsLoaderProps {
  onLoad: (payload: RequirementsPayload) => void
  onError: (error: { en: string; bn: string } | null) => void
  currentFileName?: string | null
  error?: { en: string; bn: string } | null
}

export function RequirementsLoader({
  onLoad,
  onError,
  currentFileName,
  error,
}: RequirementsLoaderProps) {
  const { language, t } = useT()
  const [isDragging, setIsDragging] = useState(false)
  const [loadedName, setLoadedName] = useState<string | null>(currentFileName || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    onError(null)
    if (!file.name.endsWith('.json')) {
      onError({
        en: `Selected file "${file.name}" is not a JSON file. Please provide a .json file.`,
        bn: `নির্বাচিত ফাইল "${file.name}" একটি JSON ফাইল নয়। অনুগ্রহ করে একটি .json ফাইল প্রদান করুন।`,
      })
      return
    }

    try {
      const text = await file.text()
      const result = parseRequirements(text)
      if (result.success && result.data) {
        setLoadedName(file.name)
        onLoad(result.data)
      } else if (result.error) {
        onError(result.error)
      }
    } catch {
      onError({
        en: `Could not read file "${file.name}".`,
        bn: `"${file.name}" ফাইলটি পড়তে ব্যর্থ হয়েছে।`,
      })
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleLoadSample = () => {
    onError(null)
    setLoadedName('sample-requirements.json (T-2026-0417)')
    onLoad(sampleRequirements)
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t('dragDropJson')}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50/60'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-slate-800">
          {loadedName ? (
            <span className="text-emerald-700 font-semibold">
              ✓ {t('loadedFile')}: {loadedName}
            </span>
          ) : (
            t('dragDropJson')
          )}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {loadedName ? t('changeFile') : 'JSON (requirements.json)'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {t('loadSampleBtn')}
        </button>

        {loadedName && (
          <span className="text-xs text-slate-500">
            {t('loadedFile')}: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">{loadedName}</code>
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">{language === 'en' ? 'Invalid Requirements File' : 'ভুল প্রয়োজনীয় নথির ফাইল'}</p>
            <p className="mt-0.5 text-xs text-red-600">{error[language]}</p>
          </div>
        </div>
      )}
    </div>
  )
}
