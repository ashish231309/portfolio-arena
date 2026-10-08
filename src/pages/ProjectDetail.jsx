import { Link, useParams, Navigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Github, ArrowUpRight, ChevronLeft, Layers, Wrench } from 'lucide-react'
import Section, { container } from '../components/Section'
import { MaskLines, Fade, ScaleIn, Stagger, StaggerItem } from '../components/Reveal'
import Magnetic from '../components/Magnetic'
import ProjectImage from '../components/ProjectImage'
import { getProject } from '../data/projects'
import { usePageMeta } from '../hooks/usePageMeta'

function GalleryImage({ item, i }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])
  return (
    <div ref={ref} className={`overflow-hidden rounded-md2 border border-ink/10 bg-ink ${i % 2 ? 'md:ml-16' : 'md:mr-16'}`}>
      <motion.div style={{ y }} className="overflow-hidden">
        <ScaleIn>
          <ProjectImage
            item={item}
            sizes="(min-width: 768px) 92vw, 100vw"
            className="w-full object-cover object-top"
          />
        </ScaleIn>
      </motion.div>
      <p className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-muted bg-paper border-t border-ink/10">
        fig. {String(i + 1).padStart(2, '0')} — {item.alt.replace('Coding Ninjas recreation — ', '').replace('BMW recreation — ', '')}
      </p>
    </div>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = getProject(slug)
  usePageMeta(project ? project.title : 'Project', project?.summary)

  if (!project) return <Navigate to="/projects" replace />

  return (
    <>
      {/* cinematic header */}
      <Section bg="ink" accent="indigo" grid className="dark-zone" labelledBy="project-detail-title">
        <div className={`${container} pt-36 md:pt-44 pb-[clamp(3rem,8vh,5.5rem)]`}>
          <Fade y={10} duration={0.5}>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.22em] uppercase text-fog">
              <Link to="/projects" data-cursor="link" className="inline-flex items-center gap-1 underline-slide">
                <ChevronLeft size={13} aria-hidden="true" /> Projects
              </Link>
              <span className="h-px w-8 bg-ivory/20" aria-hidden="true" />
              <span className="text-cyan">{project.category}</span>
              <span>· {project.year}</span>
            </div>
          </Fade>
          <MaskLines
            as="h1"
            id="project-detail-title"
            delay={0.08}
            className="mt-6 font-display font-bold tracking-mega leading-[1.0] text-ivory text-[clamp(2.4rem,6.6vw,5.4rem)]"
            lines={project.title.split(' ').length > 4 ? [project.title.split(' ').slice(0, 2).join(' '), project.title.split(' ').slice(2).join(' ')] : [project.title]}
          />
          <div className="mt-8 grid lg:grid-cols-12 gap-8 items-end">
            <Fade delay={0.25} y={16}>
              <p className="lg:col-span-7 max-w-[58ch] text-ivory/70 leading-relaxed">{project.summary}</p>
            </Fade>
            <Fade delay={0.35} y={16}>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-indigo/20 border border-indigo/40 px-4 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase text-indigo-soft">
                  {project.label}
                </span>
                {project.status.map((s) => (
                  <span key={s} className="rounded-full border border-dashed border-ivory/30 px-4 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-ivory/60">
                    {s}
                  </span>
                ))}
              </div>
            </Fade>
          </div>
        </div>
      </Section>

      {/* gallery + substance */}
      <Section bg="ivory" accent="cyan" className="py-[clamp(4rem,10vh,7rem)]">
        <div className={`${container} space-y-6`}>
          {project.gallery.map((g, i) => (
            <GalleryImage key={g.src} item={g} i={i} />
          ))}
        </div>

        <div className={`${container} mt-[clamp(4rem,10vh,7rem)] grid lg:grid-cols-12 gap-12`}>
          <div className="lg:col-span-7">
            <Fade y={12}>
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.24em] uppercase text-indigo-ink">
                <Wrench size={13} aria-hidden="true" /> Implementation notes
              </p>
            </Fade>
            <Stagger className="mt-6 space-y-7" stagger={0.1}>
              {project.implementation.map((imp, i) => (
                <StaggerItem key={imp.title} className="border-t border-ink/10 pt-5">
                  <div className="flex gap-4">
                    <span className="font-mono text-[12px] text-indigo-ink pt-1">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h2 className="font-display font-bold tracking-tight text-xl">{imp.title}</h2>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted">{imp.body}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-8">
              <Fade y={16}>
                <div className="rounded-md2 border border-ink/10 bg-paper p-6">
                  <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-muted">
                    <Layers size={13} className="text-cyan" aria-hidden="true" /> Stack
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <li key={t} className="rounded-full bg-ink text-ivory px-4 py-1.5 font-mono text-[11px] tracking-[0.1em]">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Fade>
              <Fade y={16} delay={0.1}>
                <div className="rounded-md2 border border-ink/10 bg-paper p-6">
                  <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted">
                    {project.sections ? 'Sections rebuilt' : 'Pages built'}
                  </p>
                  <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-1.5 font-mono text-[12px] text-ink/75">
                    {(project.sections || project.pages).map((s, i) => (
                      <li key={s} className="flex items-baseline gap-2 border-b border-ink/10 py-1">
                        <span className="text-indigo-ink">{String(i + 1).padStart(2, '0')}</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </Fade>
              <Fade y={16} delay={0.18}>
                <div className="flex flex-wrap items-center gap-4">
                  {project.github ? (
                    <Magnetic strength={0.25} max={7}>
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="button"
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-body font-bold text-sm text-ivory transition-colors hover:bg-indigo-ink"
                      >
                        <Github size={16} aria-hidden="true" /> View on GitHub
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    </Magnetic>
                  ) : (
                    <span className="rounded-full border border-dashed border-ink/30 px-5 py-3 font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
                      Source not published yet
                    </span>
                  )}
                  <Link to="/projects" data-cursor="link" className="underline-slide font-body font-semibold text-sm">
                    ← All projects
                  </Link>
                </div>
              </Fade>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
