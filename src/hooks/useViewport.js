import { useEffect, useState } from 'react'

/**
 * Viewport size without touching `window` during render.
 *
 * Starts from a safe default (so a server/prerender pass never throws and the
 * markup is deterministic) and syncs to the real values after mount, on every
 * resize and on orientation change. Callers get up-to-date numbers, so
 * pointer-driven effects keep responding after a resize instead of freezing
 * at the size that happened to exist when the component first rendered.
 */
const DEFAULT = { width: 1440, height: 900 }

const read = () => ({ width: window.innerWidth, height: window.innerHeight })

export function useViewport() {
  const [viewport, setViewport] = useState(DEFAULT)

  useEffect(() => {
    const sync = () => setViewport(read())
    sync()
    window.addEventListener('resize', sync)
    // innerWidth/innerHeight can still report the old size during the event,
    // so re-measure on the next frame as well.
    const onOrientation = () => requestAnimationFrame(sync)
    window.addEventListener('orientationchange', onOrientation)
    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', onOrientation)
    }
  }, [])

  return viewport
}

export default useViewport
