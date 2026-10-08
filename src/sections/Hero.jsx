import { Link } from 'react-router-dom'
import { motion, useSpring, useTransform } from 'motion/react'
import { ArrowRight, ArrowDown, GitCommitHorizontal } from 'lucide-react'
import { profile } from '../data/profile'
import Section, { container } from '../components/Section'
import Magnetic from '../components/Magnetic'
import { MaskLines, Fade } from '../components/Reveal'
import { useSite } from '../lib/site'
import { useFinePointer, useReducedMotionPref } from '../hooks/useMediaQuery'
import { useViewport } from '../hooks/useViewport'

/**
 * U15: Orbit visual — the only changes from the original are:
 *   1. A dark rounded bg-deep card (same #121A2D navy used by Skills/Certs)
 *      fills the right column with a very thin margin, matching the user's
 *      hand-drawn outline.
 *   2. Card tilts gently in 3D with the pointer (board-on-a-marble feel).
 *   3. AK core is now a perfect circle (slightly smaller) instead of a square.
 *   4. SW / WEB / GENAI pills ride on their respective rotating rings so they
 *      orbit exactly like the coloured dots do.
 *   5. Crosshair signal lines are removed.
 *   6. The two floating code chips live inside the card.
 * Everything else (ring speeds, sizes, pill styling, grid texture) stays as
 * close as possible to the original.
 */
function OrbitVisual() {
  const { px, py } = useSite()
  const fine = useFinePointer()
  const reduced = useReducedMotionPref()
  const { width, height } = useViewport()
  // Very nearly imperceptible board-on-marble tilt.
  const rotateX = useSpring(useTransform(py, [0, height], [1.5, -1.5], { clamp: true }), { stiffness: 90, damping: 28 })
  const rotateY = useSpring(useTransform(px, [0, width], [-2, 2], { clamp: true }), { stiffness: 90, damping: 28 })
  const tiltStyle = fine && !reduced ? { rotateX, rotateY, transformPerspective: 1200 } : undefined

  // Orbit ring radii (in 200×200 SVG units).
  const R_OUT = 92   // purple 40s
  const R_MID = 68   // cyan   28s rev
  const R_IN  = 44   // coral  22s
  // Start angles (in degrees) for each pill on its ring.
  const SW_A  = -30
  const WEB_A = 130
  const GEN_A = 250
  const rad = (d) => (d * Math.PI) / 180

  // Pills are drawn deliberately small so they read as tags on the rings,
  // not as large buttons. viewBox is 200×200; values below are in SVG units.
  const pill = (label, color, angle, r) => {
    const w = 17
    const h = 7
    const cx = 100 + Math.cos(rad(angle)) * r
    const cy = 100 + Math.sin(rad(angle)) * r
    return (
      <g transform={`translate(${cx},${cy})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} ry={h / 2}
          fill="#FFFCF5" stroke={color} strokeOpacity="0.45" strokeWidth="0.4" />
        <text x={0} y={2.2} textAnchor="middle"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
          fontSize="3.9" letterSpacing="0.7" fill={color}
          style={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </text>
      </g>
    )
  }

  return (
    // Card is a LANDSCAPE rounded rectangle (not a square) — matches the
    // outline in the user's sketch. The circular orbits live in a square
    // sub-container centered inside, sized to the card's height, so rings
    // stay perfectly circular and leave margin on all four sides for the
    // code chips, ring extents, and breathing room.
    <div className="relative w-full">
      <motion.div
        className="relative w-full aspect-[5/4] rounded-[24px] bg-deep shadow-[0_24px_60px_-28px_rgba(16,22,43,0.55)] overflow-hidden"
        style={tiltStyle}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-grid-dark opacity-50" aria-hidden="true" />
        <CardGlow accent="rgba(108,92,231,0.20)" />

        {/* Square orbit field, sized to ~86% of card height and centered.
            Because the card is landscape (5:4), height is the constraining
            dimension — this guarantees perfect circles with horizontal
            breathing room on both sides. */}
        <div className="absolute left-1/2 top-1/2 h-[86%] aspect-square -translate-x-1/2 -translate-y-1/2">
          {/* outer purple */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-slow motion-reduce:animate-none">
            <circle cx="100" cy="100" r={R_OUT} fill="none" stroke="rgba(108,92,231,0.35)" strokeWidth="0.6" strokeDasharray="3 5" />
            <circle cx={100 + Math.cos(rad(-90)) * R_OUT} cy={100 + Math.sin(rad(-90)) * R_OUT} r="2.2" fill="#6C5CE7" />
            {pill('SW', '#6C5CE7', SW_A, R_OUT)}
          </svg>
          {/* middle cyan (reverse) */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-rev motion-reduce:animate-none">
            <circle cx="100" cy="100" r={R_MID} fill="none" stroke="rgba(39,211,242,0.4)" strokeWidth="0.7" strokeDasharray="1 4" />
            <circle cx={100 + Math.cos(rad(-90)) * R_MID} cy={100 + Math.sin(rad(-90)) * R_MID} r="1.9" fill="#27D3F2" />
            {pill('WEB', '#27D3F2', WEB_A, R_MID)}
          </svg>
          {/* inner coral */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ animation: 'spinSlow 22s linear infinite' }}>
            <circle cx="100" cy="100" r={R_IN} fill="none" stroke="rgba(255,107,107,0.45)" strokeWidth="0.7" strokeDasharray="8 6" />
            <circle cx={100 + R_IN} cy="100" r="1.7" fill="#FF6B6B" />
            {pill('GENAI', '#FF6B6B', GEN_A, R_IN)}
          </svg>
          {/* AK core — circle, centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative grid place-items-center w-[70px] h-[70px] rounded-full bg-ink text-ivory shadow-[0_0_0_1px_rgba(246,242,232,0.1),0_10px_24px_-10px_rgba(108,92,231,0.55)]">
              <span className="font-display font-bold text-xl tracking-tighter2">AK</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-lime animate-pulse-dot" />
            </div>
          </div>
        </div>

        {/* code chips live inside the card but outside the orbit square */}
        <div className="absolute left-5 top-5 hidden sm:block">
          <code className="block rounded-sm2 bg-paper/95 border border-ivory/15 px-2.5 py-1.5 font-mono text-[10px] text-muted shadow-lift">
            <GitCommitHorizontal size={10} className="inline mr-1 text-indigo" aria-hidden="true" />
            git commit -m &quot;learning&quot;
          </code>
        </div>
        <div className="absolute right-5 bottom-5 hidden sm:block">
          <code className="block rounded-md2 bg-ink/90 border border-ivory/10 px-2.5 py-1.5 font-mono text-[10px] text-cyan shadow-lift">
            const curious = true<span className="animate-blink">_</span>
          </code>
        </div>
      </motion.div>
    </div>
  )
}

/** Cursor-following soft glow inside the orbit card (uses CSS vars like AmbientGlow). */
function CardGlow({ accent }) {
  const ref = (el) => { CardGlow._ref = el }
  // Attach listener once per module load.
  if (typeof window !== 'undefined' && !CardGlow._bound) {
    CardGlow._bound = true
    window.addEventListener('pointermove', (e) => {
      const el = CardGlow._ref
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }, { passive: true })
  }
  const fine = useFinePointer()
  const reduced = useReducedMotionPref()
  if (reduced || !fine) return null
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), ${accent}, transparent 65%)`,
      }}
    />
  )
}

export default function Hero() {
  return (
    <Section id="top" bg="ivory" accent="indigo" grid className="min-h-[100svh] flex items-center" labelledBy="hero-title">
      <div className={`${container} pt-28 md:pt-32 pb-16`}>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7">
            <Fade y={10} duration={0.6}>
              <p className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.24em] uppercase text-muted">
                <span className="w-2 h-2 rounded-full bg-indigo animate-pulse-dot" aria-hidden="true" />
                §00 — Identity
                <span className="h-px w-10 bg-ink/20" aria-hidden="true" />
                {profile.coordinates}
              </p>
            </Fade>

            <MaskLines
              as="h1"
              id="hero-title"
              delay={0.1}
              className="mt-6 font-display font-bold tracking-mega leading-[0.98] text-[clamp(2.75rem,7.6vw,6.4rem)]"
              lines={[
                'Computer Science',
                'student building with',
                <span key="l3">
                  Software<span className="text-indigo">,</span> Web{' '}
                  <span className="text-cobalt">&amp;</span>{' '}
                  <span className="relative inline-block text-indigo">
                    Generative AI
                    <svg viewBox="0 0 220 12" className="absolute -bottom-1 left-0 w-full" aria-hidden="true" preserveAspectRatio="none">
                      <path d="M2 9 C 60 2, 150 2, 218 8" fill="none" stroke="#27D3F2" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </span>
                </span>,
              ]}
            />

            <Fade delay={0.5} y={18}>
              <p className="mt-7 max-w-[46ch] text-[clamp(1rem,1.15vw,1.15rem)] leading-relaxed text-muted">
                I’m {profile.name} — a B.Tech CSE student in Kanpur turning coursework, curiosity and late-night
                experiments into real interfaces. Currently exploring Generative AI, one rebuild at a time.
              </p>
            </Fade>

            <Fade delay={0.62} y={18}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Magnetic strength={0.25} max={7}>
                  <Link
                    to="/projects"
                    data-cursor="button"
                    className="group inline-flex items-center gap-2 rounded-full bg-indigo-ink px-6 py-3.5 font-body font-bold text-sm text-ivory transition-colors duration-300 hover:bg-[#4B3FC2]"
                  >
                    View projects
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </Magnetic>
                <Magnetic strength={0.25} max={7}>
                  <a
                    href={profile.resume}
                    download="Ashish-Kumar-Resume.pdf"
                    data-cursor="button"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-6 py-3.5 font-body font-bold text-sm text-ink transition-colors duration-300 hover:bg-ink hover:text-ivory"
                  >
                    Download resume
                  </a>
                </Magnetic>
                <Link to="/contact" data-cursor="contact" className="underline-slide font-body font-semibold text-sm text-ink/80 py-3.5">
                  Let’s talk →
                </Link>
              </div>
            </Fade>

            <Fade delay={0.74} y={14}>
              <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 border-t border-ink/10 pt-6">
                {profile.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">{f.label}</dt>
                    <dd className="mt-1 font-body font-semibold text-[13px] text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Fade>
          </div>

          <div className="lg:col-span-5">
            <OrbitVisual />
          </div>
        </div>

        <Fade delay={0.9} y={8}>
          <div className="mt-14 flex items-center gap-3 font-mono text-[10px] tracking-[0.28em] uppercase text-muted">
            <ArrowDown size={13} className="animate-bounce motion-reduce:animate-none" aria-hidden="true" />
            Scroll — the story continues
            <span className="flex-1 h-px bg-ink/15" aria-hidden="true" />
          </div>
        </Fade>
      </div>
    </Section>
  )
}
