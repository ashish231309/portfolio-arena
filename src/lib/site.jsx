import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useMotionValue } from 'motion/react'

const SiteContext = createContext(null)

/**
 * Holds global pointer position (MotionValues, no re-renders) plus the
 * current section tone ('light' | 'dark') and accent color, so the nav,
 * ambient glows and cursor can adapt without prop drilling.
 */
export function SiteProvider({ children }) {
  const px = useMotionValue(-500)
  const py = useMotionValue(-500)
  const [tone, setTone] = useState('light')
  const [accent, setAccent] = useState('#6C5CE7')
  const [cursorMode, setCursorMode] = useState('default')
  const [cursorLabel, setCursorLabel] = useState('')

  useEffect(() => {
    const move = (e) => {
      px.set(e.clientX)
      py.set(e.clientY)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [px, py])

  const value = useMemo(
    () => ({ px, py, tone, setTone, accent, setAccent, cursorMode, setCursorMode, cursorLabel, setCursorLabel }),
    [px, py, tone, accent, cursorMode, cursorLabel],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  return useContext(SiteContext)
}

/** Registers a section's tone/accent while it occupies the viewport middle. */
export function useSectionSignal(tone, accent) {
  const ref = useRef(null)
  const { setTone, setAccent } = useSite()
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTone(tone)
          setAccent(accent)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [tone, accent, setTone, setAccent])
  return ref
}
