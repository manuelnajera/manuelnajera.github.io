import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Timeline({ items }) {
  const containerRef = useRef(null)
  const lineRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !lineRef.current) return

    const ctx = gsap.context(() => {
      // Line draws downward
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.4,
          ease: 'power2.out',
          transformOrigin: 'top center',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          },
        }
      )

      // Dots pop in sequentially
      gsap.fromTo(
        containerRef.current.querySelectorAll('.timeline-dot'),
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: 0.28,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          },
        }
      )

      // Text entries slide in
      gsap.fromTo(
        containerRef.current.querySelectorAll('.timeline-entry'),
        { opacity: 0, x: 14 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.28,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          },
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [items])

  return (
    <div ref={containerRef} className="relative pl-8">
      {/* Vertical line */}
      <div
        ref={lineRef}
        className="absolute left-0 top-2 bottom-2 w-px bg-border origin-top"
      />

      <div className="space-y-10">
        {items.map((item, i) => (
          <div key={i} className="relative">
            <div className="timeline-dot absolute -left-8 top-1.5 w-2 h-2 rounded-full bg-accent" />
            <div className="timeline-entry">
              <span className="font-mono text-xs text-accent">{item.period}</span>
              <h4 className="font-display font-semibold text-sm text-text mt-0.5">{item.role}</h4>
              <p className="font-body text-xs text-muted mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
