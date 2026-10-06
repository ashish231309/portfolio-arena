import { Link } from 'react-router-dom'
import { ArrowUpRight, Github } from 'lucide-react'
import Section from '../components/Section'
import PageIntro from '../components/PageIntro'
import { Fade, ScaleIn } from '../components/Reveal'
import { projects } from '../data/projects'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ProjectsPage() {
  usePageMeta('Projects', 'Frontend website recreations by Ashish Kumar: Coding Ninjas (React 19 + Vite + Tailwind) and BMW (HTML/CSS/JS).')
  return (
    <Section bg="ivory" accent="indigo" className="pb-[clamp(5rem,10vh,8rem)]">
      <PageIntro
        index="03"
        crumb="/projects"
        title={['Two recreations,', 'one obsession:']}
        lede="Studying real production sites by rebuilding them — honestly labelled, fully owned, no fake demos."
      />
      <div className="mx-auto w-full max-w-[1200px] px-[clamp(1.25rem,4vw,3rem)] space-y-8">
        {projects.map((p, i) => (
          <Fade key={p.slug} y={30} delay={i * 0.08}>
            <Link
              to={`/projects/${p.slug}`}
              data-cursor="project"
              className={`group grid md:grid-cols-12 gap-0 overflow-hidden rounded-lg2 border border-ink/10 bg-paper transition-shadow duration-500 hover:shadow-panel ${i % 2 ? 'md:ml-10' : ''}`}
            >
              <div className="md:col-span-7 relative overflow-hidden bg-ink">
                <ScaleIn from={1}>
                  <img
                    src={p.gallery[0].src}
                    alt={p.gallery[0].alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top transition-transform duration-[1.1s] group-hover:scale-[1.04]"
                  />
                </ScaleIn>
                <span className="absolute top-4 left-4 rounded-full bg-ink/80 backdrop-blur px-3 py-1 font-mono text-[10px] tracking-[0.16em] uppercase text-cyan">
                  {p.label}
                </span>
              </div>
              <div className="md:col-span-5 p-[clamp(1.5rem,3vw,2.5rem)] flex flex-col">
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted">
                  Project {String(i + 1).padStart(2, '0')} · {p.year}
                </p>
                <h2 className="mt-3 font-display font-bold tracking-tighter2 text-[clamp(1.5rem,2.6vw,2.2rem)] leading-tight">
                  {p.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <li key={t} className="rounded-full border border-ink/15 px-3 py-1 font-mono text-[10px] tracking-[0.1em] text-ink/70">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6 flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 font-body font-bold text-sm text-indigo-ink">
                    Case study <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                  {p.github && (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] uppercase text-muted">
                      <Github size={13} aria-hidden="true" /> repo
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </Fade>
        ))}
      </div>
    </Section>
  )
}
