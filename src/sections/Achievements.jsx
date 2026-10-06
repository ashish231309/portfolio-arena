import { motion } from 'motion/react'
import { Shield, Trophy, Feather, Medal, Users } from 'lucide-react'
import Section, { container, sectionPadding, SectionSurface } from '../components/Section'
import SectionHead from '../components/SectionHead'
import { achievements, traits } from '../data/achievements'
import { EASE } from '../lib/motion'

const ICONS = { ncc: Shield, marathon: Trophy, badminton: Feather, basketball: Medal, coordination: Users }

const TILE = {
  ncc: 'md:col-span-7 bg-ink text-ivory rounded-lg2',
  marathon: 'md:col-span-5 bg-coral text-ink rounded-md2',
  badminton: 'md:col-span-4 bg-paper text-ink border border-ink/10 rounded-md2',
  basketball: 'md:col-span-4 bg-cobalt/10 text-ink border border-cobalt/30 rounded-md2',
  coordination: 'md:col-span-4 bg-cyan/10 text-ink border border-cyan/40 rounded-md2',
}

const CHIP = {
  ncc: 'border-lime/50 text-lime',
  marathon: 'border-ink/30 text-ink',
  badminton: 'border-indigo/40 text-indigo-ink',
  basketball: 'border-cobalt/40 text-cobalt-ink',
  coordination: 'border-cyan/50 text-[#0b6b7c]',
}

// Unknown ids must never break the mosaic: fall back to the paper tile.
const TILE_FALLBACK = 'md:col-span-4 bg-paper text-ink border border-ink/10 rounded-md2'
const CHIP_FALLBACK = 'border-ink/30 text-ink'

function Tile({ item, i, level: H = 'h3' }) {
  const Icon = ICONS[item.id] || Shield
  return (
    <motion.article
      initial={{ opacity: 0, y: 34, rotate: i % 2 ? 1.2 : -1.2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: EASE }}
      className={`${TILE[item.id] || TILE_FALLBACK} p-[clamp(1.4rem,3vw,2.2rem)] flex flex-col`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-70">{item.kind}</p>
        <Icon size={18} aria-hidden="true" className="opacity-80" />
      </div>
      <H className="mt-3 font-display font-bold tracking-tighter2 text-[clamp(1.3rem,2.4vw,1.9rem)] leading-tight">
        {item.title}
      </H>
      <p className="mt-1 font-mono text-[11px] tracking-[0.14em] uppercase opacity-60">{item.period}</p>
      <p className="mt-4 text-[14px] leading-relaxed opacity-80">{item.body}</p>
      <ul className="mt-auto pt-5 flex flex-wrap gap-2">
        {item.highlights.map((h) => (
          <li key={h} className={`rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.12em] uppercase ${CHIP[item.id] || CHIP_FALLBACK}`}>
            {h}
          </li>
        ))}
      </ul>
    </motion.article>
  )
}

export default function Achievements({ bare = false }) {
  // Non-bare: this component owns its <section> (used on the home page).
  // Bare: the page owns the single <section>; this only contributes a
  // background surface + tone signal, so nothing double-wraps.
  const Wrapper = bare ? SectionSurface : Section
  // Bare pages own the only h1, so entry titles take the h2 slot (T26).
  const H = bare ? 'h2' : 'h3'

  return (
    <Wrapper id="achievements" bg="ivory" accent="lime" className={sectionPadding}>
      <div className={container}>
        {!bare && (
          <SectionHead
            index="07"
            title={['Beyond the', 'command line.']}
            note="Achievements & activities"
            accent="lime"
            id="achievements-title"
          />
        )}
        <div className="grid md:grid-cols-12 gap-4">
          {achievements.map((a, i) => (
            <Tile key={a.id} item={a} i={i} level={H} />
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-12 flex flex-wrap items-center gap-2 pt-4"
          >
            <span className="mr-2 font-mono text-[10px] tracking-[0.22em] uppercase text-muted">Habits & traits</span>
            {traits.map((t) => (
              <span
                key={t}
                className="rounded-full border border-ink/20 px-4 py-1.5 font-body font-semibold text-[13px] text-ink/75 transition-all duration-300 hover:border-lime hover:bg-lime/30 hover:-translate-y-0.5"
              >
                {t}
              </span>
            ))}
          </motion.div>
        </div>
        <p className="mt-6 font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
          participation is stated as participation — results only where a result actually exists.
        </p>
      </div>
    </Wrapper>
  )
}
