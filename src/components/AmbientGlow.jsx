import { useRef } from 'react'
import { motion, useSpring, useMotionValue, useMotionValueEvent } from 'motion/react'
import { useSite } from '../lib/site'
import { useReducedMotionPref } from '../hooks/useMediaQuery'

/**
 * Localized, blurred cursor-following highlight tinted with the section accent.
 * Lives inside a Section (absolute; viewport pointer coords are converted to
 * local space without React re-renders).
 *
 * U8: opacity is tuned so the glow reads as a soft pool of light on every
 * surface without screaming. On dark sections the accent is used as-is at a
 * higher opacity; on light sections a darker shade (indigo-ink) is substituted
 * because cyan/coral/lime/cobalt are too close to ivory's luminance to glow
 * visibly without looking muddy.
 * U9: size bumped from 560 to 680 and blur from 60 to 80 so the glow reads as
 * ambient light rather than a small halo next to the cursor.
 */

// Darker accent used on light grounds so the glow stays perceptible regardless
// of which brand colour a section uses.
const LIGHT_ACCENT = '#5A4BD4' // indigo-ink, ~5.5:1 on ivory
const LIGHT_OPACITY = 0.18
const DARK_OPACITY = 0.28

export default function AmbientGlow({ accent = '#6C5CE7', dark = false, size = 680 }) {
  const { px, py } = useSite()
  const reduced = useReducedMotionPref()
  const ref = useRef(null)
  const lx = useMotionValue(-9999)
  const ly = useMotionValue(-9999)
  const sx = useSpring(lx, { stiffness: 35, damping: 22, mass: 1.2 })
  const sy = useSpring(ly, { stiffness: 35, damping: 22, mass: 1.2 })

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

  const glowColor = dark ? accent : LIGHT_ACCENT
  const opacity = dark ? DARK_OPACITY : LIGHT_OPACITY

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
          background: `radial-gradient(closest-side, ${glowColor}, transparent 70%)`,
          opacity,
          filter: 'blur(80px)',
        }}
      />
    </motion.div>
  )
}
