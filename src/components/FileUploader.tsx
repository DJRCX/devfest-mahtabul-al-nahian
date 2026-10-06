import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { readPdf } from '../lib/pdfFiles'
import type { UploadedFile } from '../lib/types'
import { useT } from '../i18n/useT'

interface FileUploaderProps {
  files: UploadedFile[]
  onAddFiles: (newFiles: UploadedFile[]) => void
  onError: (error: { en: string; bn: string } | null) => void
  disabled?: boolean
}

const MAX_FILES = 30
const MAX_TOTAL_BYTES = 50 * 1024 * 1024 // 50 MB

export function FileUploader({ files, onAddFiles, onError, disabled }: FileUploaderProps) {
  const { language, t } = useT()
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentTotalSize = files.reduce((acc, f) => acc + f.size, 0)

  const processFiles = async (fileList: FileList | File[]) => {
    if (disabled || processing) return
    onError(null)
    setProcessing(true)

    const incoming = Array.from(fileList)
    if (files.length + incoming.length > MAX_FILES) {
      onError({
        en: `Cannot add ${incoming.length} files. Total would exceed maximum limit of ${MAX_FILES} files.`,
        bn: `${incoming.length}টি ফাইল যোগ করা সম্ভব নয়। সর্বোচ্চ ${MAX_FILES}টি ফাইলের সীমা অতিক্রম করবে।`,
      })
      setProcessing(false)
      return
    }

    let runningSize = currentTotalSize
    const accepted: UploadedFile[] = []
    const errors: Array<{ en: string; bn: string }> = []

    for (const f of incoming) {
      if (runningSize + f.size > MAX_TOTAL_BYTES) {
        errors.push({
          en: `Skipped "${f.name}": Exceeds total size limit of 50 MB.`,
          bn: `"${f.name}" বাদ দেওয়া হয়েছে: মোট ৫০ মেগাবাইটের সীমা অতিক্রম করেছে।`,
        })
        continue
      }

      const res = await readPdf(f)
      if (res.success && res.file) {
        accepted.push(res.file)
        runningSize += f.size
      } else if (res.error) {
        errors.push(res.error)
      }
    }

    if (errors.length > 0) {
      onError({
        en: errors.map((e) => e.en).join(' '),
        bn: errors.map((e) => e.bn).join(' '),
      })
    }

    if (accepted.length > 0) {
      onAddFiles(accepted)
    }

    setProcessing(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !disabled && !processing && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !processing) {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || processing}
        aria-label={t('dragDropPdfs')}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
          disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
            : isDragging
              ? 'cursor-pointer border-blue-500 bg-blue-50/60'
              : 'cursor-pointer border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || processing}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-slate-800">
          {processing
            ? language === 'bn'
              ? 'ফাইল প্রসেসিং হচ্ছে...'
              : 'Processing PDF files...'
            : t('dragDropPdfs')}
        </p>
        <p className="mt-1 text-xs text-slate-500">{t('fileLimitWarning')}</p>
      </div>
    </div>
  )
}
