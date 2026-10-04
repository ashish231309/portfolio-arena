import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { EASE } from '../lib/motion'
import { profile } from '../data/profile'

/** First-visit wordmark veil: ~1s, then lifts away. Skipped afterwards + reduced motion. */
export default function Intro() {
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem('ak-intro-seen') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return false
    }
  })
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!show) return undefined
    const t1 = setTimeout(() => setGone(true), 1250)
    const t2 = setTimeout(() => {
      setShow(false)
      try {
        sessionStorage.setItem('ak-intro-seen', '1')
      } catch {
        /* noop */
      }
    }, 1950)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [show])

  if (!show) return null

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[110] bg-ink flex items-center justify-center overflow-hidden"
      animate={gone ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="text-center">
        <div className="mask-line">
          <motion.p
            className="font-display font-bold tracking-mega text-[clamp(2.4rem,9vw,5.5rem)] text-ivory leading-none"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          >
            ASHISH KUMAR
          </motion.p>
        </div>
        <motion.p
          className="mt-3 font-mono text-[11px] tracking-[0.3em] uppercase text-cyan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          {profile.coordinates} — portfolio 2026
        </motion.p>
        <motion.span
          className="block mx-auto mt-6 h-px w-40 bg-gradient-to-r from-indigo via-cyan to-lime origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
        />
      </div>
    </motion.div>
  )
}
