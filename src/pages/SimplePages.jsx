import Section from '../components/Section'
import PageIntro from '../components/PageIntro'
import Experience from '../sections/Experience'
import Education from '../sections/Education'
import Certifications from '../sections/Certifications'
import Achievements from '../sections/Achievements'
import Contact from '../sections/Contact'
import { usePageMeta } from '../hooks/usePageMeta'

export function ExperiencePage() {
  usePageMeta('Experience', 'Internships and Forage virtual job simulations of Ashish Kumar — clearly labelled, honestly described.')
  return (
    <Section bg="ivory" accent="coral" className="pb-0"
      intro={
        <PageIntro
          index="04"
          crumb="/experience"
          title={['Real roles,', 'honest simulations.']}
          lede="Internships where I worked with teams — and Forage job simulations, clearly labelled as practice, not employment."
          accent="coral"
        />
      }>
      <Experience bare />
    </Section>
  )
}

export function EducationPage() {
  usePageMeta('Education', 'B.Tech CSE at Kanpur Institute of Technology (AKTU), 2023–2027, plus CBSE schooling at Army Public School Kanpur.')
  return (
    <Section bg="ivory" accent="indigo" className="pb-0"
      intro={
        <PageIntro
          index="05"
          crumb="/education"
          title={['Where the', 'fundamentals come from.']}
          lede="B.Tech CSE at Kanpur Institute of Technology (AKTU) — 7th semester, graduating 2027 — and CBSE schooling before it."
        />
      }>
      <Education bare />
    </Section>
  )
}

export function CertificationsPage() {
  usePageMeta('Certifications', 'Public digital credentials: Oracle Agentic AI, Google Gemini (Student & Educator), Digital Productivity with AI, plus Forage simulations.')
  return (
    <Section bg="ivory" accent="lime" className="pb-0"
      intro={
        <PageIntro
          index="06"
          crumb="/certifications"
          title={['Credentials that', 'back the curiosity.']}
          lede="Every certificate below is public and viewable. Physical certificates stay offline, listed as text under Activities."
          accent="lime"
        />
      }>
      <Certifications bare />
    </Section>
  )
}

export function AchievementsPage() {
  usePageMeta('Activities', 'NCC service, sports participation and school coordination activities of Ashish Kumar — stated exactly as they are.')
  return (
    <Section bg="ivory" accent="lime" className="pb-0"
      intro={
        <PageIntro
          index="07"
          crumb="/achievements"
          title={['Discipline, sport', '& coordination.']}
          lede="Three years of NCC, inter-school and college sport, and the quiet leadership of running a tournament bracket."
          accent="lime"
        />
      }>
      <Achievements bare />
    </Section>
  )
}

export function ContactPage() {
  usePageMeta('Contact', 'Socials and a working contact form — reach Ashish Kumar for internships, collaborations or conversations.')
  return (
    <Section bg="ivory" accent="lime" className="pb-0"
      intro={
        <PageIntro
          index="08"
          crumb="/contact"
          title={['Say hello —', 'I reply fast.']}
          lede="Internships, collaborations, study groups or a good argument about CSS: the inbox is open."
          accent="lime"
        />
      }>
      <Contact bare />
    </Section>
  )
}
