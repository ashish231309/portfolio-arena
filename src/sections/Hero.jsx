import { Link } from 'react-router-dom'
import { motion, useSpring, useTransform } from 'motion/react'
import { ArrowRight, ArrowDown, GitCommitHorizontal } from 'lucide-react'
import { profile } from '../data/profile'
import Section, { container } from '../components/Section'
import Magnetic from '../components/Magnetic'
import { MaskLines, Fade, Parallax } from '../components/Reveal'
import { useSite } from '../lib/site'
import { useFinePointer, useReducedMotionPref } from '../hooks/useMediaQuery'
import { useViewport } from '../hooks/useViewport'

function OrbitVisual() {
  const { px, py } = useSite()
  const fine = useFinePointer()
  const reduced = useReducedMotionPref()
  // Viewport via hook (never read during render): SSR/prerender safe and the
  // tilt range follows the window after a resize instead of freezing.
  const { width, height } = useViewport()
  const rotateX = useSpring(useTransform(py, [0, height], [7, -7]), { stiffness: 90, damping: 18 })
  const rotateY = useSpring(useTransform(px, [0, width], [-9, 9]), { stiffness: 90, damping: 18 })

  const nodes = [
    { label: 'SW', angle: 0, color: '#6C5CE7', r: 46 },
    { label: 'WEB', angle: 120, color: '#27D3F2', r: 34 },
    { label: 'GENAI', angle: 240, color: '#FF6B6B', r: 22 },
  ]

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[430px] aspect-square"
      style={fine && !reduced ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      aria-hidden="true"
    >
      {/* rings */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-slow motion-reduce:animate-none">
        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(16,22,43,0.16)" strokeWidth="0.6" strokeDasharray="3 5" />
        <circle cx="100" cy="4" r="2.6" fill="#6C5CE7" />
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-rev motion-reduce:animate-none">
        <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(108,92,231,0.4)" strokeWidth="0.7" strokeDasharray="1 4" />
        <circle cx="100" cy="32" r="2.2" fill="#27D3F2" />
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-slow motion-reduce:animate-none" style={{ animationDuration: '22s' }}>
        <circle cx="100" cy="100" r="44" fill="none" stroke="rgba(255,107,107,0.45)" strokeWidth="0.7" strokeDasharray="8 6" />
        <circle cx="144" cy="100" r="2" fill="#FF6B6B" />
      </svg>

      {/* signal line from core */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
        <path d="M100 100 L 176 62" stroke="rgba(16,22,43,0.25)" strokeWidth="0.6" strokeDasharray="4 4" className="animate-dash-flow motion-reduce:animate-none" />
        <path d="M100 100 L 34 148" stroke="rgba(16,22,43,0.25)" strokeWidth="0.6" strokeDasharray="4 4" className="animate-dash-flow motion-reduce:animate-none" />
      </svg>

      {/* core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative grid place-items-center w-24 h-24 rounded-md2 bg-ink text-ivory shadow-panel">
          <span className="font-display font-bold text-2xl tracking-tighter2">AK</span>
          <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-lime animate-pulse-dot" />
        </div>
      </div>

      {/* node labels */}
      {nodes.map((n) => {
        const rad = (n.angle * Math.PI) / 180
        const x = 50 + Math.cos(rad) * n.r
        const y = 50 + Math.sin(rad) * n.r
        return (
          <span
            key={n.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.2em] px-2 py-1 rounded-full border bg-paper"
            style={{ left: `${x}%`, top: `${y}%`, color: n.color, borderColor: `${n.color}55` }}
          >
            {n.label}
          </span>
        )
      })}

      {/* floating code fragments */}
      <Parallax amount={18} className="absolute -left-6 top-[12%] hidden sm:block">
        <code className="block rounded-sm2 bg-paper border border-ink/10 px-3 py-2 font-mono text-[11px] text-muted shadow-lift">
          <GitCommitHorizontal size={11} className="inline mr-1 text-indigo" aria-hidden="true" />
          git commit -m &quot;learning&quot;
        </code>
      </Parallax>
      <Parallax amount={-14} className="absolute -right-2 bottom-[10%] hidden sm:block">
        <code className="block rounded-sm2 bg-ink text-cyan px-3 py-2 font-mono text-[11px] shadow-lift">
          const curious = true<span className="animate-blink">_</span>
        </code>
      </Parallax>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <Section id="top" bg="ivory" accent="indigo" grid className="min-h-[100svh] flex items-center">
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
                    className="group inline-flex items-center gap-2 rounded-full bg-indigo px-6 py-3.5 font-body font-bold text-sm text-ivory transition-colors duration-300 hover:bg-[#5a4bd4]"
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
