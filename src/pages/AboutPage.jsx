import Section from '../components/Section'
import PageIntro from '../components/PageIntro'
import About from '../sections/About'
import Marquee from '../components/Marquee'
import { usePageMeta } from '../hooks/usePageMeta'

export default function AboutPage() {
  usePageMeta('About', 'Who Ashish Kumar is: a CSE student building with software, web and Generative AI — and what he is exploring now.')
  return (
    <>
      <Section bg="ivory" accent="cyan" labelledBy="about-page-title"
        intro={
          <PageIntro
            index="01"
            crumb="/about"
            title={['Student first,', 'builder always.']}
            lede="The short version of who I am, what I study, and what I am currently teaching myself."
            accent="cyan"
            id="about-page-title"
          />
        }>
        <About bare />
      </Section>
      <div className="bg-ink text-ivory dark-zone">
        <Marquee items={['Curious', 'Consistent', 'Coding', 'Reading', 'Rebuilding']} tilt={1.2} />
      </div>
    </>
  )
}
