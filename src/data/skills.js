export const skillGroups = [
  {
    id: 'fullstack',
    index: '01',
    title: 'Full Stack Development',
    note: 'End-to-end: interface, logic and data',
    accent: 'indigo',
    // C3 (user correction): Full Stack Development is presented as an expertise
    // area, not as something being learned. Every technology here already appears
    // in another group below — nothing new is invented, and no backend framework
    // is named. The `context` strings are copied verbatim from those groups so
    // this group introduces no claim that the rest of the data does not already
    // make. (The dashed "Currently exploring" group below is the learning-framed
    // one; this group is deliberately not dashed.)
    skills: [
      { name: 'HTML', context: 'semantic structure, all projects' },
      { name: 'CSS', context: 'layouts, responsive design' },
      { name: 'JavaScript', context: 'DOM, interaction, logic' },
      { name: 'React', context: 'component-driven projects' },
      { name: 'Tailwind CSS', context: 'design-system styling' },
      { name: 'Vite', context: 'project tooling & dev server' },
      { name: 'Python', context: 'coursework & assignments' },
      { name: 'Java', context: 'coursework & job simulation' },
      { name: 'SQL', context: 'coursework & simulation tasks' },
      { name: 'DBMS', context: 'coursework' },
      { name: 'RDBMS', context: 'coursework' },
      { name: 'Git', context: 'clone · commit · push · pull · repo workflows' },
      { name: 'GitHub', context: 'public repositories' },
    ],
  },
  {
    id: 'languages',
    index: '02',
    title: 'Programming',
    note: 'Strongest: C',
    accent: 'indigo',
    skills: [
      { name: 'C', context: 'most proficient — coursework & problem solving' },
      { name: 'C++', context: 'coursework, DSA practice' },
      { name: 'Python', context: 'coursework & assignments' },
      { name: 'Java', context: 'coursework & job simulation' },
      { name: 'JavaScript', context: 'projects & web work' },
    ],
  },
  {
    id: 'frontend',
    index: '03',
    title: 'Frontend / Web',
    note: 'Project-tested',
    accent: 'cyan',
    skills: [
      { name: 'HTML', context: 'semantic structure, all projects' },
      { name: 'CSS', context: 'layouts, responsive design' },
      { name: 'JavaScript', context: 'DOM, interaction, logic' },
      { name: 'React', context: 'component-driven projects' },
      { name: 'Tailwind CSS', context: 'design-system styling' },
      { name: 'Vite', context: 'project tooling & dev server' },
    ],
  },
  {
    id: 'data',
    index: '04',
    title: 'Data & Databases',
    note: 'Academic + simulation',
    accent: 'cobalt',
    skills: [
      { name: 'SQL', context: 'coursework & simulation tasks' },
      { name: 'DBMS', context: 'coursework' },
      { name: 'RDBMS', context: 'coursework' },
    ],
  },
  {
    id: 'ai',
    index: '05',
    title: 'Generative AI',
    note: 'Certified foundations',
    accent: 'coral',
    skills: [
      { name: 'Generative AI', context: 'certified fundamentals, daily tooling' },
      { name: 'LangChain', context: 'learning & experiments' },
      { name: 'LLM concepts', context: 'prompting, responsible AI' },
    ],
  },
  {
    id: 'tools',
    index: '06',
    title: 'Tools & Workflow',
    note: 'Comfortable basics',
    accent: 'lime',
    skills: [
      { name: 'Git', context: 'clone · commit · push · pull · repo workflows' },
      { name: 'GitHub', context: 'public repositories' },
    ],
  },
  {
    id: 'exploring',
    index: '07',
    title: 'Currently exploring',
    note: 'Learning now — not yet claimed as expertise',
    accent: 'lime',
    dashed: true,
    skills: [
      { name: 'Linux', context: 'exploring' },
      { name: 'Docker & containerization', context: 'starting out' },
      { name: 'Web hosting & deployment', context: 'learning' },
      { name: 'API integration', context: 'learning' },
      { name: 'Emerging technologies', context: 'curiosity-driven' },
    ],
  },
]

export const coursework = [
  'Data Structures',
  'Object-Oriented Programming',
  'Web Technology',
  'Database Management Systems',
  'Design & Analysis of Algorithms',
  'Operating Systems',
  'Computer Networks',
  'Machine Learning',
  'Software Engineering',
  'Computer Organization',
]
