import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en'

  const switchLang = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('i18nextLng', lang)
    navigate(lang === 'es' ? '/es' : '/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-bg/85 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-lg text-text tracking-tight">MN</span>
        <span className="hidden sm:block font-mono text-xs text-muted">
          manuelnajera.github.io
        </span>
      </div>

      {/* Nav + language toggle */}
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6">
          {['about', 'projects', 'stack', 'contact'].map((key) => (
            <a
              key={key}
              href={`#${key}`}
              className="font-mono text-xs text-muted hover:text-text transition-colors"
            >
              {t(`nav.${key}`)}
            </a>
          ))}
        </nav>

        {/* EN / ES toggle */}
        <div className="flex items-center border border-border">
          {['en', 'es'].map((lang) => (
            <button
              key={lang}
              onClick={() => switchLang(lang)}
              className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                currentLang === lang
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-text'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
