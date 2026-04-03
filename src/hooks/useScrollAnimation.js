import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollAnimation({
  y = 30,
  duration = 0.7,
  ease = 'power2.out',
  stagger = 0.1,
  trigger = 'top 80%',
  targets = null,
} = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const animTargets = targets ? el.querySelectorAll(targets) : el

    const ctx = gsap.context(() => {
      gsap.fromTo(
        animTargets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          ease,
          stagger,
          scrollTrigger: {
            trigger: el,
            start: trigger,
          },
        }
      )
    }, el)

    return () => ctx.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}
