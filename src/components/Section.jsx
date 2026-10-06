import { useSectionSignal } from '../lib/site'
import AmbientGlow from './AmbientGlow'
import { ACCENTS } from '../lib/motion'

const BG = {
  ivory: 'bg-ivory text-ink',
  paper: 'bg-paper text-ink',
  ink: 'bg-ink text-ivory dark-zone',
  deep: 'bg-deep text-ivory dark-zone',
  deeper: 'bg-deeper text-ivory dark-zone',
  tint: 'bg-[#EFEAF9] text-ink',
}

/**
 * Section shell: background field, tone/accent signalling for nav+cursor,
 * local ambient glow and optional grid/noise texture.
 */
export function toneOf(bg) {
  return ['ink', 'deep', 'deeper'].includes(bg) ? 'dark' : 'light'
}

/** Background/text classes for a surface — shared by Section and SectionSurface. */
export const surfaceClass = (bg) => BG[bg] || BG.ivory

export default function Section({
  id,
  bg = 'ivory',
  accent = 'indigo',
  glow = true,
  grid = false,
  className = '',
  intro,
  children,
  labelledBy,
}) {
  const tone = toneOf(bg)
  const ref = useSectionSignal(tone, ACCENTS[accent] || accent)

  return (
    <section
      id={id}
      ref={ref}
      aria-labelledby={labelledBy}
      className={`relative ${surfaceClass(bg)} ${className}`}
    >
      {grid && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${tone === 'dark' ? 'bg-grid-dark' : 'bg-grid-light'} opacity-70`}
        />
      )}
      {glow && <AmbientGlow accent={ACCENTS[accent] || accent} dark={tone === 'dark'} />}
      <div className="relative z-10">
        {intro}
        {children}
      </div>
    </section>
  )
}

/**
 * A background field that is NOT its own <section> — used when a page owns a
 * single <Section> and a section component only contributes a coloured band
 * (e.g. the dark contact form inside the ivory /contact page). Keeps the tone
 * signalling and the background, but adds no second section and no second glow.
 */
export function SectionSurface({ bg = 'ivory', accent = 'indigo', className = '', children, id }) {
  const tone = toneOf(bg)
  const ref = useSectionSignal(tone, ACCENTS[accent] || accent)

  return (
    <div ref={ref} id={id} data-surface={bg} className={`relative ${surfaceClass(bg)} ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export const sectionPadding = 'py-[clamp(5.5rem,12vh,9.5rem)]'
export const container = 'mx-auto w-full max-w-[1200px] px-[clamp(1.25rem,4vw,3rem)]'
