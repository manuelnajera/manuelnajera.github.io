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

// Distant particle sphere — Fibonacci distribution for even coverage.
// Radius 55–68: well outside the camera orbit (18–28), so it's always "behind"
// everything, but close enough that fog doesn't erase it completely.
function buildDistantParticles(count = 420, minR = 55, maxR = 68) {
  const v = []
  const golden = Math.PI * (3 - Math.sqrt(5))  // golden angle
  for (let i = 0; i < count; i++) {
    const y      = 1 - (i / (count - 1)) * 2
    const r      = Math.sqrt(Math.max(0, 1 - y * y))
    const theta  = golden * i
    const radius = minR + (Math.random() * (maxR - minR))
    v.push(radius * r * Math.cos(theta), radius * y, radius * r * Math.sin(theta))
  }
  return new Float32Array(v)
}

// ── Suspension Bridge ─────────────────────────────────────────────────────────
// Two pylons with back-stays, a parabolic main cable, vertical suspenders,
// and a cross-braced deck — all parametric, no files.
function buildSuspensionBridge({
  span      = 38,   // total deck length
  towerH    = 9,    // pylon height above deck
  deckY     = 0.5,  // deck elevation above y=0
  roadW     = 5,    // separation between the two cable lines
  cableSegs = 22,   // segments approximating the parabola
  suspCount = 16,   // number of vertical hangers
} = {}) {
  const v    = []
  const push = (x1, y1, z1, x2, y2, z2) => v.push(x1, y1, z1, x2, y2, z2)

  const halfSpan = span / 2
  const towerX   = halfSpan * 0.65   // pylons inset from bridge ends
  const halfW    = roadW / 2
  const topY     = deckY + towerH
  const sagY     = deckY + 1.4       // cable nadir at mid-span

  // Parabola: towers are at ±towerX, highest point; mid-span is sagY
  const cableAt = (x) => sagY + (topY - sagY) * (x / towerX) ** 2

  for (const cz of [-halfW, halfW]) {
    // Back-stay cables: anchor end → pylon top
    push(-halfSpan, deckY, cz,  -towerX, topY, cz)
    push( towerX,   topY,  cz,   halfSpan, deckY, cz)

    // Main cable: pylon-to-pylon parabola
    for (let i = 0; i < cableSegs; i++) {
      const x1 = -towerX + towerX * 2 * (i       / cableSegs)
      const x2 = -towerX + towerX * 2 * ((i + 1) / cableSegs)
      push(x1, cableAt(x1), cz, x2, cableAt(x2), cz)
    }

    // Suspenders: hangers from cable down to deck
    for (let i = 1; i < suspCount; i++) {
      const x = -towerX + towerX * 2 * (i / suspCount)
      push(x, cableAt(x), cz, x, deckY, cz)
    }
  }

  // Pylons — two towers, each with two legs, four struts, and X-bracing
  for (const tx of [-towerX, towerX]) {
    push(tx, 0,     -halfW,  tx, topY, -halfW)   // leg A: ground → top
    push(tx, 0,      halfW,  tx, topY,  halfW)   // leg B
    for (let i = 0; i <= 3; i++) {               // horizontal struts
      const ty = deckY + towerH * (i / 3)
      push(tx, ty, -halfW, tx, ty, halfW)
    }
    push(tx, deckY, -halfW,  tx, topY,  halfW)  // X-brace
    push(tx, deckY,  halfW,  tx, topY, -halfW)
  }

  // Deck — two edge rails, cross beams, and diagonal floor bracing
  push(-halfSpan, deckY, -halfW,  halfSpan, deckY, -halfW)
  push(-halfSpan, deckY,  halfW,  halfSpan, deckY,  halfW)
  const panels = 14
  for (let p = 0; p <= panels; p++) {
    const x  = -halfSpan + span / panels * p
    const x2 = x + span / panels
    push(x, deckY, -halfW, x, deckY, halfW)                        // cross beam
    if (p < panels) push(x, deckY, -halfW, x2, deckY, halfW)       // floor brace
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
    colors:   { tower: 0x3b82f6, cross: 0x3b82f6, grid: 0x3b82f6, bridge: 0x3b82f6,
                node: 0x93c5fd, fgFrag: 0x3b82f6, bgFrag: 0x3b82f6, fog: 0x050508 },
    opacity:  { tower: 0.82, cross: 0.30, grid: 0.09, node: 0.90, fg: 0.28, bg: 0.09, dust: 0.55, bridge: 0.58 },
    blending: THREE.AdditiveBlending,
  },
  light: {
    colors:   { tower: 0x1e40af, cross: 0x1e3a8a, grid: 0x1e40af, bridge: 0x1e40af,
                node: 0x1d4ed8, fgFrag: 0x1e40af, bgFrag: 0x1e40af, dust: 0x1e40af, fog: 0xf1f5f9 },
    opacity:  { tower: 0.92, cross: 0.65, grid: 0.25, node: 0.95, fg: 0.60, bg: 0.22, dust: 0.50, bridge: 0.80 },
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
    applyMat(r.dustMat,   c.dust,   o.dust)
    applyMat(r.bridgeMat, c.bridge, o.bridge)
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

    // `let` so the resize handler can update it when the breakpoint crosses 768px
    let currentMobile = window.innerWidth < 768
    const cfg = THEME_CFG[themeRef.current] ?? THEME_CFG.dark
    const c   = cfg.colors
    const o   = cfg.opacity
    const b   = cfg.blending
    const refs = refsRef.current

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: !currentMobile, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, currentMobile ? 1.5 : 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene + fog ───────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const fog   = new THREE.FogExp2(c.fog, 0.014)
    scene.fog   = fog
    fogRef.current = fog

    // ── Camera ────────────────────────────────────────────────────────────
    // Mobile portrait has aspect ~0.56 → horizontal FOV = only ~32° at 55° vertical.
    // Bridges placed at ±22 units fall outside that frustum. Use 70° on mobile so
    // horizontal FOV opens to ~46°, making the repositioned bridges visible.
    const cam = new THREE.PerspectiveCamera(
      currentMobile ? 70 : 55,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    )

    // ── Shared tower geometry (reused across main + all fragment instances) ─
    const towerGeo = new THREE.BufferGeometry()
    towerGeo.setAttribute('position', new THREE.BufferAttribute(buildTower(), 3))

    // ── Main tower — midground anchor ─────────────────────────────────────
    const towerMat = new THREE.LineBasicMaterial({
      color: c.tower, transparent: true, opacity: currentMobile ? o.tower * 0.80 : o.tower,
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
      color: c.fgFrag, transparent: true, opacity: currentMobile ? o.fg * 0.75 : o.fg,
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

    // ── Distant particle atmosphere — Fibonacci sphere at radius 55–68 ────
    // Sits far behind the tower and fragments. As the camera orbits, these
    // shift in the opposite direction from foreground elements — completing
    // the full depth stack: particles → bg fragments → tower → fg fragments.
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(buildDistantParticles(), 3))
    const dustMat = new THREE.PointsMaterial({
      color: c.dust ?? c.node, size: 0.22, transparent: true, opacity: o.dust,
      blending: b, depthWrite: false, sizeAttenuation: true,
    })
    refs.dustMat = dustMat
    scene.add(new THREE.Points(dustGeo, dustMat))

    // ── Suspension bridges — infrastructure context ────────────────────────
    // Two bridges in the mid-distance, placed at perpendicular orientations.
    // Bridge 1 (behind tower, spans X): visible from initial front-facing camera.
    // Bridge 2 (right side, spans Z): comes into view as camera orbits left.
    // Together they form an L-shaped infrastructure complex around the tower.
    const bridgeGeo1 = new THREE.BufferGeometry()
    bridgeGeo1.setAttribute('position', new THREE.BufferAttribute(
      buildSuspensionBridge({ span: 38, towerH: 9, roadW: 5.5 }), 3
    ))
    const bridgeGeo2 = new THREE.BufferGeometry()
    bridgeGeo2.setAttribute('position', new THREE.BufferAttribute(
      buildSuspensionBridge({ span: 30, towerH: 7, roadW: 4.5 }), 3
    ))

    const bridgeMat = new THREE.LineBasicMaterial({
      color: c.bridge, transparent: true,
      opacity: currentMobile ? o.bridge * 0.75 : o.bridge,
      blending: b, depthWrite: false,
    })
    refs.bridgeMat = bridgeMat

    // Desktop: bridges form an L-shaped infrastructure complex at mid-distance.
    // Mobile: camera starts at angle=-0.25, sitting at (27.1, 5.5, -6.9) looking at origin.
    //   Camera forward XZ ≈ (-0.969, 0, 0.246). Horizontal FOV ≈ 43° (±21.5° from center).
    //   Previous attempts placed bridges at 5–11° from center → piled on top of the tower.
    //   Solution: position bridge centers so each shows ONE pylon at ~15° on opposite sides:
    //     Bridge 1 center (12, 0, 3)  → near pylon at (5.3, 0, -7.4) appears 15.7° RIGHT
    //     Bridge 2 center (9, 0, -8)  → near pylon at (14.3, 0, 0.2)  appears 15.2° LEFT
    //   Both use rotation.y = -1.0 (parallel spans) so spans never cross each other.
    //   Both bridge centers are ≥8 units from tower base (±4.5 units).
    const br1 = new THREE.LineSegments(bridgeGeo1, bridgeMat)
    br1.position.set(currentMobile ? 12 : 0, 0, currentMobile ? 3 : 22)
    br1.rotation.y = currentMobile ? -1.0 : 0.15
    scene.add(br1)

    const br2 = new THREE.LineSegments(bridgeGeo2, bridgeMat)
    br2.position.set(currentMobile ? 9 : 22, 0, currentMobile ? -8 : -4)
    br2.rotation.y = currentMobile ? -1.0 : Math.PI / 2 + 0.22
    scene.add(br2)

    // ── Node glow points (desktop only) ───────────────────────────────────
    let nodeMat = null
    if (!currentMobile) {
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
      const nowMobile = window.innerWidth < 768
      cam.aspect = window.innerWidth / window.innerHeight
      renderer.setSize(window.innerWidth, window.innerHeight)
      if (nowMobile !== currentMobile) {
        currentMobile = nowMobile
        cam.fov = nowMobile ? 70 : 55
        br1.position.set(nowMobile ? 12 : 0,  0, nowMobile ? 3  : 22)
        br1.rotation.y = nowMobile ? -1.0 : 0.15
        br2.position.set(nowMobile ? 9 : 22, 0, nowMobile ? -8 : -4)
        br2.rotation.y = nowMobile ? -1.0 : Math.PI / 2 + 0.22
      }
      cam.updateProjectionMatrix()
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
      dustGeo.dispose()
      bridgeGeo1.dispose(); bridgeGeo2.dispose()
      towerMat.dispose(); crossMat.dispose(); gridMat.dispose()
      fgMat.dispose(); bgMat.dispose(); dustMat.dispose(); bridgeMat.dispose()
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
