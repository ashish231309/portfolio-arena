import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useMotionValue } from 'motion/react'

const SiteContext = createContext(null)

const DEFAULT_TONE = 'light'
const DEFAULT_ACCENT = '#6C5CE7'

/**
 * Holds global pointer position (MotionValues, no re-renders) plus the
 * current section tone ('light' | 'dark') and accent color, so the nav,
 * ambient glows and cursor can adapt without prop drilling.
 *
 * Tone is driven by a STACK of the sections currently occupying the viewport
 * middle band: the most recently entered section wins, and when it leaves the
 * tone falls back to whichever section is still in the band — or to the page
 * default when none are. That is what stops the nav getting stuck dark after
 * passing a dark section (T14).
 */
export function SiteProvider({ children }) {
  const px = useMotionValue(-500)
  const py = useMotionValue(-500)
  const [tone, setTone] = useState(DEFAULT_TONE)
  const [accent, setAccent] = useState(DEFAULT_ACCENT)
  const [cursorMode, setCursorMode] = useState('default')
  const [cursorLabel, setCursorLabel] = useState('')

  /** [{ id, tone, accent }] in enter order — last one wins. */
  const stack = useRef([])
  const seq = useRef(0)

  const sync = useCallback(() => {
    const top = stack.current[stack.current.length - 1]
    if (top) {
      setTone(top.tone)
      setAccent(top.accent)
    } else {
      setTone(DEFAULT_TONE)
      setAccent(DEFAULT_ACCENT)
    }
  }, [])

  const enterSection = useCallback(
    (entry) => {
      stack.current = stack.current.filter((e) => e.id !== entry.id).concat(entry)
      sync()
    },
    [sync],
  )

  const leaveSection = useCallback(
    (id) => {
      const next = stack.current.filter((e) => e.id !== id)
      if (next.length === stack.current.length) return
      stack.current = next
      sync()
    },
    [sync],
  )

  useEffect(() => {
    const move = (e) => {
      px.set(e.clientX)
      py.set(e.clientY)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [px, py])

  const value = useMemo(
    () => ({
      px,
      py,
      tone,
      setTone,
      accent,
      setAccent,
      cursorMode,
      setCursorMode,
      cursorLabel,
      setCursorLabel,
      enterSection,
      leaveSection,
      nextSectionId: () => {
        seq.current += 1
        return seq.current
      },
    }),
    [px, py, tone, accent, cursorMode, cursorLabel, enterSection, leaveSection],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  return useContext(SiteContext)
}

/**
 * Registers a section's tone/accent while it occupies the viewport middle.
 * Returns the ref to attach — API unchanged. Entering pushes onto the provider's
 * stack; LEAVING pops it, so the previous tone is restored instead of sticking.
 */
export function useSectionSignal(tone, accent) {
  const ref = useRef(null)
  const { enterSection, leaveSection, nextSectionId } = useSite()
  const idRef = useRef(0)
  if (idRef.current === 0) idRef.current = nextSectionId()

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const id = idRef.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) enterSection({ id, tone, accent })
        else leaveSection(id)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      leaveSection(id)
    }
  }, [tone, accent, enterSection, leaveSection])

  return ref
}
