import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext.jsx'

const SunIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="2"  x2="12" y2="5"  />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="2"  y1="12" x2="5"  y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export default function Header() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

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

      {/* Nav + toggles */}
      <div className="flex items-center gap-4">
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

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border border-border text-muted hover:text-text transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          <span className="hidden sm:inline">
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </span>
        </button>

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
