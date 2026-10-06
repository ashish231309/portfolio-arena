import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig } from 'motion/react'
import { SiteProvider } from './lib/site'
import { LenisProvider, useLenis, useScrollToTop } from './lib/scroll'
import ErrorBoundary from './components/ErrorBoundary'
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

/**
 * Route-level scroll housekeeping: every navigation resets to the top through
 * the one Lenis instance and then re-measures the page once the new route has
 * laid out (otherwise Lenis keeps the old document height and stops scrolling
 * short). Must render inside <LenisProvider>.
 */
function RouteScroll() {
  const lenis = useLenis()
  const scrollToTop = useScrollToTop()
  const { pathname } = useLocation()

  useEffect(() => {
    scrollToTop({ immediate: true })
    if (!lenis) return undefined
    const id = requestAnimationFrame(() => lenis.resize())
    return () => cancelAnimationFrame(id)
  }, [pathname, lenis, scrollToTop])

  return null
}

export default function App() {
  const location = useLocation()

  return (
    <MotionConfig reducedMotion="user">
      <LenisProvider>
        <RouteScroll />
        <SiteProvider>
          <Intro />
          <ScrollProgress />
          <Cursor />
          <Nav />
          <ErrorBoundary key={location.pathname}>
            <AnimatedRoutes />
          </ErrorBoundary>
          <Footer />
          {/* film grain */}
          <div className="noise-layer pointer-events-none fixed inset-0 z-[80] opacity-[0.05] mix-blend-multiply" aria-hidden="true" />
        </SiteProvider>
      </LenisProvider>
    </MotionConfig>
  )
}
