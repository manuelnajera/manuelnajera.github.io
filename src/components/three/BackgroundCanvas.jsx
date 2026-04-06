import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { useTheme } from '../../context/ThemeContext.jsx'

// ── Lattice Tower Parameters ──────────────────────────────────────────────────
const T_LEVELS  = 12
const T_HEIGHT  = 22
const T_BASE_H  = 4.5
const T_TOP_H   = 0.85
const T_LEVEL_H = T_HEIGHT / T_LEVELS

function halfAt(ly) {
  return T_BASE_H + (T_TOP_H - T_BASE_H) * (ly / T_LEVELS)
}

function cornersAt(ly) {
  const h = halfAt(ly)
  const y = ly * T_LEVEL_H
  return [[-h, y, -h], [h, y, -h], [h, y, h], [-h, y, h]]
}

// ── Geometry Builders ─────────────────────────────────────────────────────────
function buildTower() {
  const v = []
  for (let ly = 0; ly < T_LEVELS; ly++) {
    const lo = cornersAt(ly)
    const hi = cornersAt(ly + 1)
    for (let c = 0; c < 4; c++) v.push(...lo[c], ...lo[(c + 1) % 4])   // horizontal ring
    for (let c = 0; c < 4; c++) v.push(...lo[c], ...hi[c])              // vertical columns
    for (let c = 0; c < 4; c++) {                                        // X-brace each face
      const cn = (c + 1) % 4
      v.push(...lo[c], ...hi[cn])
      v.push(...lo[cn], ...hi[c])
    }
  }
  const top = cornersAt(T_LEVELS)
  for (let c = 0; c < 4; c++) v.push(...top[c], ...top[(c + 1) % 4])   // top cap
  return new Float32Array(v)
}

function buildCrossMembers() {
  const v = []
  for (let ly = 2; ly < T_LEVELS; ly += 2) {
    const cs = cornersAt(ly)
    v.push(...cs[0], ...cs[2])
    v.push(...cs[1], ...cs[3])
  }
  return new Float32Array(v)
}

function buildNodePoints() {
  const v = []
  for (let ly = 0; ly <= T_LEVELS; ly++) {
    for (const c of cornersAt(ly)) v.push(...c)
  }
  return new Float32Array(v)
}

function buildGroundGrid(size = 48, step = 2.8) {
  const v = []
  const n = Math.round(size / step)
  const half = size / 2
  for (let i = 0; i <= n; i++) {
    const p = -half + i * step
    v.push(-half, 0, p, half, 0, p)
    v.push(p, 0, -half, p, 0, half)
  }
  return new Float32Array(v)
}

// ── Fragment instances — reuses tower geometry at different scales + positions ─
// Foreground: inside camera orbit radius (7–10) — shifts heavily as cam moves
// Background: outside camera orbit (35–45) — shifts opposite direction
const FRAGMENT_DEFS = [
  // [x, y, z, scale, rotY, layer]   layer: 'fg' | 'bg'
  [ 8.5,  6.0,  2.0,  0.19, 0.5,  'fg'],
  [-2.0, 10.5,  9.0,  0.14, 1.8,  'fg'],
  [-9.0,  2.5, -2.5,  0.17, 3.3,  'fg'],
  [28.0,  7.0, 22.0,  0.11, 0.9,  'bg'],
  [-32.0,13.0, -6.0,  0.09, 2.2,  'bg'],
  [ 8.0,  5.0,-38.0,  0.10, 4.1,  'bg'],
]

// ── Camera Orbit Path ─────────────────────────────────────────────────────────
const CAM_KEYS = [
  { at: 0.00, angle: -0.25, elev:  5.5, radius: 28, lookY: T_HEIGHT * 0.30 },
  { at: 0.25, angle:  0.90, elev:  3.0, radius: 23, lookY: T_HEIGHT * 0.28 },
  { at: 0.50, angle:  2.00, elev:  0.8, radius: 18, lookY: T_HEIGHT * 0.22 },
  { at: 0.72, angle:  3.20, elev: 26.0, radius: 28, lookY: T_HEIGHT * 0.60 },
  { at: 1.00, angle:  4.80, elev:  9.0, radius: 24, lookY: T_HEIGHT * 0.38 },
]

const ss  = (t) => t * t * (3 - 2 * t)
const lrp = (a, b, t) => a + (b - a) * t

function sampleCam(progress) {
  const p = Math.max(0, Math.min(1, progress))
  let i = 0
  while (i < CAM_KEYS.length - 2 && p >= CAM_KEYS[i + 1].at) i++
  const a = CAM_KEYS[i], b = CAM_KEYS[i + 1]
  const range = b.at - a.at
  const t = ss(range > 0 ? Math.max(0, Math.min(1, (p - a.at) / range)) : 1)
  return {
    angle:  lrp(a.angle,  b.angle,  t),
    elev:   lrp(a.elev,   b.elev,   t),
    radius: lrp(a.radius, b.radius, t),
    lookY:  lrp(a.lookY,  b.lookY,  t),
  }
}

// ── Theme configs ─────────────────────────────────────────────────────────────
// Light mode: AdditiveBlending + light bg = lines vanish (adds color to white = white).
// Switch to NormalBlending in light and compensate with higher opacity.
const THEME_CFG = {
  dark: {
    colors:   { tower: 0x3b82f6, cross: 0x3b82f6, grid: 0x3b82f6,
                node: 0x93c5fd, fgFrag: 0x3b82f6, bgFrag: 0x3b82f6, fog: 0x050508 },
    opacity:  { tower: 0.82, cross: 0.30, grid: 0.09, node: 0.90, fg: 0.28, bg: 0.09 },
    blending: THREE.AdditiveBlending,
  },
  light: {
    colors:   { tower: 0x1e40af, cross: 0x1e3a8a, grid: 0x1e40af,
                node: 0x1d4ed8, fgFrag: 0x1e40af, bgFrag: 0x1e40af, fog: 0xf1f5f9 },
    opacity:  { tower: 0.92, cross: 0.65, grid: 0.25, node: 0.95, fg: 0.60, bg: 0.22 },
    blending: THREE.NormalBlending,
  },
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BackgroundCanvas() {
  const mountRef   = useRef(null)
  const refsRef    = useRef({})   // collects all material refs for theme updates
  const fogRef     = useRef(null)
  const themeRef   = useRef('dark')
  const { theme }  = useTheme()

  useEffect(() => {
    themeRef.current = theme
    const cfg = THEME_CFG[theme] ?? THEME_CFG.dark
    const { colors: c, opacity: o, blending: b } = cfg
    const r = refsRef.current

    const applyMat = (mat, hex, opacity) => {
      if (!mat) return
      mat.color.setHex(hex)
      mat.opacity = opacity
      mat.blending = b
      mat.needsUpdate = true
    }

    applyMat(r.towerMat, c.tower,  o.tower)
    applyMat(r.crossMat, c.cross,  o.cross)
    applyMat(r.gridMat,  c.grid,   o.grid)
    applyMat(r.fgMat,    c.fgFrag, o.fg)
    applyMat(r.bgMat,    c.bgFrag, o.bg)
    if (r.nodeMat) {
      r.nodeMat.color.setHex(c.node)
      r.nodeMat.opacity = o.node
      r.nodeMat.blending = b
      r.nodeMat.needsUpdate = true
    }
    if (fogRef.current) fogRef.current.color.setHex(c.fog)
  }, [theme])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const isMobile = window.innerWidth < 768
    const cfg = THEME_CFG[themeRef.current] ?? THEME_CFG.dark
    const c   = cfg.colors
    const o   = cfg.opacity
    const b   = cfg.blending
    const refs = refsRef.current

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene + fog ───────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const fog   = new THREE.FogExp2(c.fog, 0.014)
    scene.fog   = fog
    fogRef.current = fog

    // ── Camera ────────────────────────────────────────────────────────────
    const cam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300)

    // ── Shared tower geometry (reused across main + all fragment instances) ─
    const towerGeo = new THREE.BufferGeometry()
    towerGeo.setAttribute('position', new THREE.BufferAttribute(buildTower(), 3))

    // ── Main tower — midground anchor ─────────────────────────────────────
    const towerMat = new THREE.LineBasicMaterial({
      color: c.tower, transparent: true, opacity: isMobile ? o.tower * 0.80 : o.tower,
      blending: b, depthWrite: false,
    })
    refs.towerMat = towerMat
    scene.add(new THREE.LineSegments(towerGeo, towerMat))

    // ── Cross members — secondary structural detail ────────────────────────
    const crossGeo = new THREE.BufferGeometry()
    crossGeo.setAttribute('position', new THREE.BufferAttribute(buildCrossMembers(), 3))
    const crossMat = new THREE.LineBasicMaterial({
      color: c.cross, transparent: true, opacity: o.cross,
      blending: b, depthWrite: false,
    })
    refs.crossMat = crossMat
    scene.add(new THREE.LineSegments(crossGeo, crossMat))

    // ── Depth layers: foreground fragments (inside orbit) + background (outside) ─
    // Foreground fragments are visually LARGER on screen (closer) and shift more
    // as the camera orbits → classic parallax against the stable midground tower.
    // Background fragments shift in the opposite direction, completing Z-depth.
    const fgMat = new THREE.LineBasicMaterial({
      color: c.fgFrag, transparent: true, opacity: isMobile ? o.fg * 0.75 : o.fg,
      blending: b, depthWrite: false,
    })
    refs.fgMat = fgMat

    const bgMat = new THREE.LineBasicMaterial({
      color: c.bgFrag, transparent: true, opacity: o.bg,
      blending: b, depthWrite: false,
    })
    refs.bgMat = bgMat

    const fragments = []
    for (const [x, y, z, scale, rotY, layer] of FRAGMENT_DEFS) {
      const mesh = new THREE.LineSegments(towerGeo, layer === 'fg' ? fgMat : bgMat)
      mesh.scale.setScalar(scale)
      mesh.position.set(x, y, z)
      mesh.rotation.y = rotY
      // Slight X tilt so they read as structural fragments, not upright copies
      mesh.rotation.x = layer === 'fg' ? 0.08 : -0.05
      scene.add(mesh)
      fragments.push({ mesh, layer, baseRotY: rotY })
    }

    // ── Ground survey grid ─────────────────────────────────────────────────
    const gridGeo = new THREE.BufferGeometry()
    gridGeo.setAttribute('position', new THREE.BufferAttribute(buildGroundGrid(), 3))
    const gridMat = new THREE.LineBasicMaterial({
      color: c.grid, transparent: true, opacity: o.grid,
      blending: b, depthWrite: false,
    })
    refs.gridMat = gridMat
    scene.add(new THREE.LineSegments(gridGeo, gridMat))

    // ── Node glow points (desktop only) ───────────────────────────────────
    let nodeMat = null
    if (!isMobile) {
      const nodeGeo = new THREE.BufferGeometry()
      nodeGeo.setAttribute('position', new THREE.BufferAttribute(buildNodePoints(), 3))
      nodeMat = new THREE.PointsMaterial({
        color: c.node, size: 0.18, transparent: true, opacity: o.node,
        blending: b, depthWrite: false, sizeAttenuation: true,
      })
      refs.nodeMat = nodeMat
      scene.add(new THREE.Points(nodeGeo, nodeMat))
    }

    // ── Interaction state ──────────────────────────────────────────────────
    let scrollProgress = 0
    const mouse  = { x: 0, y: 0 }
    const tMouse = { x: 0, y: 0 }
    const cur    = { ...sampleCam(0) }

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      scrollProgress = max > 0 ? window.scrollY / max : 0
    }
    const onMouseMove = (e) => {
      tMouse.x = e.clientX / window.innerWidth  - 0.5
      tMouse.y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('scroll',    onScroll,    { passive: true })
    window.addEventListener('mousemove', onMouseMove)

    // ── Animation loop ─────────────────────────────────────────────────────
    let rafId, running = true, time = 0, lastTs = performance.now()

    const animate = (now) => {
      if (!running) return
      rafId = requestAnimationFrame(animate)

      const dt = Math.min((now - lastTs) / 1000, 0.05)
      lastTs = now
      time  += dt

      mouse.x += (tMouse.x - mouse.x) * 0.06
      mouse.y += (tMouse.y - mouse.y) * 0.06

      // Smooth camera toward scroll-driven target
      const tgt = sampleCam(scrollProgress)
      const k   = 1 - Math.pow(0.5, dt * 60 / 28)
      cur.angle  += (tgt.angle  - cur.angle)  * k
      cur.elev   += (tgt.elev   - cur.elev)   * k
      cur.radius += (tgt.radius - cur.radius) * k
      cur.lookY  += (tgt.lookY  - cur.lookY)  * k

      const finalAngle = cur.angle + mouse.x * 0.16
      const finalElev  = cur.elev  - mouse.y * 1.2

      cam.position.set(
        Math.cos(finalAngle) * cur.radius,
        finalElev,
        Math.sin(finalAngle) * cur.radius,
      )
      cam.lookAt(0, cur.lookY, 0)

      // Very slow self-rotation on fragments — different rates per fragment
      // so they feel like independently drifting structural artifacts
      for (let i = 0; i < fragments.length; i++) {
        const { mesh, layer } = fragments[i]
        const rate = layer === 'fg' ? 0.00012 + i * 0.00004 : 0.00007 + i * 0.00003
        mesh.rotation.y += rate * dt * 60
      }

      // Node glow pulse
      if (nodeMat) nodeMat.opacity = 0.55 + Math.sin(time * 1.4) * 0.35

      renderer.render(scene, cam)
    }

    animate(performance.now())

    const onVis = () => {
      running = !document.hidden
      if (running) { lastTs = performance.now(); animate(lastTs) }
    }
    document.addEventListener('visibilitychange', onVis)

    const onResize = () => {
      cam.aspect = window.innerWidth / window.innerHeight
      cam.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    gsap.fromTo(renderer.domElement, { opacity: 0 }, { opacity: 1, duration: 2.2, delay: 0.3 })

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll',            onScroll)
      window.removeEventListener('mousemove',         onMouseMove)
      window.removeEventListener('resize',            onResize)
      document.removeEventListener('visibilitychange', onVis)
      // Dispose unique geometries (shared towerGeo disposed once)
      towerGeo.dispose()
      crossGeo.dispose()
      gridGeo.dispose()
      towerMat.dispose(); crossMat.dispose(); gridMat.dispose()
      fgMat.dispose(); bgMat.dispose()
      if (nodeMat) nodeMat.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
