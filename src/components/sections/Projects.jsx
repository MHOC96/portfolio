import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import TextReveal from '../ui/TextReveal';
import HorizontalScroll from '../ui/HorizontalScroll';
import ScrollPanel from '../ui/ScrollPanel';
import NodeDiagram from '../ui/NodeDiagram';
import { PROJECTS_META } from '../../data/projectsMeta';
import { PROFILE } from '../../data/profile';

const PROJECT_DIAGRAMS = [
  {
    diagramNodes: [
      {
        id: 'ui',
        label: 'Web UI / CLI',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
        col: 1, row: 1,
        desc: 'Research query in, citations out'
      },
      {
        id: 'api',
        label: 'FastAPI + Agent',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
        col: 2, row: 1,
        desc: 'REST API + Groq orchestrator'
      },
      {
        id: 'rag',
        label: 'Hybrid RAG',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
        col: 2, row: 2,
        desc: 'Retrieve, rerank, discover & index papers'
      },
      {
        id: 'output',
        label: 'Verified Output',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
        col: 3, row: 2,
        desc: 'Evidence-checked APA / MLA / IEEE refs'
      },
    ],
    diagramLines: [
      { from: 'ui', to: 'api', animated: true },
      { from: 'api', to: 'rag', animated: true },
      { from: 'rag', to: 'output', animated: true },
    ],
  },
  {
    diagramNodes: [
      {
        id: 'client',
        label: 'Vite React TS',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
        col: 1, row: 1,
        desc: 'Vite-React-TS client hosted on Vercel'
      },
      {
        id: 'api',
        label: 'FastAPI API',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
        col: 2, row: 1,
        desc: 'Vercel serverless API + JWT auth guard'
      },
      {
        id: 'gemini',
        label: 'Gemini AI',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"></path><path d="M6 10h12v2a6 6 0 0 1-12 0v-2z"></path><path d="M8 18h8v4H8z"></path></svg>,
        col: 3, row: 1,
        desc: 'PDF routine extraction to structured JSON'
      },
      {
        id: 'db',
        label: 'Supabase DB',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
        col: 2, row: 2,
        desc: 'PostgreSQL via Supavisor pooler'
      },
    ],
    diagramLines: [
      { from: 'client', to: 'api', animated: true },
      { from: 'api', to: 'gemini', animated: true },
      { from: 'api', to: 'db', animated: true },
    ]
  },
  {
    diagramNodes: [
      {
        id: 'api',
        label: 'Flask API',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
        col: 1, row: 1,
        desc: 'POST /process-pdf upload & job orchestration'
      },
      {
        id: 'pipeline',
        label: 'CV Pipeline',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
        col: 2, row: 1,
        desc: 'PyMuPDF render + OpenCV deskew & CLAHE'
      },
      {
        id: 'gemini',
        label: 'Gemini Vision',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
        col: 3, row: 1,
        desc: 'Single-pass MCQ extraction + bounding boxes'
      },
      {
        id: 'storage',
        label: 'R2 + JSON',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-6V4"></path><path d="M14 4l8 8-8 8"></path><path d="M4 20V4h6"></path></svg>,
        col: 2, row: 2,
        desc: 'Crop visuals, upload to R2, return JSON payload'
      },
    ],
    diagramLines: [
      { from: 'api', to: 'pipeline', animated: true },
      { from: 'pipeline', to: 'gemini', animated: true },
      { from: 'gemini', to: 'storage', animated: true },
      { from: 'pipeline', to: 'storage', animated: true },
    ]
  },
  {
    diagramNodes: [
      {
        id: 'api',
        label: 'Django REST',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
        col: 1, row: 1,
        desc: 'REST API gateway, auth & RBAC middleware'
      },
      {
        id: 'engine',
        label: 'Election Engine',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>,
        col: 2, row: 1,
        desc: 'State machine, atomic ballots & double-vote prevention'
      },
      {
        id: 'analytics',
        label: 'Live Analytics',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>,
        col: 3, row: 1,
        desc: 'Turnout stats via materialized views & Redis cache'
      },
      {
        id: 'data',
        label: 'PostgreSQL',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
        col: 2, row: 2,
        desc: 'Members, votes, candidates + Cloudinary media'
      },
    ],
    diagramLines: [
      { from: 'api', to: 'engine', animated: true },
      { from: 'engine', to: 'analytics', animated: true },
      { from: 'engine', to: 'data', animated: true },
      { from: 'analytics', to: 'data', animated: true },
    ]
  }
];

const projects = PROJECTS_META.map((meta, index) => ({
  ...meta,
  ...PROJECT_DIAGRAMS[index],
}));

/* Total panels = projects + 1 CTA panel */
const PANEL_COUNT = projects.length + 1;

const ProjectPanel = ({ project, idx, showDiagram = false }) => (
  <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-4 sm:px-6 md:px-16 lg:px-24 py-6 md:py-8 max-w-full overflow-x-clip">
    {/* Image Side */}
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.35, 1] }}
      className="w-full max-w-xl md:max-w-none md:w-[45%] lg:w-1/2 relative shrink-0"
    >
      <div
        className="group border-4 border-border-strong p-1 shadow-[6px_6px_0px_var(--color-border-strong)] bg-black overflow-hidden transition-shadow duration-300 hover:shadow-[8px_8px_0px_var(--color-red)]"
        data-cursor-text="EXPLORE"
      >
        <div className="aspect-[3/2] w-full flex items-center justify-center bg-black">
          <img
            src={project.image}
            alt={project.title}
            loading={idx === 0 ? 'eager' : 'lazy'}
            fetchPriority={idx === 0 ? 'high' : 'auto'}
            decoding="async"
            className="w-full h-full max-w-full grayscale group-hover:grayscale-0 transition-all duration-700 object-contain opacity-95 group-hover:opacity-100 [image-rendering:auto]"
          />
        </div>
      </div>

      {/* Floating index badge */}
      <div
        className="absolute top-2 left-2 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-mono text-xs sm:text-sm font-bold border-2 border-border-strong"
        style={{ backgroundColor: 'var(--color-red)', color: '#fff' }}
      >
        {String(idx + 1).padStart(2, '0')}
      </div>
    </motion.div>

    {/* Content Side */}
    <motion.div
      initial={{ opacity: 0, x: showDiagram ? 60 : 0 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 1, 0.35, 1] }}
      className="w-full md:w-[55%] lg:w-1/2 flex flex-col gap-4 md:gap-5 min-w-0"
    >
      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-black uppercase tracking-tight text-accent leading-[1.08] break-words">
        {project.title}
      </h3>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2">
        {project.tech.map((tech, i) => (
          <span
            key={i}
            className="text-[10px] py-1 px-2 border border-red font-mono uppercase tracking-[0.15em] text-red bg-red/10"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-4">
        {project.githubLink && project.githubLink !== '#' && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-mono text-muted hover:text-accent transition-colors border-b border-border-strong hover:border-accent pb-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.581 9.522 21.276 9.522 21.008C9.522 20.766 9.513 20.011 9.508 19.172C6.726 19.791 6.143 17.898 6.143 17.898C5.699 16.754 5.064 16.451 5.064 16.451C4.187 15.818 5.131 15.829 5.131 15.829C6.104 15.898 6.626 16.868 6.626 16.868C7.498 18.412 8.974 17.945 9.541 17.687C9.63 17.058 9.888 16.592 10.175 16.32C7.956 16.046 5.62 15.233 5.62 11.477C5.62 10.386 6.01 9.491 6.646 8.787C6.546 8.531 6.202 7.57 6.747 6.181C6.747 6.181 7.563 5.908 9.497 7.211C10.29 7.002 11.151 6.898 12.001 6.894C12.849 6.899 13.71 7.002 14.505 7.211C16.437 5.908 17.252 6.181 17.252 6.181C17.798 7.57 17.454 8.531 17.354 8.787C17.991 9.491 18.379 10.386 18.379 11.477C18.379 15.246 16.038 16.044 13.813 16.313C14.172 16.647 14.492 17.308 14.492 18.313C14.492 19.754 14.479 20.674 14.479 21.007C14.479 21.278 14.659 21.586 15.167 21.49C19.137 20.162 22 16.418 22 12C22 6.477 17.523 2 12 2Z" />
            </svg>
            Source
          </a>
        )}
        {project.liveLink && project.liveLink !== '#' && (
          <a
            href={project.liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-mono text-muted hover:text-red transition-colors border-b border-border-strong hover:border-red pb-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Live Demo
          </a>
        )}
      </div>

      {showDiagram && (
        <div className="hidden md:block shrink-0">
          <h4 className="text-xs font-mono text-red uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red inline-block"></span>
            System Architecture
          </h4>
          <NodeDiagram nodes={project.diagramNodes} lines={project.diagramLines} />
        </div>
      )}
    </motion.div>
  </div>
);

const ProjectsCta = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.8, ease: [0.25, 1, 0.35, 1] }}
    className="flex flex-col items-center justify-center text-center gap-8 px-4 sm:px-6 max-w-full"
  >
    <div className="w-20 h-20 border-2 border-red flex items-center justify-center mb-2">
      <span className="text-red text-4xl font-mono">+</span>
    </div>

    <h3 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-accent leading-none">
      More Projects<br />Coming Soon
    </h3>

    <p className="text-muted font-mono text-sm max-w-md">
      I'm always building. Check back for new backend systems, security tools, and full-stack experiments.
    </p>

    <a
      href={PROFILE.contact.github}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-text="GITHUB"
      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-red text-red font-mono text-sm uppercase tracking-widest hover:bg-red hover:text-white transition-all duration-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.581 9.522 21.276 9.522 21.008C9.522 20.766 9.513 20.011 9.508 19.172C6.726 19.791 6.143 17.898 6.143 17.898C5.699 16.754 5.064 16.451 5.064 16.451C4.187 15.818 5.131 15.829 5.131 15.829C6.104 15.898 6.626 16.868 6.626 16.868C7.498 18.412 8.974 17.945 9.541 17.687C9.63 17.058 9.888 16.592 10.175 16.32C7.956 16.046 5.62 15.233 5.62 11.477C5.62 10.386 6.01 9.491 6.646 8.787C6.546 8.531 6.202 7.57 6.747 6.181C6.747 6.181 7.563 5.908 9.497 7.211C10.29 7.002 11.151 6.898 12.001 6.894C12.849 6.899 13.71 7.002 14.505 7.211C16.437 5.908 17.252 6.181 17.252 6.181C17.798 7.57 17.454 8.531 17.354 8.787C17.991 9.491 18.379 10.386 18.379 11.477C18.379 15.246 16.038 16.044 13.813 16.313C14.172 16.647 14.492 17.308 14.492 18.313C14.492 19.754 14.479 20.674 14.479 21.007C14.479 21.278 14.659 21.586 15.167 21.49C19.137 20.162 22 16.418 22 12C22 6.477 17.523 2 12 2Z" />
      </svg>
      View All on GitHub
    </a>
  </motion.div>
);

const Projects = () => {
  return (
    <section id="projects" className="relative overflow-x-clip">
      {/* Section Header — sits above the horizontal scroll area */}
      <div className="section-padding pb-0 bg-transparent relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-16"
          >
            <ScrollReveal delay={0}>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-8 h-[1px]" style={{ backgroundColor: 'var(--color-red)', opacity: 0.7 }}></div>
                <h4 className="font-mono text-sm text-muted tracking-widest uppercase"><span className="text-red">// 02</span> &mdash; PORTFOLIO</h4>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-accent">
                <TextReveal text="FEATURED PROJECTS" delay={0.2} />
              </h2>
              <div className="w-16 h-[4px] mb-6" style={{ backgroundColor: 'var(--color-red)' }} />
              <p className="text-muted max-w-2xl text-lg hidden md:block">
                Scroll down to explore — each project slides in horizontally.
              </p>
              <p className="text-muted max-w-2xl text-sm md:hidden">
                A selection of backend systems, AI tools, and full-stack builds.
              </p>
            </ScrollReveal>
          </motion.div>
        </div>
      </div>

      {/* Mobile: vertical stack (no horizontal scroll) */}
      <div className="md:hidden container-custom pb-16 space-y-16 overflow-x-clip">
        {projects.map((project, idx) => (
          <div key={idx} className="w-full max-w-full">
            <ProjectPanel project={project} idx={idx} />
          </div>
        ))}
        <ProjectsCta />
      </div>

      {/* Desktop: horizontal scroll */}
      <div className="hidden md:block">
      <HorizontalScroll panelCount={PANEL_COUNT}>
        {projects.map((project, idx) => (
          <ScrollPanel key={idx}>
            <ProjectPanel project={project} idx={idx} showDiagram />
          </ScrollPanel>
        ))}

        {/* CTA / "More Coming" Panel */}
        <ScrollPanel className="bg-transparent">
          <ProjectsCta />
        </ScrollPanel>
      </HorizontalScroll>
      </div>
    </section>
  );
};

export default Projects;