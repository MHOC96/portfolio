import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import StaggerReveal from '../ui/StaggerReveal';
import TextReveal from '../ui/TextReveal';
import GlitchText from '../ui/GlitchText';
import { TIMELINE } from '../../data/timeline';

const Education = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const timelineData = TIMELINE;

  return (
    <section id="education" className="section-padding bg-transparent relative">
      <TimelineStyles />
      <div className="container-custom" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <ScrollReveal delay={0}>
            <h4 className="font-mono text-sm text-muted mb-2 tracking-widest uppercase"><span className="text-red">// 04</span> &mdash; EXPERIENCE &amp; EDUCATION</h4>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-accent">
              <TextReveal text="MY JOURNEY" delay={0.2} />
            </h2>
            <div className="w-16 h-[2px]" style={{ backgroundColor: 'var(--color-red)', opacity: 0.6 }}></div>
          </ScrollReveal>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 items-start max-w-7xl mx-auto relative">
          {/* Editorial Sticky Portrait */}
          <div 
            className="w-full lg:w-5/12 shrink-0 lg:sticky lg:top-24 h-[60vh] lg:h-[80vh] overflow-hidden border-4 border-border-strong p-2 bg-primary group shadow-[8px_8px_0px_var(--color-border-strong)] transition-all duration-500 hover:shadow-[12px_12px_0px_var(--color-red)] hover:border-red"
            data-cursor-text="OSHADHA"
          >
            <div className="w-full h-full relative overflow-hidden bg-black">
              <motion.img 
                style={{ scale }}
                src="/oshadha.png" 
                alt="Oshadha Canchana" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 opacity-90 group-hover:opacity-100" 
              />
              
              {/* Premium overlay decorations */}
              <div className="absolute inset-0 bg-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-color"></div>
              
              <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur px-3 py-1 text-[10px] font-mono border border-border-strong text-muted uppercase tracking-widest hidden md:block">
                SYS.ADMIN_OSHADHA
              </div>
              <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur px-3 py-1 text-[10px] font-mono border border-border-strong text-muted uppercase tracking-widest">
                EST. 2003
              </div>
            </div>
          </div>

          {/* Timeline Column */}
          <div className="flex-grow w-full lg:w-7/12 relative pl-4 md:pl-10">
            {/* Vertical line on the left */}
            <div className="absolute left-[29px] top-2 bottom-0 w-[1px] bg-red/10 overflow-hidden">
              <div 
                className="w-full h-1/4 bg-gradient-to-b from-transparent via-red-500 to-transparent"
                style={{ 
                  filter: 'drop-shadow(0 0 4px var(--color-red))',
                  animation: 'timeline-travel 4s linear infinite',
                }}
              />
            </div>

            <StaggerReveal staggerDelay={0.12} direction="left" className="space-y-8">
              {timelineData.map((item, i) => (
                <div
                  key={i}
                  className="relative flex gap-6 md:gap-8 min-h-[80px]"
                >
                  {/* Tactical Node (Crosshair style) */}
                  <div className="relative z-10 flex-shrink-0 mt-1.5 ml-[21px]">
                    <div className="relative flex items-center justify-center w-4 h-4">
                      {/* Crosshair Lines */}
                      <div className="absolute w-full h-[1px] bg-red/40"></div>
                      <div className="absolute h-full w-[1px] bg-red/40"></div>
                      {/* Inner Square */}
                      <div 
                        className={`w-2 h-2 bg-primary border ${item.type === 'education' ? 'border-blue-400' :
                          item.type === 'project' ? 'border-green-400' :
                            item.type === 'achievement' ? 'border-amber-400' :
                              item.type === 'certification' ? 'border-red-500' : 'border-purple-400'
                          }`}
                        style={{ animation: 'node-pulse 2s ease-in-out infinite' }}
                      />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-grow pt-0 pb-6 relative" style={{ borderBottom: '2px solid var(--color-border-strong)' }}>
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-light uppercase tracking-tight">{item.title}</h3>
                      <span className={`inline-block px-2 py-1 text-[10px] font-mono border-2 font-bold uppercase w-fit whitespace-nowrap ${item.type === 'education' ? 'text-blue-400 border-blue-400 bg-blue-400/5' :
                        item.type === 'project' ? 'text-green-400 border-green-400 bg-green-400/5' :
                          item.type === 'achievement' ? 'text-amber-400 border-amber-400 bg-amber-400/5' :
                            item.type === 'certification' ? 'text-red-500 border-red-500 bg-red-500/5' : 'text-purple-400 border-purple-400 bg-purple-400/5'
                        }`} style={{ borderRadius: '0px', boxShadow: '2px 2px 0px currentColor' }}>
                        {item.year}
                      </span>
                    </div>

                    <h4 className="text-sm font-mono text-muted mb-3 font-semibold uppercase">{item.subtitle}</h4>
                    <p className="text-muted text-sm leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-mono text-red hover:text-accent transition-colors border-b border-red/40 hover:border-accent pb-0.5"
                      >
                        {item.linkLabel || "Learn more"}
                        <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </StaggerReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

// CSS keyframes injected once
const TimelineStyles = () => (
  <style>{`
    @keyframes timeline-travel {
      0% { transform: translateY(-100%); opacity: 0.1; }
      50% { opacity: 1; }
      100% { transform: translateY(400%); opacity: 0.1; }
    }
    @keyframes node-pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.2); opacity: 1; }
    }
  `}</style>
);

export default Education;