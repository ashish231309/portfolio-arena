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
    let raf = requestAnimationFrame(function loop(time) {
      instance.raf(time)
      raf = requestAnimationFrame(loop)
    })
    return () => {
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
 */
export function useScrollToTop() {
  const lenis = useLenis()
  return useCallback(
    ({ immediate = false } = {}) => {
      if (lenis) {
        lenis.scrollTo(0, immediate ? { immediate: true } : {})
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
      }
    },
    [lenis],
  )
}
