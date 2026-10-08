import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
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
import NotFound from './pages/NotFound'
import { EASE } from './lib/motion'

/**
 * Route-level code splitting (T31).
 *
 * Home stays eager: it owns the hero, so the first paint must not wait for a
 * second request. Every other route is fetched on demand — the five wrapper
 * pages share one lazily-loaded module (they live in the same file), project
 * pages get their own. NotFound stays eager too: it is tiny and must render
 * instantly for a wrong URL rather than fetch a chunk first.
 */
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
// Five routes, one file: each page gets its own lazy wrapper but they all resolve
// from the same lazily-fetched module, so a visitor downloads it once.
const ExperiencePage = lazy(() => import('./pages/SimplePages').then((m) => ({ default: m.ExperiencePage })))
const EducationPage = lazy(() => import('./pages/SimplePages').then((m) => ({ default: m.EducationPage })))
const CertificationsPage = lazy(() => import('./pages/SimplePages').then((m) => ({ default: m.CertificationsPage })))
const AchievementsPage = lazy(() => import('./pages/SimplePages').then((m) => ({ default: m.AchievementsPage })))
const ContactPage = lazy(() => import('./pages/SimplePages').then((m) => ({ default: m.ContactPage })))

/**
 * Fallback shown only while a route chunk is in flight. It reserves most of the
 * viewport (so the footer does not jump) and says nothing visual beyond a quiet
 * pulse — on a repeat visit the chunk is cached and this never appears.
 */
function RouteFallback() {
  return (
    <div role="status" className="grid min-h-[70svh] place-items-center">
      <span className="font-mono text-[11px] tracking-[0.24em] uppercase text-muted animate-pulse-dot" aria-hidden="true">
        ▍
      </span>
      <span className="sr-only">Loading page…</span>
    </div>
  )
}

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
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
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
  const navType = useNavigationType()

  useEffect(() => {
    // U18: only force scroll-to-top on forward navigations (link clicks /
    // programmatic pushes). POP (Back/Forward) should let the browser restore
    // the previous scroll position instead of snapping to the top.
    if (navType === 'POP') return
    scrollToTop({ immediate: true })
    if (!lenis) return undefined
    const id = requestAnimationFrame(() => lenis.resize())
    return () => cancelAnimationFrame(id)
  }, [pathname, navType, lenis, scrollToTop])

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
