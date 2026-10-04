export const EASE = [0.16, 1, 0.3, 1]

export const SPRING = { stiffness: 180, damping: 22, mass: 0.6 }
export const SPRING_SOFT = { stiffness: 90, damping: 20, mass: 0.8 }

export const staggerParent = (stagger = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

export const maskLineChild = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 0.9, ease: EASE } },
}

export const fadeUpChild = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
}

export const ACCENTS = {
  indigo: '#6C5CE7',
  cobalt: '#3B82F6',
  cyan: '#27D3F2',
  coral: '#FF6B6B',
  lime: '#C7F36B',
}

export const accentText = {
  indigo: 'text-indigo',
  cobalt: 'text-cobalt',
  cyan: 'text-cyan',
  coral: 'text-coral',
  lime: 'text-lime',
}

export const accentBg = {
  indigo: 'bg-indigo',
  cobalt: 'bg-cobalt',
  cyan: 'bg-cyan',
  coral: 'bg-coral',
  lime: 'bg-lime',
}
