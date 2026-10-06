import About from '../sections/About'
import Skills from '../sections/Skills'
import ProjectsHome from '../sections/ProjectsHome'
import Experience from '../sections/Experience'
import Education from '../sections/Education'
import Certifications from '../sections/Certifications'
import Achievements from '../sections/Achievements'
import Contact from '../sections/Contact'

/**
 * Everything on the home page below the hero + marquee, in one lazily-loaded
 * chunk (T31).
 *
 * Why this exists: the home page is the only place that composes all eight
 * sections, so importing them eagerly made the entry chunk carry the whole site
 * — route splitting alone could not move the needle, because every route's
 * sections were already sitting in the eager bundle. Isolating them here lets
 * the hero paint from a much smaller entry chunk while this chunk streams in
 * immediately after (it is requested as soon as the app module runs, well before
 * the visitor can scroll past the hero).
 *
 * Rendering order, props and markup are unchanged.
 */
export default function HomeSections() {
  return (
    <>
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
