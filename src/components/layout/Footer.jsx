import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border px-6 py-10 text-center">
      <p className="font-mono text-xs text-muted">{t('contact.built')}</p>
      <p className="font-mono text-xs text-muted mt-2">{t('contact.copyright')}</p>
    </footer>
  )
}
