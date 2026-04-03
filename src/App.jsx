import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Hero from './components/sections/Hero.jsx'
import About from './components/sections/About.jsx'
import Projects from './components/sections/Projects.jsx'
import Skills from './components/sections/Skills.jsx'
import Contact from './components/sections/Contact.jsx'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Header />
        <main>
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnimatedRoutes />} />
        <Route path="/es" element={<AnimatedRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
