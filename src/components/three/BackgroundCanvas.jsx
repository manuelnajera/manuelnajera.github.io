import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { useTheme } from '../../context/ThemeContext.jsx'

const COLS = 25
const ROWS = 20
const POINT_COUNT = COLS * ROWS
const SPREAD_X = 22
const SPREAD_Y = 18
const Z_NOISE = 1.4

// ── Scroll state per section ─────────────────────────────────────────────
// cam [x,y,z]: camera position
// look [x,y]: lookAt target (z is always 0)
// opacity: grid line opacity (dark mode base)
// waveA: Z-wave amplitude — controls how "alive" the grid feels
// waveF: Z-wave frequency
// scaleX/Y: grid scale on those axes
const SCROLL_STATES = [
  // Hero — wide surveying view, active wave, prominent grid
  { at: 0.00, cam: [0,   5, 20], look: [ 0,  0], opacity: 0.30, waveA: 0.55, waveF: 0.45, scaleX: 1.00, scaleY: 1.00 },
  // About — camera drifts left and up, grid compresses vertically
  { at: 0.22, cam: [-4,  7, 19], look: [-1,  0], opacity: 0.22, waveA: 0.22, waveF: 0.75, scaleX: 0.85, scaleY: 1.20 },
  // Projects — camera swings right and low, grid stretches wide
  { at: 0.46, cam: [ 5,  2, 23], look: [ 1, -1], opacity: 0.26, waveA: 0.38, waveF: 1.10, scaleX: 1.30, scaleY: 0.75 },
  // Skills — camera rises high to survey, big rolling wave
  { at: 0.68, cam: [ 0, 11, 19], look: [ 0,  0], opacity: 0.20, waveA: 0.65, waveF: 0.38, scaleX: 1.40, scaleY: 1.40 },
  // Contact — camera pulls in close, grid shrinks, tight rapid wave
  { at: 0.88, cam: [ 0,  1, 14], look: [ 0,  0], opacity: 0.26, waveA: 0.18, waveF: 1.70, scaleX: 0.70, scaleY: 0.70 },
]

// Light mode: grid needs higher opacity to be visible against light bg
const LIGHT_OPACITY_BOOST = 1.5
// Dark mode Three.js color / light mode color
const GRID_COLOR = { dark: 0x3b82f6, light: 0x1d4ed8 }

// Smoothstep — eases transitions between states
const smoothstep = (t) => t * t * (3 - 2 * t)

// Linear interpolate
const lerp = (a, b, t) => a + (b - a) * t

// Frame-rate independent lerp using exponential decay
// halfLife: frames (at 60fps) for error to halve
const expLerp = (cur, tgt, halfLife, dt) => {
  const factor = 1 - Math.pow(0.5, (dt * 60) / halfLife)
  return cur + (tgt - cur) * factor
}

export default function BackgroundCanvas() {
  const mountRef = useRef(null)
  const materialRef = useRef(null)
  const themeRef = useRef('dark')
  const { theme } = useTheme()

  // Update Three.js color when theme changes — no re-init required
  useEffect(() => {
    themeRef.current = theme
    if (!materialRef.current) return
    materialRef.current.color.setHex(GRID_COLOR[theme] ?? GRID_COLOR.dark)
  }, [theme])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Renderer ─────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene + camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 5, 20)
    camera.lookAt(0, 0, 0)

    // ── Grid geometry ─────────────────────────────────────────────────────
    const positions = new Float32Array(POINT_COUNT * 3)
    const originalZ = new Float32Array(POINT_COUNT)
    const lineIndices = []

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i = row * COLS + col
        const x = (col / (COLS - 1) - 0.5) * SPREAD_X
        const y = (row / (ROWS - 1) - 0.5) * SPREAD_Y
        const z = (Math.random() - 0.5) * Z_NOISE

        positions[i * 3]     = x
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = z
        originalZ[i] = z

        if (col < COLS - 1) lineIndices.push(i, i + 1)
        if (row < ROWS - 1) lineIndices.push(i, i + COLS)
      }
    }

    const geometry = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(positions, 3)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', posAttr)
    geometry.setIndex(lineIndices)

    const material = new THREE.LineBasicMaterial({
      color: GRID_COLOR[themeRef.current] ?? GRID_COLOR.dark,
      transparent: true,
      opacity: 0.30,
    })
    materialRef.current = material

    const grid = new THREE.LineSegments(geometry, material)
    scene.add(grid)

    // ── Animated state — smoothly tracks scroll-driven targets ───────────
    // Using a single object so we can iterate keys for the lerp loop
    const cur = {
      camX: 0, camY: 5, camZ: 20,
      lookX: 0, lookY: 0,
      opacity: 0.30,
      waveA: 0.55, waveF: 0.45,
      scaleX: 1.0, scaleY: 1.0,
    }

    // Half-life (frames at 60fps) for each state property
    // Lower = snappier, higher = more cinematic lag
    const HALF_LIFE = {
      camX: 30, camY: 30, camZ: 30,    // camera: 0.5s to halve the distance
      lookX: 25, lookY: 25,
      opacity: 20,
      waveA: 35, waveF: 35,            // wave params: slower change for continuity
      scaleX: 40, scaleY: 40,          // scale: very smooth, barely noticeable shift
    }

    // ── Interaction ───────────────────────────────────────────────────────
    const mouse = new THREE.Vector2(9999, 9999)
    const raycaster = new THREE.Raycaster()
    const hitPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const mouseWorld = new THREE.Vector3()
    let scrollProgress = 0

    const onMouseMove = (e) => {
      mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onTouchMove = (e) => {
      const t = e.touches[0]
      mouse.x =  (t.clientX / window.innerWidth)  * 2 - 1
      mouse.y = -(t.clientY / window.innerHeight) * 2 + 1
    }
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      scrollProgress = max > 0 ? window.scrollY / max : 0
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Animation loop ────────────────────────────────────────────────────
    let rafId
    let running = true
    let time = 0
    let lastTs = performance.now()

    const animate = (now) => {
      if (!running) return
      rafId = requestAnimationFrame(animate)

      // Frame-rate independent delta time (capped at 50ms to prevent spiral on hidden tab)
      const dt = Math.min((now - lastTs) / 1000, 0.05)
      lastTs = now
      time += dt

      // ── Find which two scroll states we're interpolating between ───────
      let idx = SCROLL_STATES.length - 2
      for (let i = 0; i < SCROLL_STATES.length - 1; i++) {
        if (scrollProgress < SCROLL_STATES[i + 1].at) { idx = i; break }
      }
      const s0 = SCROLL_STATES[idx]
      const s1 = SCROLL_STATES[idx + 1]
      const range = s1.at - s0.at
      const raw = range > 0 ? (scrollProgress - s0.at) / range : 1
      // Smoothstep easing between the two section states
      const eT = smoothstep(Math.max(0, Math.min(1, raw)))

      // Compute interpolated target values between the two states
      const tgt = {
        camX:  lerp(s0.cam[0],  s1.cam[0],  eT),
        camY:  lerp(s0.cam[1],  s1.cam[1],  eT),
        camZ:  lerp(s0.cam[2],  s1.cam[2],  eT),
        lookX: lerp(s0.look[0], s1.look[0], eT),
        lookY: lerp(s0.look[1], s1.look[1], eT),
        opacity: lerp(s0.opacity, s1.opacity, eT),
        waveA:   lerp(s0.waveA,   s1.waveA,   eT),
        waveF:   lerp(s0.waveF,   s1.waveF,   eT),
        scaleX:  lerp(s0.scaleX,  s1.scaleX,  eT),
        scaleY:  lerp(s0.scaleY,  s1.scaleY,  eT),
      }

      // Smooth each current value toward its target using exponential decay
      for (const key in cur) {
        cur[key] = expLerp(cur[key], tgt[key], HALF_LIFE[key] ?? 30, dt)
      }

      // ── Apply camera ───────────────────────────────────────────────────
      camera.position.set(cur.camX, cur.camY, cur.camZ)
      camera.lookAt(cur.lookX, cur.lookY, 0)

      // ── Apply opacity (boost in light mode for visibility on light bg) ─
      const boost = themeRef.current === 'light' ? LIGHT_OPACITY_BOOST : 1
      material.opacity = Math.min(cur.opacity * boost, 0.95)

      // ── Apply grid scale ───────────────────────────────────────────────
      grid.scale.set(cur.scaleX, cur.scaleY, 1)

      // ── Continuous slow rotation ───────────────────────────────────────
      grid.rotation.x += 0.00018 * dt * 60
      grid.rotation.y += 0.00022 * dt * 60

      // ── Mouse deformation fades out as user leaves the hero ────────────
      const mouseInfluence = Math.max(0, 1 - scrollProgress * 5)
      if (mouseInfluence > 0.01) {
        raycaster.setFromCamera(mouse, camera)
        raycaster.ray.intersectPlane(hitPlane, mouseWorld)
      }

      // ── Update vertex Z: rolling wave + mouse push ─────────────────────
      for (let i = 0; i < POINT_COUNT; i++) {
        const col = i % COLS
        const row = Math.floor(i / COLS)

        // Rolling wave that changes character (amplitude + frequency) per section
        const wave = Math.sin(time * cur.waveF + col * 0.4 + row * 0.3) * cur.waveA
        let z = originalZ[i] + wave

        // Mouse pushes vertices away — only active near the top of the page
        if (mouseInfluence > 0.01) {
          const dx = posAttr.getX(i) - mouseWorld.x
          const dy = posAttr.getY(i) - mouseWorld.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const push = Math.max(0, 1 - dist / 3.5) * 0.9 * mouseInfluence
          z += push
        }

        posAttr.setZ(i, z)
      }
      posAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate(performance.now())

    // Pause when tab is hidden (save GPU)
    const onVisibility = () => {
      running = !document.hidden
      if (running) { lastTs = performance.now(); animate(lastTs) }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Fade in on mount
    gsap.fromTo(renderer.domElement, { opacity: 0 }, { opacity: 1, duration: 1.8, delay: 0.2 })

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, []) // intentionally mount-only — theme updates handled by the separate useEffect above

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
