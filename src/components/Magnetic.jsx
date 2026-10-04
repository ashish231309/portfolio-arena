import { useRef } from 'react'
import { motion, useSpring } from 'motion/react'
import { useFinePointer, useReducedMotionPref } from '../hooks/useMediaQuery'
import { SPRING } from '../lib/motion'

/**
 * Magnetic wrapper — the child drifts a few px toward the pointer and
 * springs back on leave. Disabled on coarse pointers / reduced motion.
 */
export default function Magnetic({ children, strength = 0.28, max = 8, className = '' }) {
  const fine = useFinePointer()
  const reduced = useReducedMotionPref()
  const ref = useRef(null)
  const active = fine && !reduced

  const x = useSpring(0, SPRING)
  const y = useSpring(0, SPRING)

  const onMove = (e) => {
    if (!active || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    x.set(Math.max(-max, Math.min(max, dx * strength)))
    y.set(Math.max(-max, Math.min(max, dy * strength)))
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x, y, display: 'inline-block' }}
      className={className}
    >
      {children}
    </motion.span>
  )
}
