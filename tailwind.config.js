/** @type {import('tailwindcss').Config} */
export default {
  // U31: `content` is unused in Tailwind 4 — file sources are declared via
  // `@source` directives in src/index.css (source(none) + explicit @source).
  // Left out on purpose so future editors don't update the wrong place.
  theme: {
    extend: {
      colors: {
        ivory: '#F6F2E8',
        paper: '#FFFCF5',
        ink: '#10162B',
        deep: '#121A2D',
        deeper: '#0B1120',
        indigo: { DEFAULT: '#6C5CE7', soft: '#8B7FF0', ink: '#5A4BD4' },
        cobalt: '#3B82F6',
        'cobalt-ink': '#1D4ED8',
        cyan: '#27D3F2',
        coral: '#FF6B6B',
        lime: '#C7F36B',
        muted: '#5B6474',
        fog: '#9AA3B5',
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', 'Space Grotesk', 'ui-sans-serif', 'sans-serif'],
        body: ['"Manrope Variable"', 'Manrope', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        tighter2: '-0.045em',
        mega: '-0.055em',
      },
      boxShadow: {
        panel: '0 24px 60px -24px rgba(16, 22, 43, 0.28)',
        lift: '0 14px 40px -18px rgba(16, 22, 43, 0.35)',
        glow: '0 0 0 1px rgba(108, 92, 231, 0.35), 0 12px 40px -12px rgba(108, 92, 231, 0.45)',
      },
      borderRadius: {
        xs: '4px',
        sm2: '8px',
        md2: '14px',
        lg2: '22px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinRev: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(0.8)' },
        },
        dashFlow: {
          to: { strokeDashoffset: '-240' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'marquee-slow': 'marquee 48s linear infinite',
        'spin-slow': 'spinSlow 40s linear infinite',
        'spin-rev': 'spinRev 28s linear infinite',
        'pulse-dot': 'pulseDot 2.4s ease-in-out infinite',
        'dash-flow': 'dashFlow 6s linear infinite',
        blink: 'blink 1.1s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
