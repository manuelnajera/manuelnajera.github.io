# Manuel Nájera — Portafolio

[![Deploy](https://github.com/manuelnajera/manuelnajera.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/manuelnajera/manuelnajera.github.io/actions/workflows/deploy.yml)
[![License](https://img.shields.io/github/license/manuelnajera/manuelnajera.github.io)](LICENSE.txt)

[English](README.md) | [Español](#)

Portafolio personal de Manuel Nájera — ingeniero civil convertido en desarrollador full-stack, basado en Tuxtla Gutiérrez, Chiapas, México.

**En vivo:** [manuelnajera.github.io](https://manuelnajera.github.io)

---

## Stack

- **React 18 + Vite 5** — SPA, builds rápidos
- **Tailwind CSS v3** — estilos utilitarios con paleta de ingeniería personalizada
- **Three.js** — fondo WebGL de malla de terreno (500 puntos, deformación con el mouse, fade en scroll)
- **GSAP 3 + ScrollTrigger** — animaciones de entrada por sección, dibujado del timeline, efectos de scroll
- **Framer Motion** — transiciones de página entre `/` (EN) y `/es`
- **react-i18next** — inglés y español, detección de idioma por URL
- **GitHub Actions** → **GitHub Pages** — push a `main` despliega automáticamente

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción → /dist
npm run preview    # previsualizar el build de producción
```

## Estructura

```
src/
├── components/
│   ├── layout/        Header, Footer
│   ├── sections/      Hero, About, Projects, Skills, Contact
│   ├── three/         GridCanvas (fondo Three.js)
│   └── ui/            Tag, Timeline, ProjectCard
├── hooks/             useScrollAnimation (wrapper de GSAP ScrollTrigger)
├── i18n/              configuración de react-i18next
├── styles/            globals.css (variables CSS, scanlines, animaciones)
├── App.jsx
└── main.jsx

public/
├── locales/
│   ├── en/translation.json
│   └── es/translation.json
└── favicon.svg
```

## Secciones

| # | Sección | Descripción |
|---|---------|-------------|
| 01 | Hero | Pantalla completa, malla Three.js, roles con efecto typewriter |
| 02 | About | Historia + timeline animado (ingeniería civil → software) |
| 03 | Projects | DeltaVis + InsumosDentalesChiapas — sistemas en producción |
| 04 | Stack | Tres filas de tags de habilidades con glow al entrar en viewport |
| 05 | Contact | CTAs de LinkedIn y correo |

## Despliegue

Push a `main`. El workflow `deploy.yml` compila con Vite y despliega `dist/` a la rama `gh-pages` mediante `peaceiris/actions-gh-pages`.

Enrutamiento SPA en GitHub Pages: `/es` es manejado por la redirección en `public/404.html` → el script en `index.html` restaura la ruta correcta.

## Licencia

Código: [MIT](LICENSE.txt)  
Contenido: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)  
Copyright (c) 2026 Manuel Nájera
