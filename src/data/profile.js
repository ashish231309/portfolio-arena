export const profile = {
  name: 'Ashish Kumar',
  initials: 'AK',
  role: 'Computer Science & Engineering Student',
  headline: 'Computer Science Student building with Software, Web & Generative AI',
  location: 'Kanpur, India',
  coordinates: '26.449°N, 80.339°E',
  // The contact address deliberately does not live in the bundle (T20): the form
  // posts to a FormSubmit alias and the socials below are the public contact routes.
  status: 'B.Tech CSE · 7th semester / final year · graduating 2027',
  social: {
    github: 'https://github.com/ashish1492a',
    linkedin: 'https://linkedin.com/in/ashish-kumar-52507641b',
    instagram: 'https://www.instagram.com/ashish1492a',
  },
  resume: '/resume.pdf',
  currentlyExploring: [
    'Generative AI',
    'API Integration',
    'Web Hosting & Deployment',
    'Docker & Containerization',
    'Linux',
    'Emerging Technologies',
  ],
  aboutParagraphs: [
    'I am a Computer Science & Engineering student working full stack — the interface, the logic and the data — with Generative AI alongside. I like taking ideas from a blank file to a working interface: writing the markup, styling it properly, and wiring the behaviour myself.',
    'I enjoy building practical projects and responsive web experiences while continuously learning new technologies. Most of what I know comes from building: recreating real websites piece by piece, reading what broke, and fixing it until it behaved.',
    'Right now I am exploring Generative AI tooling, API integration, and the path from “it runs on my machine” to “it runs somewhere else” — hosting, Docker and Linux, one experiment at a time.',
  ],
  // Four facts, and no more (the hero grid is built for four). 'Base' was the one
  // this slot could lose: the hero prose above already says "a B.Tech CSE student
  // in Kanpur", and the footer carries the location too. C3 puts the expertise
  // area in the first screen instead.
  facts: [
    { label: 'Degree', value: 'B.Tech CSE · KIT, AKTU' },
    { label: 'Window', value: '2023 — 2027' },
    { label: 'Focus', value: 'Full Stack Development' },
    { label: 'Strongest language', value: 'C' },
  ],
}

export const navLinks = [
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Experience', to: '/experience' },
  { label: 'Education', to: '/education' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'Activities', to: '/achievements' },
]
