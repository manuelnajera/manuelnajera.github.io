import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Tag from './Tag.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectCard({
  title,
  url,
  oneliner,
  description,
  tags,
  featured,
  featuredLabel,
  liveLabel,
  href,
}) {
  const cardRef = useRef(null)

  useEffect(() => {
    if (!cardRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, rotationX: 4 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 88%',
          },
        }
      )
    }, cardRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={cardRef}
      className="border border-border bg-surface p-8 sm:p-12 transition-all duration-300 hover:border-accent hover:-translate-y-1"
      style={{ opacity: 0 }}
    >
      {featured && (
        <span className="inline-block mb-4 px-2 py-0.5 font-mono text-xs text-accent border border-accent/30 bg-accent/5">
          {featuredLabel}
        </span>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-text leading-tight">{title}</h3>
          <p className="font-mono text-xs text-muted mt-1">{url}</p>
        </div>
        <a
          href={`https://${href}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-start px-4 py-2 font-mono text-xs text-accent border border-accent/40 hover:bg-accent hover:text-white transition-colors"
        >
          {liveLabel}
        </a>
      </div>

      <p className="font-body text-base text-text mb-3 leading-snug">{oneliner}</p>
      <p className="font-body text-sm text-muted leading-relaxed mb-6">{description}</p>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </div>
  )
}
