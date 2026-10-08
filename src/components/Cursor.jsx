import { useEffect, useState } from 'react'
import { motion, useSpring } from 'motion/react'
import { useSite } from '../lib/site'
import { useFinePointer, useReducedMotionPref } from '../hooks/useMediaQuery'

const MODES = {
  default: { ring: 34, dot: 6, label: '' },
  link: { ring: 50, dot: 4, label: '' },
  button: { ring: 54, dot: 4, label: '' },
  project: { ring: 86, dot: 2, label: 'VIEW' },
  cert: { ring: 78, dot: 2, label: 'OPEN' },
  contact: { ring: 96, dot: 2, label: "LET'S TALK" },
  drag: { ring: 80, dot: 2, label: 'SCROLL →' },
}

// Blend + filter stack (U1/U2): mix-blend-difference inverts against any
// background; saturate(0) strips the muddy-olive artefact that difference
// produces over mid-saturated brand colours; contrast(2.5) pushes the result
// to pure black or pure white, giving an automatic light-on-dark / dark-on-light
// cursor without any per-section JS.
const CURSOR_BLEND = {
  mixBlendMode: 'difference',
  filter: 'saturate(0) contrast(2.5)',
}

/**
 * Custom cursor: instant dot + spring-lagged ring + 3 ghost afterimages.
 * Context-aware via [data-cursor] / [data-cursor-label] attributes.
 * Fine pointers only; removed for touch + reduced motion.
 */
export default function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotionPref()
  const { px, py, setCursorMode, setCursorLabel } = useSite()
  const [mode, setMode] = useState('default')
  // If a fine pointer and motion allowed, the cursor should be visible
  // immediately on mount — waiting for the first pointermove causes a FOUC
  // where the native arrow is already hidden but the custom ring hasn't faded
  // in yet (U4). Coarse / reduced-motion users never mount the cursor at all.
  const [visible, setVisible] = useState(fine && !reduced)

  const ringX = useSpring(px, { stiffness: 210, damping: 22, mass: 0.5 })
  const ringY = useSpring(py, { stiffness: 210, damping: 22, mass: 0.5 })
  const g1x = useSpring(px, { stiffness: 120, damping: 20, mass: 0.7 })
  const g1y = useSpring(py, { stiffness: 120, damping: 20, mass: 0.7 })
  const g2x = useSpring(px, { stiffness: 78, damping: 18, mass: 0.8 })
  const g2y = useSpring(py, { stiffness: 78, damping: 18, mass: 0.8 })
  const g3x = useSpring(px, { stiffness: 50, damping: 16, mass: 0.9 })
  const g3y = useSpring(py, { stiffness: 50, damping: 16, mass: 0.9 })

  const active = fine && !reduced

  useEffect(() => {
    document.documentElement.classList.toggle('has-cursor', active)
    return () => document.documentElement.classList.remove('has-cursor')
  }, [active])

  useEffect(() => {
    if (!active) return undefined
    const over = (e) => {
      const t = e.target instanceof Element ? e.target.closest('[data-cursor]') : null
      const next = t?.getAttribute('data-cursor') || 'default'
      setMode(next)
      setCursorMode(next)
      setCursorLabel(t?.getAttribute('data-cursor-label') || MODES[next]?.label || '')
    }
    const show = () => setVisible(true)
    const hide = () => setVisible(false)
    window.addEventListener('pointerover', over, true)
    window.addEventListener('pointermove', show, { passive: true })
    document.documentElement.addEventListener('mouseleave', hide)
    return () => {
      window.removeEventListener('pointerover', over, true)
      window.removeEventListener('pointermove', show)
      document.documentElement.removeEventListener('mouseleave', hide)
    }
  }, [active, setCursorMode, setCursorLabel])

  if (!active) return null

  const m = MODES[mode] || MODES.default
  const labeled = Boolean(m.label)

  const ghosts = [
    { x: g1x, y: g1y, s: 0.62, o: 0.16 },
    { x: g2x, y: g2y, s: 0.44, o: 0.1 },
    { x: g3x, y: g3y, s: 0.3, o: 0.06 },
  ]

  return (
    <div
      className="fixed inset-0 z-[120] pointer-events-none transition-opacity duration-300"
      aria-hidden="true"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {ghosts.map((g, i) => (
        <motion.span
          key={i}
          className="fixed top-0 left-0 rounded-full border border-white"
          style={{
            x: g.x,
            y: g.y,
            width: 34,
            height: 34,
            scale: g.s,
            translateX: '-50%',
            translateY: '-50%',
            opacity: labeled ? 0 : g.o,
            ...CURSOR_BLEND,
          }}
        />
      ))}
      <motion.span
        className="fixed top-0 left-0 rounded-full border-[1.5px] border-white"
        style={{
          x: ringX,
          y: ringY,
          width: 34,
          height: 34,
          scale: m.ring / 34,
          translateX: '-50%',
          translateY: '-50%',
          opacity: labeled ? 0 : 0.9,
          ...CURSOR_BLEND,
        }}
      />
      <motion.span
        className="fixed top-0 left-0 rounded-full bg-white"
        style={{
          x: px,
          y: py,
          width: m.dot,
          height: m.dot,
          translateX: '-50%',
          translateY: '-50%',
          opacity: m.dot ? 1 : 0,
          ...CURSOR_BLEND,
        }}
      />
      <motion.span
        className="fixed top-0 left-0 rounded-full bg-indigo-ink text-ivory font-mono flex items-center justify-center text-[10px] tracking-[0.16em] uppercase whitespace-nowrap"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ width: m.ring, height: m.ring, opacity: labeled ? 1 : 0, scale: labeled ? 1 : 0.5 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        {m.label}
      </motion.span>
    </div>
  )
}
