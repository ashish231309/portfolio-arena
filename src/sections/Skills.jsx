import Section, { container, sectionPadding } from '../components/Section'
import SectionHead from '../components/SectionHead'
import { Fade, Stagger, StaggerItem } from '../components/Reveal'
import { skillGroups } from '../data/skills'
import { accentText } from '../lib/motion'

const hoverBg = {
  indigo: 'hover:border-indigo hover:bg-indigo/10',
  cobalt: 'hover:border-cobalt hover:bg-cobalt/10',
  cyan: 'hover:border-cyan hover:bg-cyan/10',
  coral: 'hover:border-coral hover:bg-coral/10',
  lime: 'hover:border-lime hover:bg-lime/10',
}

export default function Skills({ bare = false }) {
  return (
    <Section id="skills" bg="deep" accent="cyan" grid className={sectionPadding}>
      <div className={container}>
        {!bare && (
          <SectionHead
            dark
            index="02"
            title={['What I work with —', 'and what I’m chasing.']}
            note="Skills & tools"
            accent="cyan"
            id="skills-title"
          />
        )}
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Fade>
                <p className="max-w-[34ch] text-fog leading-relaxed">
                  No fake percentages here. These are the languages, tools and ideas I actually write code with —
                  plus an honest list of what I’m learning right now.
                </p>
              </Fade>
              <Fade delay={0.15}>
                <div className="mt-8 space-y-3 font-mono text-[11px] tracking-[0.14em] uppercase text-fog">
                  <p className="flex items-center gap-3">
                    <span className="inline-block w-6 h-px bg-cyan" aria-hidden="true" /> practised in projects / coursework
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="inline-block w-6 border-t border-dashed border-lime" aria-hidden="true" /> exploring now
                  </p>
                </div>
              </Fade>
              <Fade delay={0.25}>
                <p className="mt-10 font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold tracking-tighter2 text-ivory">
                  Strongest language:
                  <span className="block text-cyan">C — then curiosity.</span>
                </p>
              </Fade>
            </div>
          </div>

          <div className="lg:col-span-8">
            {skillGroups.map((g, gi) => (
              <Stagger key={g.id} className={`py-8 ${gi > 0 ? 'border-t border-ivory/10' : ''}`} stagger={0.05}>
                <StaggerItem>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className={`font-mono text-[11px] tracking-[0.24em] ${accentText[g.accent]}`}>{g.index}</span>
                    <h3 className="font-display font-bold tracking-tighter2 text-[clamp(1.4rem,2.4vw,2rem)] text-ivory">
                      {g.title}
                    </h3>
                    <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-fog">{g.note}</span>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <ul className="mt-5 flex flex-wrap gap-2.5">
                    {g.skills.map((s) => (
                      <li key={s.name}>
                        <span
                          data-cursor="link"
                          className={`group inline-flex flex-wrap items-baseline gap-2 rounded-full border px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 ${
                            g.dashed ? 'border-dashed border-lime/50 text-lime' : 'border-ivory/20 text-ivory/85'
                          } ${hoverBg[g.accent] || ''}`}
                        >
                          <span className="font-body font-semibold text-sm">{s.name}</span>
                          <span className="hidden md:inline font-mono text-[10px] tracking-[0.08em] text-fog group-hover:text-ivory/70">
                            {s.context}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </StaggerItem>
              </Stagger>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
