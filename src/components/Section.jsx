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
export default function Section({
  id,
  bg = 'ivory',
  accent = 'indigo',
  glow = true,
  grid = false,
  className = '',
  children,
  labelledBy,
}) {
  const tone = ['ink', 'deep', 'deeper'].includes(bg) ? 'dark' : 'light'
  const ref = useSectionSignal(tone, ACCENTS[accent] || accent)

  return (
    <section
      id={id}
      ref={ref}
      aria-labelledby={labelledBy}
      className={`relative ${BG[bg] || BG.ivory} ${className}`}
    >
      {grid && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${tone === 'dark' ? 'bg-grid-dark' : 'bg-grid-light'} opacity-70`}
        />
      )}
      {glow && <AmbientGlow accent={ACCENTS[accent] || accent} dark={tone === 'dark'} />}
      <div className="relative z-10">{children}</div>
    </section>
  )
}

export const sectionPadding = 'py-[clamp(5.5rem,12vh,9.5rem)]'
export const container = 'mx-auto w-full max-w-[1200px] px-[clamp(1.25rem,4vw,3rem)]'
