import { useT } from '../i18n/useT'

export function LanguageToggle() {
  const { language, toggleLanguage } = useT()

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle language"
    >
      <svg
        className="h-4 w-4 text-slate-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 uppercase">
        {language}
      </span>
    </button>
  )
}
