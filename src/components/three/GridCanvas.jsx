import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const COLS = 25
const ROWS = 20
const POINT_COUNT = COLS * ROWS
const SPREAD_X = 22
const SPREAD_Y = 18
const Z_NOISE = 1.4

export default function GridCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const isMobile = window.innerWidth < 768

    // Renderer — cap pixelRatio at 1.5 on mobile to save GPU
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Scene + camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 5, 20)
    camera.lookAt(0, 0, 0)

    // Build grid geometry
    const positions = new Float32Array(POINT_COUNT * 3)
    const originalZ = new Float32Array(POINT_COUNT)
    const lineIndices = []

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i = row * COLS + col
        const x = (col / (COLS - 1) - 0.5) * SPREAD_X
        const y = (row / (ROWS - 1) - 0.5) * SPREAD_Y
        const z = (Math.random() - 0.5) * Z_NOISE

        positions[i * 3] = x
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
      color: 0x3b82f6,
      transparent: true,
      opacity: isMobile ? 0.28 : 0.15,
    })

    const grid = new THREE.LineSegments(geometry, material)
    scene.add(grid)

    // Mouse deformation via a horizontal plane intersect
    const mouse = new THREE.Vector2(9999, 9999)
    const raycaster = new THREE.Raycaster()
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const mouseWorld = new THREE.Vector3()

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onTouchMove = (e) => {
      const t = e.touches[0]
      mouse.x = (t.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(t.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    // Scroll: fade canvas out as user scrolls past hero
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: '30% top',
      onUpdate: (self) => {
        renderer.domElement.style.opacity = String(1 - self.progress * 1.2)
      },
    })

    // RAF loop
    let rafId
    let running = true

    const animate = () => {
      if (!running) return
      rafId = requestAnimationFrame(animate)

      grid.rotation.x += 0.00018
      grid.rotation.y += 0.00022

      // Mouse deformation
      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(plane, mouseWorld)

      for (let i = 0; i < POINT_COUNT; i++) {
        const dx = posAttr.getX(i) - mouseWorld.x
        const dy = posAttr.getY(i) - mouseWorld.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const push = Math.max(0, 1 - dist / 3.5) * 0.9
        posAttr.setZ(i, originalZ[i] + push)
      }
      posAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // Pause when tab is hidden
    const onVisibility = () => {
      running = !document.hidden
      if (running) animate()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Resize
    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // Fade in
    gsap.fromTo(renderer.domElement, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.4 })

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0"
      aria-hidden="true"
    />
  )
}
