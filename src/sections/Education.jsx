import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { GraduationCap, School } from 'lucide-react'
import Section, { container, sectionPadding, SectionSurface } from '../components/Section'
import SectionHead from '../components/SectionHead'
import { Fade } from '../components/Reveal'
import { education, } from '../data/education'
import { coursework } from '../data/skills'

function DegreeProgress() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20%' })
  const years = ['2023', '2024', '2025', '2026', '2027']
  return (
    <div ref={ref} className="mt-8">
      <div className="relative h-px bg-ink/15">
        <motion.span
          className="absolute inset-y-0 left-0 bg-indigo"
          initial={{ width: '0%' }}
          animate={inView ? { width: '75%' } : {}}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        {years.map((y, i) => (
          <span
            key={y}
            className="absolute -translate-x-1/2 -top-[3px] w-[7px] h-[7px] rounded-full border border-ink/30 bg-ivory"
            style={{ left: `${i * 25}%` }}
            aria-hidden="true"
          />
        ))}
        <motion.span
          className="absolute -top-[5px] w-[11px] h-[11px] rounded-full bg-indigo ring-4 ring-indigo/20"
          initial={{ left: '0%' }}
          animate={inView ? { left: '75%' } : {}}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-3 flex justify-between font-mono text-[10px] tracking-[0.16em] text-muted">
        {years.map((y, i) => (
          <span key={y} className={i === 3 ? 'text-indigo font-bold' : ''}>
            {y}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Education({ bare = false }) {
  // Non-bare: this component owns its <section> (used on the home page).
  // Bare: the page owns the single <section>; this only contributes a
  // background surface + tone signal, so nothing double-wraps.
  const Wrapper = bare ? SectionSurface : Section

  return (
    <Wrapper id="education" bg="tint" accent="indigo" className={sectionPadding}>
      <div className={container}>
        {!bare && (
          <SectionHead index="05" title={['Four years, ten subjects,', 'one direction.']} note="Education" accent="indigo" id="education-title" />
        )}
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <Fade y={24}>
              <article className="rounded-lg2 bg-paper border border-ink/10 p-[clamp(1.5rem,3.5vw,2.75rem)] shadow-lift">
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase text-muted">
                  <GraduationCap size={14} className="text-indigo" aria-hidden="true" />
                  {education.degree.started} — {education.degree.graduation}
                  <span className="rounded-full bg-lime px-3 py-0.5 text-[10px] tracking-[0.14em] text-ink">{education.degree.current}</span>
                </div>
                <h3 className="mt-4 font-display font-bold tracking-tighter2 text-[clamp(1.6rem,3vw,2.5rem)] leading-tight">
                  {education.degree.title}
                </h3>
                <p className="mt-2 font-body font-semibold text-ink/80">{education.degree.institute}</p>
                <p className="mt-1 text-sm text-muted">{education.degree.university}</p>
                <p className="mt-4 font-mono text-[12px] tracking-[0.14em] text-indigo">{education.degree.cgpa}</p>
                <DegreeProgress />
              </article>
            </Fade>
          </div>
          <div className="lg:col-span-5">
            <Fade delay={0.12} y={24}>
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted">Relevant coursework</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {coursework.map((c) => (
                  <li
                    key={c}
                    className="rounded-sm2 bg-paper border border-ink/10 px-3.5 py-1.5 font-body font-semibold text-[13px] text-ink/80 transition-transform duration-300 hover:-translate-y-0.5 hover:border-indigo/50"
                  >
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-[10px] tracking-[0.14em] uppercase text-muted/80">
                academic coursework — foundations, not claimed expertise
              </p>
            </Fade>
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {education.school.map((s, i) => (
            <Fade key={s.label} y={18} delay={i * 0.1}>
              <div className="flex items-start justify-between gap-4 border-t border-ink/15 pt-4">
                <div>
                  <p className="flex items-center gap-2 font-body font-bold text-[15px]">
                    <School size={14} className="text-muted" aria-hidden="true" /> {s.label}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {s.institute} · {s.board}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[12px] tracking-[0.14em] text-muted">{s.year}</p>
                  <p className="font-display font-bold text-lg text-ink/80">{s.score}</p>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </Wrapper>
  )
}
