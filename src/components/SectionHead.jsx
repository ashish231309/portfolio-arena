import { MaskLines, Fade } from './Reveal'
import { accentBg } from '../lib/motion'

/** Editorial section header: mono index + rule + masked display title + note. */
export default function SectionHead({ index, title, note, accent = 'indigo', dark = false, id }) {
  const lines = Array.isArray(title) ? title : [title]
  return (
    <div className="mb-[clamp(2.75rem,6vw,4.5rem)]">
      <Fade y={12} duration={0.6}>
        <div className={`flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] uppercase ${dark ? 'text-fog' : 'text-muted'}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${accentBg[accent]} animate-pulse-dot`} aria-hidden="true" />
          <span>§{index}</span>
          <span className={`flex-1 h-px ${dark ? 'bg-ivory/15' : 'bg-ink/15'}`} aria-hidden="true" />
          {note && <span className="hidden sm:inline">{note}</span>}
        </div>
      </Fade>
      <MaskLines
        as="h2"
        lines={lines}
        id={id}
        delay={0.08}
        className={`mt-5 font-display font-bold tracking-tighter2 text-[clamp(2.1rem,4.8vw,4.15rem)] leading-[1.02] ${dark ? 'text-ivory' : 'text-ink'}`}
      />
    </div>
  )
}
