import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'motion/react'
import { Github, ArrowRight, ArrowUpRight } from 'lucide-react'
import Section, { container, sectionPadding } from '../components/Section'
import SectionHead from '../components/SectionHead'
import { Fade, Parallax, ScaleIn } from '../components/Reveal'
import Magnetic from '../components/Magnetic'
import ProjectImage from '../components/ProjectImage'
import { projects } from '../data/projects'
import { spellNumber, capitalize } from '../lib/format'
import { EASE } from '../lib/motion'

function FeaturedStory({ project }) {
  const [frame, setFrame] = useState(0)
  const blockRefs = useRef([])

  const setBlock = (i) => (el) => {
    blockRefs.current[i] = el
  }

  return (
    <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
      {/* sticky visual */}
      <div className="lg:col-span-6">
        <div className="lg:sticky lg:top-24">
          <ScaleIn>
            <Link
              to={`/projects/${project.slug}`}
              data-cursor="project"
              data-cursor-label="OPEN CASE"
              aria-label={`Open the ${project.title} case study`}
              className="block rounded-md2 overflow-hidden bg-paper border border-ink/10 shadow-panel"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-ink/10 bg-paper">
                <span className="w-2.5 h-2.5 rounded-full bg-coral" aria-hidden="true" />
                <span className="w-2.5 h-2.5 rounded-full bg-lime" aria-hidden="true" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan" aria-hidden="true" />
                <span className="ml-3 truncate font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                  localhost — {project.slug} · {project.tech.slice(0, 2).join(' · ').toLowerCase()}
                </span>
              </div>
              {/* 16/9 (T30): the Coding Ninjas screenshots are 1264x712 ≈ 16/9, so the
                  featured frames now sit uncropped instead of losing ~10% off the sides
                  to a 16/10 box. */}
              <div className="relative aspect-video bg-ink">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={frame}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <ProjectImage
                      item={project.gallery[frame]}
                      sizes="(min-width: 1024px) 560px, 92vw"
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </motion.div>
                </AnimatePresence>
                <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 backdrop-blur px-3 py-1 font-mono text-[10px] tracking-[0.16em] uppercase text-cyan">
                  {String(frame + 1).padStart(2, '0')} / {project.gallery[frame]?.label ?? `frame ${frame + 1}`}
                </span>
              </div>
            </Link>
          </ScaleIn>
          {/* frame progress ticks */}
          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {project.gallery.map((_, i) => (
              <span
                key={i}
                className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i <= frame ? 'bg-indigo' : 'bg-ink/10'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* scrolling narrative */}
      <div className="lg:col-span-6">
        {[
          {
            head: '01 — Overview',
            body: (
              <>
                <p className="text-muted leading-relaxed">{project.summary}</p>
                <span className="mt-5 inline-block rounded-full bg-indigo/10 border border-indigo/30 px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase text-indigo-ink">
                  {project.label} — unofficial study project
                </span>
              </>
            ),
          },
          {
            head: `02 — ${capitalize(spellNumber(project.sections.length))} sections rebuilt`,
            body: (
              <>
                <p className="text-muted leading-relaxed">
                  Every band of the page exists as its own React component — composed, not copied:
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[12px] text-ink/80">
                  {project.sections.map((s, i) => (
                    <li key={s} className="flex items-baseline gap-2 border-b border-ink/10 py-1">
                      <span className="text-indigo-ink">{String(i + 1).padStart(2, '0')}</span> {s}
                    </li>
                  ))}
                </ul>
              </>
            ),
          },
          {
            head: '03 — Tech & honest status',
            body: (
              <>
                <ul className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <li key={t} className="rounded-full border border-ink/20 px-4 py-1.5 font-mono text-[11px] tracking-[0.1em] text-ink">
                      {t}
                    </li>
                  ))}
                </ul>
                <ul className="mt-5 space-y-2 text-sm text-muted">
                  {project.status.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.includes('No live') ? 'bg-coral' : 'bg-lime'} border border-ink/20`} aria-hidden="true" />
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                  no affiliation with or endorsement by Coding Ninjas
                </p>
              </>
            ),
          },
          {
            head: '04 — Explore it',
            body: (
              <div className="flex flex-wrap items-center gap-4">
                {/* T10: never render href={null} — projects without a public repo get a
                    plain, non-interactive "not published" badge instead of a dead button. */}
                {project.github ? (
                  <Magnetic strength={0.25} max={7}>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="button"
                      className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-body font-bold text-sm text-ivory transition-colors hover:bg-indigo-ink"
                    >
                      <Github size={16} aria-hidden="true" /> View on GitHub
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </a>
                  </Magnetic>
                ) : (
                  <span className="rounded-full border border-dashed border-ink/30 px-5 py-3 font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
                    Source not published yet
                  </span>
                )}
                <Link to={`/projects/${project.slug}`} data-cursor="link" className="underline-slide font-body font-semibold text-sm py-3.5">
                  Read the case study →
                </Link>
              </div>
            ),
          },
        ].map((block, i) => (
          <div
            key={block.head}
            ref={setBlock(i)}
            className="min-h-[62vh] flex flex-col justify-center py-10 border-b border-ink/10 last:border-0"
          >
            <BlockObserver onActive={() => setFrame(project.scrollFrames[i] ?? 0)} />
            <Fade y={20}>
              <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-indigo-ink">{block.head}</p>
              <div className="mt-4 text-[15px]">{block.body}</div>
            </Fade>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlockObserver({ onActive }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (inView) onActive()
  }, [inView, onActive])
  return <span ref={ref} className="hidden" aria-hidden="true" />
}

export default function ProjectsHome({ bare = false }) {
  const featured = projects.find((p) => p.featured)
  const secondary = projects.find((p) => !p.featured)

  return (
    <Section id="projects" bg="ivory" accent="indigo" className={sectionPadding}>
      <div className={container}>
        {!bare && (
          <SectionHead index="03" title={['Selected work —', 'studied, rebuilt, owned.']} note="Projects" accent="indigo" id="projects-title" />
        )}

        <Fade y={14}>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <h3 className="font-display font-bold tracking-tighter2 text-[clamp(1.7rem,3.4vw,2.8rem)]">
              {featured.title}
              <span className="ml-3 align-middle font-mono text-[11px] tracking-[0.2em] uppercase text-muted">featured · {featured.year}</span>
            </h3>
          </div>
        </Fade>

        <FeaturedStory project={featured} />

        {/* secondary immersive panel */}
        <div className="mt-[clamp(4rem,10vh,7rem)]">
          <Parallax amount={22}>
            <Link
              to={`/projects/${secondary.slug}`}
              data-cursor="project"
              className="group relative block overflow-hidden rounded-lg2 bg-ink text-ivory"
            >
              <ProjectImage
                item={secondary.gallery[0]}
                sizes="100vw"
                className="absolute inset-0 w-full h-full object-cover opacity-45 transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" aria-hidden="true" />
              <div className="relative p-[clamp(1.75rem,4vw,3.5rem)] min-h-[380px] flex flex-col justify-end">
                <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-cyan">
                  Project {String(projects.indexOf(secondary) + 1).padStart(2, '0')} — {secondary.tech.join(' · ')}
                </p>
                <h3 className="mt-3 font-display font-bold tracking-tighter2 text-[clamp(1.9rem,4.4vw,3.4rem)]">
                  {secondary.title}
                </h3>
                <p className="mt-4 max-w-[52ch] text-ivory/70 text-sm leading-relaxed">{secondary.summary}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {secondary.status.map((s) => (
                    <span key={s} className="rounded-full border border-dashed border-ivory/35 px-3.5 py-1 font-mono text-[10px] tracking-[0.14em] uppercase text-ivory/70">
                      {s}
                    </span>
                  ))}
                  <span className="ml-auto inline-flex items-center gap-2 font-body font-bold text-sm text-cyan">
                    Open case study <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          </Parallax>
        </div>

        <Fade delay={0.1}>
          <div className="mt-10 flex justify-end">
            <Link to="/projects" data-cursor="link" className="underline-slide font-body font-semibold text-sm">
              All projects & case studies →
            </Link>
          </div>
        </Fade>
      </div>
    </Section>
  )
}
