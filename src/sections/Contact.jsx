import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, Loader2, CheckCircle2, AlertCircle, Mail, Send } from 'lucide-react'
import Section, { container, sectionPadding } from '../components/Section'
import SectionHead from '../components/SectionHead'
import { Fade, WordReveal } from '../components/Reveal'
import Magnetic from '../components/Magnetic'
import { profile } from '../data/profile'
import { EASE } from '../lib/motion'

const FORM_ENDPOINT = 'https://formsubmit.co/ajax/ashish1492a@gmail.com'

const initialForm = { name: '', email: '', subject: '', message: '', honey: '' }

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Please tell me your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = 'That email doesn’t look right.'
  if (!values.subject.trim()) errors.subject = 'A short subject helps.'
  if (values.message.trim().length < 12) errors.message = 'A little more detail, please (12+ characters).'
  return errors
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-[10px] tracking-[0.22em] uppercase text-fog">
        {label}
      </label>
      {children}
      <p id={`${id}-error`} role="alert" className={`mt-1.5 text-xs text-coral ${error ? '' : 'hidden'}`}>
        {error || ''}
      </p>
    </div>
  )
}

const inputCls =
  'mt-2 w-full bg-transparent border-b border-ivory/20 py-2.5 text-[15px] text-ivory placeholder:text-fog/50 focus:border-cyan focus:outline-none transition-colors'

function ContactForm() {
  const [values, setValues] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [state, setState] = useState('idle') // idle | sending | success | error

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (values.honey) {
      setState('success') // bot trap: pretend success
      return
    }
    setState('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          _subject: `Portfolio — ${values.subject}`,
          _template: 'table',
          _honey: values.honey,
        }),
      })
      if (!res.ok) throw new Error(`form service responded ${res.status}`)
      setState('success')
      setValues(initialForm)
    } catch {
      setState('error')
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-lg2 border border-ivory/10 bg-[#111A2C] p-[clamp(1.4rem,3vw,2.4rem)]">
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
        <Field id="cf-name" label="Name" error={errors.name}>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={set('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby="cf-name-error"
            className={inputCls}
          />
        </Field>
        <Field id="cf-email" label="Email" error={errors.email}>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@domain.com"
            value={values.email}
            onChange={set('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby="cf-email-error"
            className={inputCls}
          />
        </Field>
      </div>
      <div className="mt-5">
        <Field id="cf-subject" label="Subject" error={errors.subject}>
          <input
            id="cf-subject"
            name="subject"
            type="text"
            placeholder="Internship, project, or just hello"
            value={values.subject}
            onChange={set('subject')}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby="cf-subject-error"
            className={inputCls}
          />
        </Field>
      </div>
      <div className="mt-5">
        <Field id="cf-message" label="Message" error={errors.message}>
          <textarea
            id="cf-message"
            name="message"
            rows={5}
            placeholder="What should we build or talk about?"
            value={values.message}
            onChange={set('message')}
            aria-invalid={Boolean(errors.message)}
            aria-describedby="cf-message-error"
            className={`${inputCls} resize-y`}
          />
        </Field>
      </div>
      {/* honeypot spam protection */}
      <input
        type="text"
        name="_honey"
        value={values.honey}
        onChange={set('honey')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Magnetic strength={0.22} max={6}>
          <button
            type="submit"
            disabled={state === 'sending'}
            data-cursor="button"
            className="inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 font-body font-bold text-sm text-ink transition-all duration-300 hover:bg-[#b8e356] disabled:opacity-60"
          >
            {state === 'sending' ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Sending…
              </>
            ) : (
              <>
                <Send size={15} aria-hidden="true" /> Send message
              </>
            )}
          </button>
        </Magnetic>
        <p aria-live="polite" className="text-sm">
          {state === 'success' && (
            <span className="inline-flex items-center gap-2 text-lime">
              <CheckCircle2 size={15} aria-hidden="true" /> Message sent — I’ll reply soon.
            </span>
          )}
          {state === 'error' && (
            <span className="inline-flex items-center gap-2 text-coral">
              <AlertCircle size={15} aria-hidden="true" /> Something broke — email me directly below.
            </span>
          )}
        </p>
      </div>
    </form>
  )
}

export default function Contact({ bare = false }) {
  const socials = [
    { label: 'GitHub', href: profile.social.github, handle: '@ashish1492a' },
    { label: 'LinkedIn', href: profile.social.linkedin, handle: 'ashish-kumar-52507641b' },
    { label: 'Instagram', href: profile.social.instagram, handle: '@ashish1492a' },
  ]

  return (
    <Section id="contact" bg="deeper" accent="lime" className={`${sectionPadding} relative`}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 left-0 right-0 text-center font-display font-bold tracking-mega text-[clamp(4rem,15vw,12rem)] text-ivory/[0.04] leading-none select-none"
      >
        LET’S TALK
      </span>
      <div className={container}>
        {!bare && (
          <SectionHead dark index="08" title={['Let’s build something', 'meaningful.']} note="Contact" accent="lime" id="contact-title" />
        )}
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <WordReveal
              text="Open to internships, collaborations, study projects and good conversations about the web."
              className="font-display text-[clamp(1.25rem,2.2vw,1.7rem)] leading-snug tracking-tight text-ivory"
              highlight={['internships', 'collaborations', 'web.']}
            />
            <Fade delay={0.2} y={16}>
              <Magnetic strength={0.25} max={8}>
                <a
                  href={`mailto:${profile.email}`}
                  data-cursor="contact"
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-lime px-7 py-4 font-mono text-[13px] tracking-[0.1em] text-ink transition-colors duration-300 hover:bg-[#b8e356]"
                >
                  <Mail size={16} aria-hidden="true" /> {profile.email}
                </a>
              </Magnetic>
            </Fade>
            <ul className="mt-10 divide-y divide-ivory/10 border-y border-ivory/10">
              {socials.map((s, i) => (
                <motion.li key={s.label} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                    className="group flex items-center justify-between py-4"
                  >
                    <span className="font-display font-bold text-lg text-ivory transition-transform duration-300 group-hover:translate-x-1.5">
                      {s.label}
                    </span>
                    <span className="flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-fog">
                      {s.handle}
                      <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-cyan" aria-hidden="true" />
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <Fade y={26} delay={0.1}>
              <ContactForm />
            </Fade>
          </div>
        </div>
      </div>
    </Section>
  )
}
