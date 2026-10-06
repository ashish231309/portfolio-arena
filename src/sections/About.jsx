import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import Section, { container, sectionPadding, SectionSurface } from '../components/Section'
import SectionHead from '../components/SectionHead'
import { WordReveal, Fade, Parallax } from '../components/Reveal'
import { profile } from '../data/profile'

function TerminalCard() {
  const lines = [
    { p: '$ whoami', c: 'text-fog' },
    { p: 'ashish-kumar :: btech-cse @ kit, aktu', c: 'text-ivory' },
    { p: '$ cat focus.txt', c: 'text-fog' },
    { p: 'full-stack · software-dev · web-dev · generative-ai', c: 'text-cyan' },
    { p: '$ ls ./currently-exploring', c: 'text-fog' },
    { p: profile.currentlyExploring.join('  ').toLowerCase(), c: 'text-lime' },
    { p: '$ status --now', c: 'text-fog' },
    { p: 'building · learning · experimenting', c: 'text-coral' },
  ]
  return (
    <div className="rounded-md2 bg-deep text-ivory border border-ivory/10 shadow-panel overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-ivory/10">
        <span className="w-2.5 h-2.5 rounded-full bg-coral" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-lime" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-cyan" aria-hidden="true" />
        <span className="ml-3 font-mono text-[10px] tracking-[0.2em] uppercase text-fog">ashish@kanpur — zsh</span>
      </div>
      <div className="p-5 font-mono text-[12px] leading-[1.9] break-words">
        {lines.map((l, i) => (
          <motion.p
            key={i}
            className={l.c}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.09, duration: 0.4 }}
          >
            {l.p}
          </motion.p>
        ))}
        <p className="text-fog">
          $ <span className="animate-blink text-ivory">▍</span>
        </p>
      </div>
    </div>
  )
}

export default function About({ bare = false }) {
  // Non-bare: this component owns its <section> (used on the home page).
  // Bare: the page owns the single <section>; this only contributes a
  // background surface + tone signal, so nothing double-wraps.
  const Wrapper = bare ? SectionSurface : Section

  return (
    <Wrapper id="about" bg="ivory" accent="cyan" className={sectionPadding}>
      <div className={container}>
        {!bare && (
          <SectionHead index="01" title={['A student developer,', 'building in public.']} note="About" accent="cyan" id="about-title" />
        )}
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <WordReveal
              text="I am a Computer Science & Engineering student working full stack — the interface, the logic and the data — with Generative AI alongside."
              className="font-display text-[clamp(1.35rem,2.5vw,2rem)] leading-snug tracking-tight text-ink"
              highlight={['full', 'stack', 'Generative', 'AI']}
              highlightClass="text-indigo-ink"
            />
            <div className="mt-7 space-y-5 max-w-[62ch] text-[clamp(0.98rem,1.05vw,1.08rem)] leading-relaxed text-muted">
              <Fade delay={0.1}>
                <p>
                  I like taking ideas from a blank file to a working interface — writing the markup, styling it
                  properly, and wiring the behaviour myself. Most of what I know comes from building: recreating
                  real websites piece by piece, reading what broke, and fixing it until it behaved.
                </p>
              </Fade>
              <Fade delay={0.2}>
                <p>
                  Right now I’m exploring Generative AI tooling, API integration, and the path from “it runs on my
                  machine” to “it runs somewhere else” — hosting, Docker and Linux, one experiment at a time.
                </p>
              </Fade>
            </div>

            <Fade delay={0.25} y={16}>
              <div className="mt-9">
                <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-muted">
                  <Sparkles size={13} className="text-lime" aria-hidden="true" /> Currently exploring
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {profile.currentlyExploring.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-dashed border-indigo/50 px-4 py-1.5 font-mono text-[11px] tracking-[0.08em] text-indigo-ink transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                  learning targets — not yet claimed as expertise
                </p>
              </div>
            </Fade>
          </div>

          <div className="lg:col-span-5">
            <Parallax amount={26}>
              <TerminalCard />
              <Fade delay={0.2}>
                <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-muted text-right">
                  fig. 01 — live status, no fiction
                </p>
              </Fade>
            </Parallax>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}
