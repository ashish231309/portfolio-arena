import { Component } from 'react'

/**
 * Last line of defence: if any route throws at runtime (or a lazy chunk fails to load),
 * the visitor gets a branded, self-contained fallback instead of a blank page.
 *
 * Deliberately dependency-free — inline styles only, and no router hooks — so it still
 * renders when the CSS chunk, the router or a lazy import is what failed. Nav and Footer
 * live outside this boundary and stay on screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Keep it visible for debugging without shipping a logging service.
    console.error('[portfolio] render error:', error, info?.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <main
        id="main"
        style={{
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          background: '#10162B',
          color: '#F6F2E8',
          padding: 'clamp(1.5rem, 6vw, 4rem)',
          fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: '62ch' }}>
          <p
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#FF6B6B',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 99, background: '#FF6B6B' }} aria-hidden="true" />
            error — something broke in the render
          </p>

          <h1
            style={{
              fontFamily: '"Space Grotesk Variable", "Space Grotesk", ui-sans-serif, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.045em',
              lineHeight: 1.02,
              fontSize: 'clamp(2rem, 6vw, 3.6rem)',
              margin: '20px 0 0',
            }}
          >
            That section never shipped.
          </h1>

          <p style={{ color: '#9AA3B5', lineHeight: 1.65, margin: '18px 0 0', fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)' }}>
            A runtime error stopped this page from rendering. The rest of the site is fine — reload, or head back to the
            homepage and pick the trail up again.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                font: 'inherit',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                border: 0,
                borderRadius: 999,
                padding: '14px 26px',
                background: '#C7F36B',
                color: '#10162B',
              }}
            >
              Reload the page
            </button>
            <a
              href="/"
              style={{
                fontWeight: 700,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 999,
                padding: '14px 26px',
                border: '1px solid rgba(246,242,232,0.3)',
                color: '#F6F2E8',
                textDecoration: 'none',
              }}
            >
              Back to home
            </a>
          </div>

          <p
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#9AA3B5',
              margin: '34px 0 0',
            }}
          >
            <a href={`mailto:ashish1492a@gmail.com`} style={{ color: '#27D3F2' }}>
              ashish1492a@gmail.com
            </a>{' '}
            — tell me what you clicked and I&apos;ll fix it.
          </p>
        </div>
      </main>
    )
  }
}
