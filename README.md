# Manuel Nájera — Portfolio

[![Deploy](https://github.com/manuelnajera/manuelnajera.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/manuelnajera/manuelnajera.github.io/actions/workflows/deploy.yml)
[![License](https://img.shields.io/github/license/manuelnajera/manuelnajera.github.io)](LICENSE.txt)

[English](#) | [Español](README-es.md)

Personal portfolio for Manuel Nájera — civil engineer turned full-stack developer, based in Tuxtla Gutiérrez, Chiapas, Mexico.

**Live:** [manuelnajera.github.io](https://manuelnajera.github.io)

---

## Stack

- **React 18 + Vite 5** — SPA, fast builds
- **Tailwind CSS v3** — utility-first styling with custom engineering palette
- **Three.js** — Procedural 3D infrastructure scene: lattice tower, two suspension bridges, structural fragments at multiple depth layers, Fibonacci particle atmosphere. All geometry built from `Float32Array` at runtime — no asset files. Scroll drives a 270° camera orbit; mouse adds ±0.16 rad parallax.
- **GSAP 3 + ScrollTrigger** — section entry animations, timeline draw, scroll effects
- **Framer Motion** — page transitions between `/` (EN) and `/es`
- **react-i18next** — English and Spanish, URL-based language detection
- **GitHub Actions** → **GitHub Pages** — push to `main` deploys automatically

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → /dist
npm run preview    # preview production build
```

## Structure

```
src/
├── components/
│   ├── layout/        Header, Footer
│   ├── sections/      Hero, About, Projects, Skills, Contact
│   ├── three/         BackgroundCanvas (Three.js infrastructure scene)
│   └── ui/            Tag, Timeline, ProjectCard
├── hooks/             useScrollAnimation (GSAP ScrollTrigger wrapper)
├── i18n/              react-i18next config
├── styles/            globals.css (CSS vars, scanlines, animations)
├── App.jsx
└── main.jsx

public/
├── locales/
│   ├── en/translation.json
│   └── es/translation.json
└── favicon.svg
```

## Sections

| # | Section | Description |
|---|---------|-------------|
| 01 | Hero | Full-viewport 3D scene, annotation text chips, typewriter role cycling |
| 02 | About | Story + animated timeline (civil engineering → software) |
| 03 | Projects | InsumosDentalesChiapas (IN PRODUCTION) + DeltaVis — real systems |
| 04 | Stack | Three rows of skill tags with scroll-entry glow |
| 05 | Contact | LinkedIn + email CTAs |

## Deployment

Push to `main`. The `deploy.yml` workflow builds with Vite and deploys `dist/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`.

GitHub Pages SPA routing: `/es` is handled by `public/404.html` redirect → `index.html` script restores the path.

## License

Code: [MIT](LICENSE.txt)  
Content: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)  
Copyright (c) 2026 Manuel Nájera
