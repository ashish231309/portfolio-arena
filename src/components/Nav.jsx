import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, ArrowUpRight, FileDown } from 'lucide-react'
import { navLinks, profile } from '../data/profile'
import { useSite } from '../lib/site'
import { useLenis } from '../lib/scroll'
import Magnetic from './Magnetic'
import { EASE } from '../lib/motion'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { tone } = useSite()
  const location = useLocation()
  const lenis = useLenis()
  const firstLink = useRef(null)
  const toggleRef = useRef(null)
  const headerRef = useRef(null)
  const overlayRef = useRef(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  // Mobile menu: pause the one scroll engine, lock the body, move focus in,
  // keep Tab inside the menu, and hand focus back to the toggle on close.
  useEffect(() => {
    if (open) {
      wasOpen.current = true
      firstLink.current?.focus()
      document.body.style.overflow = 'hidden'
      lenis?.stop()
    } else {
      document.body.style.overflow = ''
      lenis?.start()
      if (wasOpen.current) {
        wasOpen.current = false
        toggleRef.current?.focus()
      }
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, lenis])

  // Keep the page behind the overlay out of the tab order and off the a11y tree.
  // (The header stays interactive because it holds the close button, which is
  // part of the focus trap below.)
  useEffect(() => {
    if (!open) return undefined
    const behind = [document.getElementById('main'), document.querySelector('footer')].filter(Boolean)
    behind.forEach((el) => {
      el.setAttribute('inert', '')
      el.setAttribute('aria-hidden', 'true')
    })
    return () =>
      behind.forEach((el) => {
        el.removeAttribute('inert')
        el.removeAttribute('aria-hidden')
      })
  }, [open])

  // Tab trap: cycles through the visible menu links, the header logo and the
  // close toggle. Nothing behind the overlay is reachable.
  useEffect(() => {
    if (!open) return undefined
    const visible = (el) => el.getClientRects().length > 0
    const focusables = () =>
      [
        ...headerRef.current.querySelectorAll('a[href], button:not([disabled])'),
        ...overlayRef.current.querySelectorAll('a[href], button:not([disabled])'),
      ].filter(visible)

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !list.includes(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !list.includes(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const dark = tone === 'dark'
  const darkUI = dark || open
  const shell = scrolled
    ? dark
      ? 'bg-deep/80 backdrop-blur-md border-b border-ivory/10'
      : 'bg-ivory/85 backdrop-blur-md border-b border-ink/10'
    : 'bg-transparent border-b border-transparent'

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:bg-indigo focus:text-ivory focus:px-4 focus:py-2 focus:rounded-sm2 font-mono text-xs tracking-widest uppercase"
      >
        Skip to content
      </a>
      <motion.header
        ref={headerRef}
        className={`fixed top-0 inset-x-0 z-[90] transition-[background-color,border-color,box-shadow] duration-500 ${shell}`}
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      >
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-[clamp(1.25rem,4vw,3rem)] transition-all duration-500 ${scrolled ? 'h-14' : 'h-16 md:h-[72px]'}`}
        >
          <Link
            to="/"
            data-cursor="link"
            className={`group flex items-baseline gap-2 font-display font-bold tracking-tighter2 text-lg ${darkUI ? 'text-ivory' : 'text-ink'}`}
          >
            <span className="grid place-items-center w-7 h-7 rounded-sm2 bg-indigo text-ivory text-[11px] font-mono tracking-normal transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-105">
              {profile.initials}
            </span>
            <span className="hidden sm:inline">
              Ashish<span className="text-indigo">.</span>Kumar
            </span>
          </Link>

          <ul className={`hidden lg:flex items-center gap-7 font-body text-[13.5px] font-semibold ${darkUI ? 'text-ivory/80' : 'text-ink/75'}`}>
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  data-cursor="link"
                  className={({ isActive }) => `underline-slide py-1 ${isActive ? 'active ' + (dark ? 'text-ivory' : 'text-ink') : ''}`}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Magnetic strength={0.22} max={6}>
              <a
                href={profile.resume}
                download="Ashish-Kumar-Resume.pdf"
                data-cursor="button"
                className={`${open ? 'hidden' : 'hidden md:inline-flex'} items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors duration-300 ${
                  darkUI ? 'border-ivory/30 text-ivory hover:bg-ivory hover:text-ink' : 'border-ink/25 text-ink hover:bg-ink hover:text-ivory'
                }`}
              >
                <FileDown size={13} aria-hidden="true" /> Resume
              </a>
            </Magnetic>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              data-cursor="button"
              className={`lg:hidden grid place-items-center w-10 h-10 rounded-sm2 border transition-colors ${
                darkUI ? 'border-ivory/30 text-ivory' : 'border-ink/20 text-ink'
              }`}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[85] bg-deep text-ivory dark-zone lg:hidden flex flex-col"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="flex-1 flex flex-col justify-center px-[clamp(1.5rem,6vw,3rem)]">
              <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-fog mb-6">Index</p>
              <ul className="space-y-1">
                {[{ label: 'Home', to: '/' }, ...navLinks, { label: 'Contact', to: '/contact' }].map((l, i) => (
                  <motion.li
                    key={l.to}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: EASE }}
                  >
                    <NavLink
                      to={l.to}
                      ref={i === 0 ? firstLink : undefined}
                      className={({ isActive }) =>
                        `flex items-center justify-between py-2 font-display font-bold tracking-tighter2 text-[clamp(2rem,9vw,3rem)] ${isActive ? 'text-cyan' : 'text-ivory'}`
                      }
                    >
                      {l.label}
                      <ArrowUpRight size={20} className="text-fog" aria-hidden="true" />
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-[clamp(1.5rem,6vw,3rem)] pb-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] tracking-[0.18em] uppercase text-fog"
            >
              <a className="underline-slide" href={profile.social.github} target="_blank" rel="noreferrer">GitHub</a>
              <a className="underline-slide" href={profile.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="underline-slide" href={profile.social.instagram} target="_blank" rel="noreferrer">Instagram</a>
              <a className="underline-slide text-lime" href={`mailto:${profile.email}`}>{profile.email}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
