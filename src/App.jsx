import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import Lenis from 'lenis'
import { SiteProvider } from './lib/site'
import { useReducedMotionPref } from './hooks/useMediaQuery'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import Intro from './components/Intro'
import Home from './pages/Home'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetail from './pages/ProjectDetail'
import { ExperiencePage, EducationPage, CertificationsPage, AchievementsPage, ContactPage } from './pages/SimplePages'
import NotFound from './pages/NotFound'
import { EASE } from './lib/motion'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        id="main"
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/certifications" element={<CertificationsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

export default function App() {
  const reduced = useReducedMotionPref()
  const location = useLocation()

  // Lenis smooth scrolling (window-based, keeps anchors/sticky/a11y intact)
  useEffect(() => {
    if (reduced) return undefined
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    })
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [reduced])

  // reset scroll on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <SiteProvider>
      <Intro />
      <ScrollProgress />
      <Cursor />
      <Nav />
      <AnimatedRoutes />
      <Footer />
      {/* film grain */}
      <div className="noise-layer pointer-events-none fixed inset-0 z-[80] opacity-[0.05] mix-blend-multiply" aria-hidden="true" />
    </SiteProvider>
  )
}
