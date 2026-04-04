import { useTranslation } from 'react-i18next'
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js'
import Timeline from '../ui/Timeline.jsx'

export default function About() {
  const { t } = useTranslation()
  const timeline = t('about.timeline', { returnObjects: true })
  const sectionRef = useScrollAnimation({ targets: '.about-anim', stagger: 0.12 })

  return (
    <section id="about" ref={sectionRef} className="py-32 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[2fr_3fr] gap-16 lg:gap-24">
        {/* Left */}
        <div>
          <p className="about-anim font-mono text-xs mb-6" style={{ color: 'rgb(var(--color-muted))' }}>{t('about.label')}</p>
          <h2
            className="about-anim font-display font-bold text-3xl sm:text-4xl leading-tight mb-8"
            style={{ color: 'rgb(var(--color-text))' }}
          >
            {t('about.pullQuote')}
          </h2>
          <p className="about-anim font-body text-sm leading-relaxed" style={{ color: 'rgb(var(--color-muted))' }}>
            {t('about.bio')}
          </p>
        </div>

        {/* Right — timeline */}
        <div className="about-anim">
          <Timeline items={timeline} />
        </div>
      </div>
    </section>
  )
}
