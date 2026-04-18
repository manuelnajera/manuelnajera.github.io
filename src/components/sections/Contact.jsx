import { useTranslation } from 'react-i18next'
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js'

const LINKEDIN_URL = 'https://linkedin.com/in/manuelnajera'
const EMAIL = 'mailto:manuel.najeraa@gmail.com'

export default function Contact() {
  const { t } = useTranslation()
  const sectionRef = useScrollAnimation({ targets: '.contact-anim', stagger: 0.12 })

  return (
    <section id="contact" ref={sectionRef} className="py-32 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <p className="contact-anim font-mono text-xs text-muted mb-12">{t('contact.label')}</p>

        {/* Two-audience panels */}
        <div className="contact-anim grid md:grid-cols-2 gap-px bg-border mb-14">
          {/* For businesses */}
          <div className="bg-surface p-8 sm:p-12 flex flex-col">
            <p className="font-mono text-xs text-accent mb-6">{t('contact.forBusiness.label')}</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text leading-tight mb-4">
              {t('contact.forBusiness.headline')}
            </h2>
            <p className="font-body text-sm text-muted leading-relaxed mb-8 flex-1">
              {t('contact.forBusiness.body')}
            </p>
            <a
              href={EMAIL}
              className="self-start px-6 py-3 font-mono text-sm text-accent border border-accent/50 hover:bg-accent hover:text-white transition-colors"
            >
              {t('contact.forBusiness.cta')}
            </a>
          </div>

          {/* For hiring */}
          <div className="bg-surface p-8 sm:p-12 flex flex-col">
            <p className="font-mono text-xs text-muted mb-6">{t('contact.forHiring.label')}</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text leading-tight mb-4">
              {t('contact.forHiring.headline')}
            </h2>
            <p className="font-body text-sm text-muted leading-relaxed mb-8 flex-1">
              {t('contact.forHiring.body')}
            </p>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start px-6 py-3 font-mono text-sm text-text border border-border hover:border-accent/50 transition-colors"
            >
              {t('contact.forHiring.cta')}
            </a>
          </div>
        </div>

        {/* Footer links */}
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
