import { motion, useScroll, useSpring } from 'motion/react'

/** Hairline scroll progress at the very top — brand gradient. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 })
  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[95] origin-left bg-gradient-to-r from-indigo via-cyan to-lime"
      style={{ scaleX }}
    />
  )
}
