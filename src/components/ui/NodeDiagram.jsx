import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const NodeDiagram = ({ nodes = [], lines = [] }) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const [activeNode, setActiveNode] = useState(null);

  // Fallback data if none provided
  const diagramNodes = nodes.length > 0 ? nodes : [
    { id: 'client', label: 'Client App', icon: '💻', col: 1, row: 1 },
    { id: 'api', label: 'API Gateway (Spring)', icon: '⚡', col: 2, row: 1 },
    { id: 'auth', label: 'JWT Auth', icon: '🔒', col: 3, row: 1 },
    { id: 'db', label: 'Database (MySQL)', icon: '💾', col: 3, row: 2 },
  ];

  const diagramLines = lines.length > 0 ? lines : [
    { from: 'client', to: 'api' },
    { from: 'api', to: 'auth' },
    { from: 'api', to: 'db' },
  ];

  // Helper to find node coordinates (rough estimation for SVG drawing)
  const getNodePos = (id) => {
    const node = diagramNodes.find(n => n.id === id);
    if (!node) return { x: 0, y: 0 };
    // Assuming a 3-column, 2-row grid system layout
    const x = (node.col - 1) * 150 + 75;
    const y = (node.row - 1) * 100 + 50;
    return { x, y };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 15 }
    }
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 0.5,
      transition: { duration: 1.5, ease: 'easeInOut' }
    }
  };

  return (
    <div className="relative w-full p-4 bg-primary/50 border border-border-strong/30 rounded-sm shadow-inner" ref={containerRef}>
      <motion.div 
        className="relative min-h-[220px] w-full max-w-[500px] mx-auto flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '220px' }}>
          {diagramLines.map((line, i) => {
            const start = getNodePos(line.from);
            const end = getNodePos(line.to);
            const isActive = activeNode === line.from || activeNode === line.to;
            
            return (
              <motion.line
                key={i}
                x1={`${(start.x / 450) * 100}%`}
                y1={start.y}
                x2={`${(end.x / 450) * 100}%`}
                y2={end.y}
                stroke={isActive ? "var(--color-accent)" : "var(--color-red)"}
                strokeWidth={isActive ? "3" : "2"}
                strokeDasharray="4 4"
                variants={pathVariants}
                animate={isActive ? { strokeDashoffset: [0, -20] } : {}}
                transition={isActive ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              />
            );
          })}
        </svg>

        {/* Nodes Grid */}
        <div className="relative z-10 w-full h-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 100px)', gap: '1rem' }}>
          {diagramNodes.map((node) => {
            const isHovered = activeNode === node.id;
            return (
              <div
                key={node.id}
                className="relative"
                style={{
                  gridColumn: node.col,
                  gridRow: node.row,
                  height: 'fit-content',
                  margin: 'auto'
                }}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
              >
                <motion.div
                  variants={nodeVariants}
                  className="flex flex-col items-center justify-center p-3 bg-black border-2 cursor-pointer transition-all duration-300 min-w-[88px]"
                  style={{
                    borderColor: isHovered ? 'var(--color-accent)' : 'var(--color-border-strong)',
                    boxShadow: isHovered ? '4px 4px 0px var(--color-accent)' : '2px 2px 0px var(--color-red)',
                    transform: isHovered ? 'translate(-2px, -2px)' : 'none',
                    color: isHovered ? 'var(--color-accent)' : 'currentColor'
                  }}
                >
                  <span className="mb-2">{node.icon}</span>
                  <span className="text-[10px] font-mono text-center leading-tight uppercase tracking-wider" style={{ color: isHovered ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                    {node.label}
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="relative z-20 mt-3 min-h-[3rem] px-3 py-2 flex items-center justify-center border border-border-strong/30 bg-black/90">
        <AnimatePresence mode="wait">
          {activeNode ? (
            <motion.p
              key={activeNode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-mono text-accent uppercase tracking-wider text-center leading-snug"
            >
              {diagramNodes.find((node) => node.id === activeNode)?.desc}
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-mono text-muted uppercase tracking-wider text-center"
            >
              Hover a node for details
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NodeDiagram;
