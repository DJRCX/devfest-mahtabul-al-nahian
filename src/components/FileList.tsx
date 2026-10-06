import type { UploadedFile } from '../lib/types'
import { useT } from '../i18n/useT'

interface FileListProps {
  files: UploadedFile[]
  onRemoveFile: (fileId: string) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function FileList({ files, onRemoveFile }: FileListProps) {
  const { language, t } = useT()

  if (files.length === 0) {
    return null
  }

  // Map to identify first occurrence of each SHA-256 hash
  const hashToFirstFile = new Map<string, UploadedFile>()
  const duplicates = new Map<string, string>() // fileId -> firstFileName

  files.forEach((f) => {
    if (hashToFirstFile.has(f.hash)) {
      const first = hashToFirstFile.get(f.hash)!
      duplicates.set(f.id, first.name)
    } else {
      hashToFirstFile.set(f.hash, f)
    }
  })

  const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0)
  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  const handlePreview = (file: UploadedFile) => {
    try {
      const blob = new Blob([file.bytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      // Revoke after a delay to allow browser to open
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (err) {
      console.error('Failed to open preview:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* File stats strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-xs text-slate-600 border border-slate-200">
        <div className="flex items-center gap-4">
          <span>
            {t('uploadedFilesCount')}: <strong className="text-slate-900">{files.length}</strong> / 30
          </span>
          <span>
            {language === 'bn' ? 'মোট পৃষ্ঠা' : 'Total Pages'}: <strong className="text-slate-900">{totalPages}</strong>
          </span>
        </div>
        <div>
          {t('totalSize')}: <strong className="text-slate-900">{formatBytes(totalSize)}</strong> / 50 MB
        </div>
      </div>

      {/* File items list */}
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {files.map((file) => {
          const duplicateOfName = duplicates.get(file.id)

          return (
            <li
              key={file.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3.5 hover:bg-slate-50/70 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-900 font-mono" title={file.name}>
                      {file.name}
                    </span>
                    {duplicateOfName && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800 shrink-0">
                        ⚠️ {t('duplicateBadge')}: {duplicateOfName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>
                      {file.pageCount} {t('summaryOrder') === 'ক্রম' ? 'পৃষ্ঠা' : 'pages'}
                    </span>
                    <span>•</span>
                    <span>{formatBytes(file.size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePreview(file)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  {t('previewFile')}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveFile(file.id)}
                  className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 transition"
                >
                  {t('removeFile')}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
