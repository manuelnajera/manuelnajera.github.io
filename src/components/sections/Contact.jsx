import { useTranslation } from 'react-i18next'
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js'

// Update these before publishing
const LINKEDIN_URL = 'https://linkedin.com/in/manuelnajera'
const EMAIL = 'mailto:manuelnajera.dev@gmail.com'

export default function Contact() {
  const { t } = useTranslation()
  const sectionRef = useScrollAnimation({ targets: '.contact-anim', stagger: 0.12 })

  return (
    <section id="contact" ref={sectionRef} className="py-32 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <p className="contact-anim font-mono text-xs text-muted mb-6">{t('contact.label')}</p>

        <h2 className="contact-anim font-display font-bold text-3xl sm:text-4xl text-text mb-12 max-w-xl leading-tight">
          {t('contact.headline')}
        </h2>

        <div className="contact-anim flex flex-wrap gap-4 mb-14">
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 font-mono text-sm text-accent border border-accent/50 hover:bg-accent hover:text-white transition-colors"
          >
            {t('contact.linkedin')}
          </a>
          <a
            href={EMAIL}
            className="px-6 py-3 font-mono text-sm text-text border border-border hover:border-accent/50 transition-colors"
          >
            {t('contact.email')}
          </a>
        </div>

        <div className="contact-anim flex flex-wrap gap-6 font-mono text-xs text-muted">
          <a
            href="https://github.com/manuelnajera"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors"
          >
            github.com/manuelnajera ↗
          </a>
          <a
            href="https://deltavis.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors"
          >
            deltavis.app ↗
          </a>
        </div>
      </div>
    </section>
  )
}
