import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js'
import Tag from '../ui/Tag.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function Skills() {
  const { t } = useTranslation()
  const rows = t('skills.rows', { returnObjects: true })
  const sectionRef = useScrollAnimation({ targets: '.stack-label', stagger: 0.08 })
  const tagsRef = useRef(null)

  useEffect(() => {
    if (!tagsRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tagsRef.current.querySelectorAll('.tag-pill'),
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.025,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: tagsRef.current,
            start: 'top 82%',
          },
        }
      )
    }, tagsRef)

    return () => ctx.revert()
  }, [rows])

  return (
    <section id="stack" ref={sectionRef} className="py-32 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <p className="stack-label font-mono text-xs text-muted mb-16">{t('skills.label')}</p>

        <div ref={tagsRef} className="space-y-12">
          {rows.map((row) => (
            <div key={row.category}>
              <p className="stack-label font-mono text-xs text-muted mb-4">{row.category}</p>
              <div className="flex flex-wrap gap-2">
                {row.items.map((item) => (
                  <span key={item} className="tag-pill" style={{ opacity: 0 }}>
                    <Tag glow>{item}</Tag>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
