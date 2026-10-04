import Hero from '../sections/Hero'
import About from '../sections/About'
import Skills from '../sections/Skills'
import ProjectsHome from '../sections/ProjectsHome'
import Experience from '../sections/Experience'
import Education from '../sections/Education'
import Certifications from '../sections/Certifications'
import Achievements from '../sections/Achievements'
import Contact from '../sections/Contact'
import Marquee from '../components/Marquee'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Home() {
  usePageMeta(
    null,
    'Portfolio of Ashish Kumar — Computer Science student in Kanpur building with software, web & Generative AI.',
  )
  return (
    <>
      <Hero />
      <div className="bg-ink text-ivory dark-zone relative z-10 -my-2">
        <Marquee />
      </div>
      <About />
      <Skills />
      <ProjectsHome />
      <Experience />
      <Education />
      <Certifications />
      <Achievements />
      <Contact />
    </>
  )
}
