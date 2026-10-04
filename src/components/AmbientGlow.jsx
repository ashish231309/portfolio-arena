import { useRef } from 'react'
import { motion, useSpring, useMotionValue, useMotionValueEvent } from 'motion/react'
import { useSite } from '../lib/site'
import { useReducedMotionPref } from '../hooks/useMediaQuery'

/**
 * Localized, blurred cursor-following highlight tinted with the section
 * accent. Lives inside a Section (absolute; section converts viewport
 * pointer coords into local space without React re-renders).
 */
export default function AmbientGlow({ accent = '#6C5CE7', dark = false, size = 560 }) {
  const { px, py } = useSite()
  const reduced = useReducedMotionPref()
  const ref = useRef(null)
  const lx = useMotionValue(-9999)
  const ly = useMotionValue(-9999)
  const sx = useSpring(lx, { stiffness: 40, damping: 20, mass: 1.1 })
  const sy = useSpring(ly, { stiffness: 40, damping: 20, mass: 1.1 })

  useMotionValueEvent(px, 'change', (v) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    lx.set(v - r.left)
  })
  useMotionValueEvent(py, 'change', (v) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    ly.set(v - r.top)
  })

  if (reduced) return null

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      <motion.span
        className="absolute top-0 left-0 rounded-full"
        style={{
          x: sx,
          y: sy,
          width: size,
          height: size,
          translateX: '-50%',
          translateY: '-50%',
          background: `radial-gradient(closest-side, ${accent}, transparent 70%)`,
          opacity: dark ? 0.14 : 0.1,
          filter: 'blur(60px)',
        }}
      />
    </motion.div>
  )
}
