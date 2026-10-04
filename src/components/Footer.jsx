import { Link } from 'react-router-dom'
import { Github, Linkedin, Instagram, Mail, ArrowUp } from 'lucide-react'
import { motion } from 'motion/react'
import { profile, navLinks } from '../data/profile'
import { container } from './Section'
import Magnetic from './Magnetic'

const socials = [
  { href: profile.social.github, label: 'GitHub', Icon: Github },
  { href: profile.social.linkedin, label: 'LinkedIn', Icon: Linkedin },
  { href: profile.social.instagram, label: 'Instagram', Icon: Instagram },
]

export default function Footer() {
  return (
    <footer className="relative bg-deeper text-ivory dark-zone overflow-hidden">
      <div className="absolute inset-0 bg-dots-dark opacity-40" aria-hidden="true" />
      <div className={`relative ${container} pt-[clamp(3.5rem,8vh,6rem)] pb-10`}>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display font-bold tracking-tighter2 text-2xl">
              Ashish Kumar<span className="text-lime">.</span>
            </p>
            <p className="mt-3 max-w-[36ch] text-fog text-sm leading-relaxed">
              Computer science student building with software, web & generative AI — in public, one commit at a time.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <Magnetic key={label} strength={0.3} max={5}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    data-cursor="link"
                    className="grid place-items-center w-10 h-10 rounded-full border border-ivory/20 text-ivory/80 transition-colors duration-300 hover:border-cyan hover:text-cyan"
                  >
                    <Icon size={16} aria-hidden="true" />
                  </a>
                </Magnetic>
              ))}
              <Magnetic strength={0.3} max={5}>
                <a
                  href={`mailto:${profile.email}`}
                  aria-label="Email Ashish"
                  data-cursor="link"
                  className="grid place-items-center w-10 h-10 rounded-full border border-ivory/20 text-ivory/80 transition-colors duration-300 hover:border-lime hover:text-lime"
                >
                  <Mail size={16} aria-hidden="true" />
                </a>
              </Magnetic>
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-fog mb-4">Navigate</p>
            <ul className="space-y-2 text-sm">
              {[{ label: 'Home', to: '/' }, ...navLinks, { label: 'Contact', to: '/contact' }].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} data-cursor="link" className="underline-slide text-ivory/75 hover:text-ivory">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-fog mb-4">Elsewhere</p>
            <ul className="space-y-2 text-sm text-ivory/75">
              <li><a data-cursor="link" className="underline-slide" href={profile.resume} download="Ashish-Kumar-Resume.pdf">Download resume</a></li>
              <li><a data-cursor="link" className="underline-slide" href={`mailto:${profile.email}`}>{profile.email}</a></li>
              <li className="pt-2 font-mono text-[11px] tracking-[0.16em] text-fog">{profile.coordinates}</li>
              <li className="font-mono text-[11px] tracking-[0.16em] text-fog">{profile.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ivory/10 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-[0.14em] uppercase text-fog">
          <span>© 2026 Ashish Kumar · Kanpur, IN</span>
          <span className="hidden md:inline">Built with React · Tailwind · Motion — no template</span>
          <motion.button
            type="button"
            data-cursor="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="grid place-items-center w-10 h-10 rounded-full border border-ivory/20 hover:border-lime hover:text-lime transition-colors"
            aria-label="Back to top"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
          >
            <ArrowUp size={16} aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
