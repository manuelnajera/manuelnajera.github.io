import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import GridCanvas from '../three/GridCanvas.jsx'

export default function Hero() {
  const { t } = useTranslation()
  const roles = t('hero.roles', { returnObjects: true })

  const [roleIndex, setRoleIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [typewriterOn, setTypewriterOn] = useState(false)

  const nameRef = useRef(null)
  const taglineRef = useRef(null)

  // Fade-in name, then start typewriter
  useEffect(() => {
    if (!nameRef.current || !taglineRef.current) return

    gsap.fromTo(
      nameRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => setTypewriterOn(true),
      }
    )
    gsap.fromTo(taglineRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.2 })
  }, [])

  // Typewriter loop
  useEffect(() => {
    if (!typewriterOn) return
    const current = roles[roleIndex]
    let t

    if (!isDeleting && displayed.length < current.length) {
      t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 75)
    } else if (!isDeleting && displayed.length === current.length) {
      t = setTimeout(() => setIsDeleting(true), 2200)
    } else if (isDeleting && displayed.length > 0) {
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 38)
    } else {
      setIsDeleting(false)
      setRoleIndex((i) => (i + 1) % roles.length)
    }

    return () => clearTimeout(t)
  }, [displayed, isDeleting, roleIndex, typewriterOn, roles])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden scanlines">
      <GridCanvas />

      {/* Coordinate label — Tuxtla Gutiérrez, Chiapas */}
      <div className="absolute bottom-8 left-6 font-mono text-xs text-muted/60 z-10 hidden sm:block">
        16.7516° N / 93.1152° W
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <h1
          ref={nameRef}
          className="font-display font-bold text-[clamp(52px,10vw,108px)] text-text leading-none tracking-tight"
          style={{ opacity: 0 }}
        >
          Manuel Nájera
        </h1>

        {/* Typewriter row */}
        <div className="mt-6 h-9 flex items-center justify-center">
          <span className="font-mono text-lg sm:text-xl text-accent">
            {displayed}
            <span className="cursor-blink ml-0.5">|</span>
          </span>
        </div>

        <p
          ref={taglineRef}
          className="mt-4 font-body text-base text-muted max-w-sm mx-auto"
          style={{ opacity: 0 }}
        >
          {t('hero.tagline')}
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-6 font-mono text-xs text-muted/60 z-10 bounce-y">
        {t('hero.scroll')}
      </div>
    </section>
  )
}
