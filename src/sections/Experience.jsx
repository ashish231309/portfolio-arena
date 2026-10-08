import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import { Briefcase, GraduationCap, ArrowUpRight, FlaskConical } from 'lucide-react'
import Section, { container, sectionPadding, SectionSurface } from '../components/Section'
import SectionHead from '../components/SectionHead'
import { Fade, Stagger, StaggerItem } from '../components/Reveal'
import { experience, simulations } from '../data/experience'
import { accentBg } from '../lib/motion'

function Timeline({ level: H = 'h3' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

  return (
    <div ref={ref} className="relative pl-8 md:pl-10">
      <span className="absolute left-[7px] md:left-[9px] top-2 bottom-2 w-px bg-ink/10" aria-hidden="true" />
      <motion.span
        className="absolute left-[7px] md:left-[9px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-indigo via-cobalt to-coral"
        style={{ scaleY }}
        aria-hidden="true"
      />
      <ol className="space-y-14">
        {experience.map((job, i) => (
          <li key={job.id} className={`relative ${i % 2 === 1 ? 'lg:ml-12' : ''}`}>
            <span
              className={`absolute -left-8 md:-left-10 top-2 ml-[3px] md:ml-[5px] w-2.5 h-2.5 rounded-full ${accentBg[job.accent]} ring-4 ring-ivory`}
              aria-hidden="true"
            />
            <Stagger stagger={0.08}>
              <StaggerItem>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase text-muted">
                  <span>{job.period}</span>
                  <span className="rounded-full border border-ink/20 px-3 py-0.5 text-[10px]">{job.type}</span>
                </div>
              </StaggerItem>
              <StaggerItem>
                <H className="mt-2 font-display font-bold tracking-tighter2 text-[clamp(1.4rem,2.6vw,2.1rem)]">{job.role}</H>
                <p className="mt-1 font-body font-semibold text-sm text-ink/70">{job.org}</p>
              </StaggerItem>
              <StaggerItem>
                <ul className="mt-4 max-w-[60ch] space-y-2 text-[15px] leading-relaxed text-muted">
                  {job.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className="mt-[0.65em] w-4 h-px shrink-0 bg-coral" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
              <StaggerItem>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.tags.map((t) => (
                    <span key={t} className="rounded-full bg-ink/5 border border-ink/10 px-3 py-1 font-mono text-[10px] tracking-[0.1em] text-ink/70">
                      {t}
                    </span>
                  ))}
                  {job.certificate && (
                    <a
                      href={job.certificate}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="cert"
                      className="inline-flex items-center gap-1 rounded-full border border-indigo/40 px-3 py-1 font-mono text-[10px] tracking-[0.1em] uppercase text-indigo-ink hover:bg-indigo-ink hover:text-ivory transition-colors"
                    >
                      Certificate <ArrowUpRight size={11} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </StaggerItem>
            </Stagger>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Experience({ bare = false }) {
  // Non-bare: this component owns its <section> (used on the home page).
  // Bare: the page owns the single <section>; this only contributes a
  // background surface + tone signal, so nothing double-wraps.
  const Wrapper = bare ? SectionSurface : Section
  // Bare pages own the only h1, so entry titles take the h2 slot (T26).
  const H = bare ? 'h2' : 'h3'

  return (
    <Wrapper id="experience" bg="ivory" accent="coral" className={sectionPadding} {...(!bare ? { labelledBy: 'experience-title' } : {})}>
      <div className={container}>
        {!bare && (
          <SectionHead index="04" title={['Work, internships', '& simulated sprints.']} note="Experience" accent="coral" id="experience-title" />
        )}
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-6">
              <Fade>
                <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-muted">
                  <Briefcase size={13} className="text-coral" aria-hidden="true" /> Employment & internships
                </p>
                <p className="mt-3 max-w-[32ch] text-muted leading-relaxed">
                  Real roles with real teams — remote internships where I shipped content and code tasks, learned
                  deadlines, and asked too many questions.
                </p>
              </Fade>
              <Fade delay={0.15}>
                <div className="rounded-md2 border border-dashed border-cobalt/50 bg-cobalt/5 p-5">
                  <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-cobalt-ink">
                    <FlaskConical size={13} aria-hidden="true" /> Virtual job simulations
                  </p>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    Forage simulations below are structured practice on company-style briefs —{' '}
                    <strong className="text-ink font-semibold">not employment</strong>.
                  </p>
                </div>
              </Fade>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Timeline level={H} />

            <div className="mt-20">
              <Fade y={12}>
                <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-cobalt-ink flex items-center gap-2">
                  <GraduationCap size={14} aria-hidden="true" /> Virtual job simulations — Forage
                </p>
              </Fade>
              <div className="mt-6 grid md:grid-cols-2 gap-5">
                {simulations.map((sim, i) => (
                  <Fade key={sim.id} y={26} delay={i * 0.1}>
                    <article className="group relative h-full rounded-md2 border border-dashed border-ink/25 bg-paper p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cobalt hover:shadow-lift">
                      {/* stretched link: the whole card opens the simulation certificate */}
                      <a
                        href={sim.certificate}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="cert"
                        aria-label={`View the ${sim.org} ${sim.title} certificate — opens in a new tab`}
                        className="absolute inset-0 z-10 rounded-md2"
                      />
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-cobalt-ink">{sim.org}</p>
                      <H className="mt-2 font-display font-bold tracking-tight text-xl leading-snug">{sim.title}</H>
                      <p className="mt-2 font-mono text-[11px] tracking-[0.12em] uppercase text-muted">
                        {sim.platform} · completed {sim.completed}
                      </p>
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {sim.areas.slice(0, 6).map((a) => (
                          <li key={a} className="rounded-full border border-ink/15 px-2.5 py-0.5 font-mono text-[10px] text-ink/70">
                            {a}
                          </li>
                        ))}
                      </ul>
                      <span
                        aria-hidden="true"
                        className="mt-5 inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.14em] uppercase text-cobalt-ink underline-slide"
                      >
                        View certificate <ArrowUpRight size={12} aria-hidden="true" />
                      </span>
                    </article>
                  </Fade>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}
