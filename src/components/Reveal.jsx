import { motion, useInView, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { EASE, staggerParent, maskLineChild, fadeUpChild } from '../lib/motion'

/** Line-by-line clip-mask reveal for display type. */
export function MaskLines({ lines, className = '', lineClassName = '', as = 'div', viewport = true, delay = 0, ...rest }) {
  const Tag = motion[as] || motion.div
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView={viewport ? 'show' : undefined}
      animate={!viewport ? 'show' : undefined}
      variants={staggerParent(0.1, delay)}
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
      {...rest}
    >
      {lines.map((line, i) => (
        <span className="mask-line" key={i}>
          <motion.span variants={maskLineChild} className={lineClassName}>
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/**
 * Word-by-word reveal for key statements. Highlighted words keep the brand
 * violet by default; callers on light grounds pass `text-indigo-ink` and on
 * dark grounds `text-indigo-soft` so the words always clear AA contrast.
 */
export function WordReveal({ text, className = '', stagger = 0.045, highlight = [], highlightClass = 'text-indigo' }) {
  const words = text.split(' ')
  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="show"
      variants={staggerParent(stagger)}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
            show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: EASE } },
          }}
          className={`inline-block mr-[0.28em] ${highlight.includes(w.replace(/[.,—]/g, '')) ? highlightClass : ''}`}
        >
          {w}
        </motion.span>
      ))}
    </motion.p>
  )
}

/** Generic scroll-triggered fade/slide with custom offsets. */
export function Fade({ children, y = 26, x = 0, delay = 0, duration = 0.7, className = '', once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Staggered children container (pairs with Fade-like children via variants). */
export function Stagger({ children, className = '', stagger = 0.08, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      variants={staggerParent(stagger, delay)}
      viewport={{ once: true, margin: '-8% 0px -8% 0px' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div variants={fadeUpChild} className={className}>
      {children}
    </motion.div>
  )
}

/** Subtle scroll-linked parallax wrapper. amount = px travel across viewport pass. */
export function Parallax({ children, amount = 40, className = '', direction = 1 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [amount * direction, -amount * direction])
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

/** Scale + fade entry for imagery. */
export function ScaleIn({ children, className = '', from = 0.94 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px -12% 0px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: from }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
