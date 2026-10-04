import { ArrowUpRight, BadgeCheck } from 'lucide-react'
import Section, { container, sectionPadding } from '../components/Section'
import SectionHead from '../components/SectionHead'
import { Fade } from '../components/Reveal'
import { certifications, physicalCertificatesNote } from '../data/certifications'
import { accentText } from '../lib/motion'

const tileBorder = {
  indigo: 'hover:border-indigo/60',
  cobalt: 'hover:border-cobalt/60',
  cyan: 'hover:border-cyan/60',
  coral: 'hover:border-coral/60',
  lime: 'hover:border-lime/60',
}

function CertTile({ cert, i }) {
  const onMove = (e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <Fade y={30} delay={Math.min(i * 0.07, 0.3)} className="snap-start shrink-0 w-[82vw] sm:w-[340px]">
      <article
        onMouseMove={onMove}
        data-cursor="cert"
        className={`spotlight group relative flex h-full flex-col rounded-md2 border border-ivory/10 bg-[#182136] p-6 transition-all duration-500 hover:-translate-y-1.5 ${tileBorder[cert.accent]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className={`font-mono text-[10px] tracking-[0.22em] uppercase ${accentText[cert.accent]}`}>{cert.provider}</p>
          <BadgeCheck size={16} className="text-fog group-hover:text-ivory transition-colors" aria-hidden="true" />
        </div>
        <h3 className="mt-3 font-display font-bold tracking-tight text-[1.25rem] leading-snug text-ivory">{cert.title}</h3>
        <p className="mt-3 text-[13px] leading-relaxed text-fog">{cert.blurb}</p>
        <div className="mt-auto pt-5">
          <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ivory/70">{cert.received}</p>
          {cert.score && (
            <p className="mt-1 font-mono text-[11px] tracking-[0.16em] text-lime">score — {cert.score}</p>
          )}
          {cert.credential && (
            <p className="mt-1 truncate font-mono text-[10px] tracking-[0.1em] text-fog">{cert.credential}</p>
          )}
          <a
            href={cert.file}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-ivory/25 px-4 py-2 font-mono text-[10px] tracking-[0.18em] uppercase text-ivory transition-colors duration-300 hover:bg-ivory hover:text-ink"
          >
            View certificate <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </div>
        <span className="absolute top-4 right-4 font-mono text-[10px] text-ivory/20" aria-hidden="true">
          {String(i + 1).padStart(2, '0')}
        </span>
      </article>
    </Fade>
  )
}

export default function Certifications({ bare = false }) {
  return (
    <Section id="certifications" bg="deep" accent="lime" className={sectionPadding}>
      <div className={container}>
        {!bare && (
          <SectionHead
            dark
            index="06"
            title={['Proof of learning,', 'not badge collecting.']}
            note="Certifications"
            accent="lime"
            id="certifications-title"
          />
        )}
        <Fade y={10}>
          <p className="mb-8 flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase text-fog">
            Credential rail — drag or scroll
            <span className="h-px flex-1 bg-ivory/10" aria-hidden="true" />
            {certifications.length} public credentials
          </p>
        </Fade>
      </div>
      <div
        className="no-scrollbar overflow-x-auto snap-x snap-mandatory edge-fade-x"
        data-cursor="drag"
        aria-label="Certifications rail"
      >
        <div className={`${container} flex gap-5 pb-6 pt-2 w-max min-w-full`}>
          {certifications.map((c, i) => (
            <CertTile key={c.id} cert={c} i={i} />
          ))}
          <div className="shrink-0 w-6" aria-hidden="true" />
        </div>
      </div>
      <div className={container}>
        <Fade delay={0.1}>
          <p className="mt-6 max-w-[70ch] font-mono text-[10px] leading-relaxed tracking-[0.12em] uppercase text-fog/80">
            {physicalCertificatesNote}
          </p>
        </Fade>
      </div>
    </Section>
  )
}
