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
  // Very slight, smooth tilt.
  const rotateX = useSpring(useTransform(py, [0, height], [3, -3], { clamp: true }), { stiffness: 70, damping: 24 })
  const rotateY = useSpring(useTransform(px, [0, width], [-4, 4], { clamp: true }), { stiffness: 70, damping: 24 })

  // Each pill rides on a specific ring, matching the dots:
  //  • SW  — outer purple ring  (r=92, 40s spin-slow, same as the purple dot)
  //  • WEB — middle cyan ring   (r=68, 28s spin-rev,  same as the cyan dot)
  //  • GENAI — inner coral ring (r=44, 22s spin-slow, same as the coral dot)
  // Pills in the SVG are drawn at the same visual size as the original HTML
  // pills (≈10px monospace, px-2 py-1 padding, rounded-full) — just converted
  // to SVG units.
  const pill = (label, color, cx, cy, rotDeg) => {
    // Pill dimensions in SVG user units for an ≈10px monospace label.
    const w = 28
    const h = 12
    return (
      <g transform={`translate(${cx},${cy}) rotate(${rotDeg})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} ry={h / 2}
          fill="#FFFCF5" stroke={color} strokeOpacity="0.55" strokeWidth="0.6" />
        <text x={0} y={3.2} textAnchor="middle"
          fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace"
          fontSize="6.2" letterSpacing="1.2" fill={color}
          style={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </text>
      </g>
    )
  }

  const tiltStyle = fine && !reduced ? { rotateX, rotateY, transformPerspective: 1000 } : undefined

  return (
    <div className="relative mx-auto w-full max-w-[430px] aspect-square">
      <motion.div
        className="absolute inset-1 rounded-[28px] bg-deep shadow-[0_28px_60px_-28px_rgba(16,22,43,0.5)] overflow-hidden"
        style={tiltStyle}
        aria-hidden="true"
      >
        {/* subtle grid texture matching bg-grid-dark (same as Skills/Certs) */}
        <div className="absolute inset-0 bg-grid-dark opacity-50" />

        {/* soft cursor-following indigo glow inside the card */}
        <CardGlow accent="rgba(108,92,231,0.24)" />

        {/* outer purple ring (40s, spin-slow) with SW pill + purple dot */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-slow motion-reduce:animate-none">
          <defs>
            <pattern id="od" width="8" height="8" patternUnits="userSpaceOnUse" />
          </defs>
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(108,92,231,0.35)" strokeWidth="0.6" strokeDasharray="3 5" />
          <circle cx="100" cy="8" r="2.6" fill="#6C5CE7" />
          {pill('SW', '#6C5CE7', 100 + Math.cos((-10 * Math.PI) / 180) * 92, 100 + Math.sin((-10 * Math.PI) / 180) * 92, -10)}
        </svg>

        {/* middle cyan ring (28s, reverse) with WEB pill + cyan dot */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-rev motion-reduce:animate-none">
          <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(39,211,242,0.4)" strokeWidth="0.7" strokeDasharray="1 4" />
          <circle cx="100" cy="32" r="2.2" fill="#27D3F2" />
          {pill('WEB', '#27D3F2', 100 + Math.cos((120 * Math.PI) / 180) * 68, 100 + Math.sin((120 * Math.PI) / 180) * 68, 120)}
        </svg>

        {/* inner coral ring (22s) with GENAI pill + coral dot */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ animation: 'spinSlow 22s linear infinite' }}>
          <circle cx="100" cy="100" r="44" fill="none" stroke="rgba(255,107,107,0.45)" strokeWidth="0.7" strokeDasharray="8 6" />
          <circle cx="144" cy="100" r="2" fill="#FF6B6B" />
          {pill('GENAI', '#FF6B6B', 100 + Math.cos((240 * Math.PI) / 180) * 44, 100 + Math.sin((240 * Math.PI) / 180) * 44, 240)}
        </svg>

        {/* AK core — circular, slightly smaller than the original 96px square */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative grid place-items-center w-[72px] h-[72px] rounded-full bg-ink text-ivory shadow-[0_0_0_1px_rgba(246,242,232,0.1),0_10px_24px_-10px_rgba(108,92,231,0.55)]">
            <span className="font-display font-bold text-xl tracking-tighter2">AK</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-lime animate-pulse-dot" />
          </div>
        </div>

        {/* code chips inside the card */}
        <div className="absolute left-5 top-[11%] hidden sm:block">
          <code className="block rounded-sm2 bg-paper/95 border border-ivory/15 px-3 py-2 font-mono text-[11px] text-muted shadow-lift">
            <GitCommitHorizontal size={11} className="inline mr-1 text-indigo" aria-hidden="true" />
            git commit -m &quot;learning&quot;
          </code>
        </div>
        <div className="absolute right-5 bottom-[11%] hidden sm:block">
          <code className="block rounded-md2 bg-ink/90 border border-ivory/10 px-3 py-2 font-mono text-[11px] text-cyan shadow-lift">
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
