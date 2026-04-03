# Manuel Nájera — Portfolio Website

## Project Overview

A complete rebuild of manuelnajera.github.io as a professional portfolio
for a civil engineer turned full-stack developer. The aesthetic direction
is dark, technical, minimal — inspired by terminal-industries.com. Not
flashy, not generic. Serious.

The site tells a single story: a civil engineer who crossed into software
and now builds both.

---

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS v3
- GSAP 3 + ScrollTrigger (animations and scroll-triggered transitions)
- Three.js (WebGL background canvas — geometric/technical animation)
- React Router v6 (page transitions)
- i18n: react-i18next (English and Spanish)
- Deployment: GitHub Pages via GitHub Actions
- No backend. Static site only.

---

## Visual Direction

Dark, engineering-aesthetic, typography-led. NOT a typical dev portfolio.

Color palette:
  --bg:          #050508   (near-black, slightly blue-tinted)
  --surface:     #0d0d14
  --border:      #1a1a28
  --accent:      #3b82f6   (electric blue — matches DeltaVis brand)
  --accent-warm: #f59e0b   (amber — from DeltaVis panel A color)
  --text:        #e2e8f0
  --muted:       #475569
  --mono:        #94a3b8

Typography:
  - Headings: "Space Grotesk" or "DM Sans" — geometric, clean, slightly technical
  - Body: System font stack or "Inter"
  - Monospace/code elements: "JetBrains Mono" or "IBM Plex Mono"
  - Large display text: 80–120px on desktop, bold, tight line-height

Key aesthetic rules:
  - Thin (0.5px) border lines — grid feel, technical drawings
  - Coordinate labels in muted monospace (e.g. "37.7749° N / 92.4194° W")
  - Section numbers in muted text (01, 02, 03...)
  - Generous whitespace — content breathes
  - Subtle scan-line texture on hero (CSS only, no image)
  - NO rounded corners on containers (rx=0 everywhere except pills/tags)
  - Grid overlays that appear and fade on scroll

---

## Three.js Background

Single canvas element behind the hero section, full viewport.

Scene concept: Animated technical wireframe grid — like a topographic
survey mesh. Not a particle field (too generic). Think: sparse dots
connected by thin lines, slowly shifting, as if scanning a surface.

Implementation:
  - BufferGeometry with ~500 points in a grid pattern
  - Slight random Z displacement per point (terrain feel)
  - LineSegments connecting adjacent points
  - Slow rotation on X and Y axes (0.0002 rad/frame)
  - Raycaster: mouse position slightly deforms the nearest points
  - Camera: PerspectiveCamera, fixed, looking slightly down
  - Color: single color #3b82f6 at 0.15 opacity
  - Fade out on scroll (GSAP controls canvas opacity)
  - Pauses when tab is hidden (Page Visibility API)
  - Dispose all geometry on component unmount

---

## Site Structure

Single-page application. React Router handles the /en and /es routes.
All sections are on one scrollable page.

### Section 01 — Hero
Full viewport height. Three.js canvas behind everything.

Content:
  - Top-left: "MN" monogram + "manuelnajera.github.io" in monospace
  - Center: Large display name
      "Manuel Nájera"
  - Below name: Animated role typewriter cycling through:
      "Civil Engineer"
      "Full-Stack Developer"
      "3D Systems Builder"
      "Infrastructure + Software"
  - Below that: One-line summary in muted text:
      "I build software for the physical world."
  - Bottom: "↓ Scroll" with subtle bounce animation
  - Top-right: EN / ES language toggle (two buttons, no dropdown)

Animations:
  - Name fades in (opacity 0→1, translateY 20px→0, 0.8s ease)
  - Role typewriter starts after name is visible
  - Three.js grid appears with a 1s fade

### Section 02 — About
Two-column layout on desktop, stacked on mobile.

Left column (40%):
  - Section label: "02 / About"
  - Large pull quote: "Civil engineer who crossed into software."
  - One paragraph: The story (civil engineering → VBA automation → 
    self-taught React/Firebase → production systems → DeltaVis)

Right column (60%):
  - Timeline component. Vertical line with dots.
    Each node: year / role / one-line description
    
    2015–2017  Electrical Engineering Assistant, AutoCAD + estimation
    2018–2022  Civil Engineer, highway infrastructure (road asset mgmt,
               maintenance coordination, VBA automation)
    2022–now   Remote data analyst, TELUS International
    2025–now   Freelance Full-Stack Developer (dental POS + literacy program)
    2026–now   Founder, DeltaVis

Animations: Timeline dots draw in sequentially on ScrollTrigger entry.

### Section 03 — Projects

Header: "03 / Projects"
Subheader in muted: "Production systems. Not demos."

Two large project cards, full-width, stacked:

**Card A — DeltaVis** (featured, slightly larger treatment)
  - Left half: Dark card with tag "FEATURED" in accent blue
  - Right half (or overlay): Project details
    Title: "DeltaVis"
    URL: "deltavis.app"
    One-liner: "3D construction monitoring platform for civil engineers."
    Description: 2-3 sentences on what it does and why it exists
    Tech tags: React · Three.js · Firebase · Claude API · GitHub Actions
    Links: [Live site ↗] [Context doc ↗]
    
  - Visual: A subtle wireframe/grid animation (Three.js or CSS — 
    echo of the hero background but contained to the card)

**Card B — InsumosDentalesChiapas**
  - Same layout, no "featured" tag
  - Title: "InsumosDentales Chiapas"
  - URL: "insumosdentaleschiapas.com.mx"
  - One-liner: "Full-stack commerce + physical POS for a dental distributor."
  - Description: dual-channel (online + in-store), real payment terminal
  - Tech tags: React · Firebase · MercadoPago Point Smart 2 · 
    Cloud Functions · Cloudinary · FCM
  - Links: [Live site ↗]

On hover: cards get a 1px accent-blue border and slight translateY(-4px).

### Section 04 — Skills

Header: "04 / Stack"
Layout: Horizontal scrolling rows, or grid — NOT the typical bar-chart style.

Three rows, each labeled:

"Frontend & 3D"
  React 18 · Vite · Tailwind CSS · Three.js · Zustand · PWA · jsPDF

"Backend & Infrastructure"
  Firebase (Auth · Firestore · Storage · Functions · Hosting) ·
  GitHub Actions · MercadoPago · Cloudinary · FCM

"Domain & Tools"
  Civil Engineering · Photogrammetry · Drone (UAV) · LiDAR · 
  AutoCAD · Excel/VBA · Python · SQL

Each skill is a pill tag — no filled color, just border and text.
Tags glow (box-shadow with accent color, low opacity) on section entry.

### Section 05 — Contact

Header: "05 / Contact"

Content:
  - "Open to remote full-stack roles and freelance projects."
  - Two CTA buttons side by side:
      [View LinkedIn ↗]   [Send email ↗]
  - Below in muted: GitHub link + DeltaVis link
  - Bottom of page: "Built with React + Three.js · Deployed on GitHub Pages"
  - Copyright: "© 2026 Manuel Nájera"

---

## Animations — GSAP Implementation

Install: gsap, @gsap/react (ScrollTrigger plugin)

Global scroll behavior:
  - document.documentElement smooth scroll (CSS: scroll-behavior: smooth)
  - GSAP ScrollSmoother if budget allows for extra polish

Per-section entry animations:
  - Default: elements fade in (opacity 0→1) + slide up (y: 30→0)
  - Duration: 0.7s, ease: "power2.out"
  - Stagger: 0.1s between sibling elements
  - Trigger: "top 80%" of viewport

Project cards:
  - Enter from bottom with slight rotation (rotationX: 5→0)
  - On hover: border color transition + translateY

Timeline (About section):
  - Line draws down via scaleY animation on ScrollTrigger
  - Each dot fades in sequentially as line reaches it

Hero typewriter:
  - Custom implementation with useState + useEffect
  - Cycles through role strings with cursor blink

---

## i18n Implementation

react-i18next with two JSON files:
  public/locales/en/translation.json
  public/locales/es/translation.json

URL structure: / defaults to en, /es for Spanish.
Language toggle in Header persists to localStorage.

All content (nav, sections, project descriptions, tags) must be 
translatable. Three.js and animation code is not translated (visual only).

---

## Page Transitions

React Router v6 with location-based keys.
Framer Motion AnimatePresence wrapping routes:
  - Exit: opacity 0, translateY -20px, 0.3s
  - Enter: opacity 1, translateY 0, 0.3s
  - Between /en and /es only (not within same-language navigation)

---

## Performance Rules

- Three.js canvas: 
  - setPixelRatio(Math.min(devicePixelRatio, 2))
  - Pause RAF when document.hidden
  - Dispose all geometry/material on unmount
  - Max 500 points in the grid geometry
  
- Images: none in hero/about. WebP format for any project screenshots.
  Use loading="lazy" on all below-fold images.

- Fonts: Preload Space Grotesk and JetBrains Mono via <link rel="preload">
  in index.html. Self-host or use Google Fonts with display=swap.

- Bundle: Keep Three.js in a separate chunk (dynamic import).
  GSAP: tree-shake to only import used plugins.

- Mobile: Three.js background disabled on screens < 768px (canvas hidden,
  static dark background shown instead). GSAP animations still run.

---

## GitHub Pages Deployment

GitHub Actions workflow: .github/workflows/deploy.yml
  - Trigger: push to main
  - Steps: checkout → setup-node 22 → npm ci → npm run build → 
    deploy /dist to gh-pages branch
  - Use: peaceiris/actions-gh-pages@v3

vite.config.js:
  - base: '/manuelnajera.github.io/' if deploying to username.github.io
    OR base: '/' if using a custom domain

---

## File Structure

src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx        ← logo, lang toggle, nav
│   │   └── Footer.jsx
│   ├── sections/
│   │   ├── Hero.jsx          ← Three.js canvas + typewriter
│   │   ├── About.jsx         ← story + timeline
│   │   ├── Projects.jsx      ← two project cards
│   │   ├── Skills.jsx        ← tag cloud rows
│   │   └── Contact.jsx
│   ├── three/
│   │   └── GridCanvas.jsx    ← Three.js background component
│   └── ui/
│       ├── Tag.jsx           ← skill/tech pill tag
│       ├── ProjectCard.jsx   ← reusable project card
│       └── Timeline.jsx      ← timeline component
├── i18n/
│   └── index.js              ← react-i18next config
├── hooks/
│   └── useScrollAnimation.js ← GSAP ScrollTrigger wrapper hook
├── styles/
│   └── globals.css           ← CSS vars, base resets
├── App.jsx
└── main.jsx

public/
├── locales/
│   ├── en/translation.json
│   └── es/translation.json
└── favicon.svg               ← "MN" monogram SVG

---

## Build Commands

npm run dev     → local dev server (http://localhost:5173)
npm run build   → production build to /dist
npm run preview → preview production build locally

---

## Content Notes for Claude Code

The developer is Manuel Nájera, based in Tuxtla Gutiérrez, Chiapas, Mexico.
Civil engineer + full-stack developer.

Live projects to reference:
  - deltavis.app (3D construction monitoring)
  - insumosdentaleschiapas.com.mx (commerce + POS)
  - manuelnajera.github.io (current site being replaced)

GitHub: manuelnajera

The tone of all copy is direct, technical, and confident — never sales-y
or full of buzzwords. "I build software for the physical world" is the
positioning. Everything should feel like it was written by an engineer,
not a marketing team.

Do NOT use: "passionate", "enthusiastic", "synergy", "innovative solutions",
"leveraging", "dynamic", "results-driven", or any other LinkedIn cliché.

DO use: specific technical details, real project outcomes, honest language.