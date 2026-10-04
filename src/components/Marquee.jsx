const DEFAULT = ['Building', 'Learning', 'Experimenting', 'Web', 'Generative AI', 'Software']
const SPARKS = ['text-cyan', 'text-lime', 'text-coral', 'text-indigo-soft']

/** Ink band marquee — ambient typographic motion between sections. */
export default function Marquee({ items = DEFAULT, className = '', tilt = -1.4 }) {
  const row = (key) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === 1}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-[0.6em] font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold tracking-tighter2 uppercase">
            {item}
          </span>
          <span className={`font-display text-[clamp(1.2rem,2.6vw,2rem)] ${SPARKS[i % SPARKS.length]}`} aria-hidden="true">
            ✳
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div className={`relative overflow-hidden py-5 ${className}`} style={{ transform: `rotate(${tilt}deg) scale(1.02)` }}>
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row(0)}
        {row(1)}
      </div>
    </div>
  )
}
