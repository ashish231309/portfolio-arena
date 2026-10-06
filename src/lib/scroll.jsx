import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Lenis from 'lenis'
import { useReducedMotionPref } from '../hooks/useMediaQuery'

/**
 * ONE Lenis instance for the whole site.
 *
 * The provider owns creation/destruction (App renders it once, so the engine
 * lives exactly as long as the app shell). Everything that needs to move the
 * page — route changes, the footer's "Back to top", the mobile menu's
 * stop/start — goes through `useLenis()` / `useScrollToTop()` instead of the
 * native scroll API, so there is a single scroll engine and no fighting
 * between Lenis' internal position and `window.scrollTo`.
 *
 * Reduced motion: no Lenis is created at all (matches the previous App
 * behaviour) and every helper falls back to the native API exactly once,
 * inside this file.
 */
const LenisContext = createContext(null)

export function LenisProvider({ children }) {
  const reduced = useReducedMotionPref()
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    if (reduced) {
      setLenis(null)
      return undefined
    }
    const instance = new Lenis({ lerp: 0.1, smoothWheel: true })
    setLenis(instance)
    // Pause while the tab is hidden (DESIGN.md §10): stop the engine and skip
    // its rAF work, then resume exactly where it left off on return.
    const onVisibility = () => {
      if (document.hidden) instance.stop()
      else instance.start()
    }
    document.addEventListener('visibilitychange', onVisibility)
    let raf = requestAnimationFrame(function loop(time) {
      if (!document.hidden) instance.raf(time)
      raf = requestAnimationFrame(loop)
    })
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(raf)
      instance.destroy()
    }
  }, [reduced])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

/** The live Lenis instance, or null under reduced motion / before mount. */
export function useLenis() {
  return useContext(LenisContext)
}

/**
 * Jump (or glide) back to the top of the page through the single scroll engine.
 * `{ immediate: true }` for route changes; no options for the smooth footer button.
 *
 * `force: true` on the route-change path is not optional: Lenis ignores
 * `scrollTo` while the engine is stopped (`if ((this.isStopped || this.isLocked)
 * && !force) return`), and the mobile menu stops it while it is open. Without
 * this flag, navigating from the hamburger menu kept the previous page's scroll
 * offset — e.g. leaving /about at the footer opened /certifications at the
 * footer too. With it, the new route always starts at the top.
 */
export function useScrollToTop() {
  const lenis = useLenis()
  return useCallback(
    ({ immediate = false } = {}) => {
      if (lenis) {
        lenis.scrollTo(0, immediate ? { immediate: true, force: true } : {})
        // Belt and braces for route changes: the menu also locks the body while
        // it is open, so reset the native position too. Both target the same
        // place, so there is nothing for the two to fight over — but a route can
        // never inherit the previous page's offset.
        if (immediate && typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' })
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
      }
    },
    [lenis],
  )
}
