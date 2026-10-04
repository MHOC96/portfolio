import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import TextReveal from '../ui/TextReveal';
import MagneticWrapper from '../ui/MagneticWrapper';
import { SKILLS_META } from '../../data/skillsMeta';
import { useTheme } from '../../context/ThemeContext';

/**
 * Resolves the effective display color for a skill based on the current theme.
 * Skills with darkColor/lightColor overrides will use the appropriate variant.
 */
const useResolvedTheme = () => {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mq.matches);
      const handler = (e) => setIsDark(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    setIsDark(theme === 'dark');
  }, [theme]);

  return isDark;
};

const resolveColor = (skill, isDark) => {
  if (isDark && skill.darkColor) return skill.darkColor;
  if (!isDark && skill.lightColor) return skill.lightColor;
  return skill.color;
};

const SkillCard = ({ skill, inMarquee = false, disableEntrance = false, isDark = true }) => {
  const effectiveColor = resolveColor(skill, isDark);
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(skill.name);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(window.innerWidth < 768 || isTouch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startScramble = () => {
    setIsHovered(true);
    if (isMobile) return;
    let iteration = 0;
    clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setDisplayText(skill.name
        .split("")
        .map((letter, index) => {
          if (index < iteration || letter === " ") {
            return skill.name[index];
          }
          const chars = "X01!@#$%^&*><{}[]";
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("")
      );

      if (iteration >= skill.name.length) {
        clearInterval(intervalRef.current);
        setDisplayText(skill.name);
      }
      iteration += 1 / 2;
    }, 25);
  };

  const stopScramble = () => {
    setIsHovered(false);
    if (isMobile) return;
    clearInterval(intervalRef.current);
    setDisplayText(skill.name);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, [skill.name]);

  const card = (
      <motion.div
        onMouseEnter={startScramble}
        onMouseLeave={stopScramble}
      className="flex items-center gap-3 bg-primary border-2 px-4 md:px-5 py-3 transition-all duration-200 cursor-default group relative overflow-hidden shrink-0 max-w-full"
        style={{
          borderColor: isHovered ? effectiveColor : 'var(--color-border-strong)',
          boxShadow: isHovered 
            ? `6px 6px 0px ${effectiveColor}` 
            : `4px 4px 0px ${effectiveColor}`,
          transform: isHovered && !isMobile ? 'translate(-2px, -2px)' : 'none',
        }}
        initial={disableEntrance ? false : { opacity: 0, scale: 0.9 }}
        animate={disableEntrance ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Subtle color glow backplate */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: effectiveColor }}
        />
        
        {/* Brand Icon SVG */}
        <svg 
          viewBox={skill.viewBox || "0 0 24 24"} 
          className="w-6 h-6 shrink-0 opacity-80 group-hover:opacity-100 transition-all duration-300"
          style={{ 
            color: isHovered ? effectiveColor : 'inherit',
            transform: isHovered && !isMobile
              ? (skill.name === "REACT" ? "scale(1.15) rotate(180deg)" : "scale(1.15) rotate(8deg)") 
              : "none"
          }}
          fill="currentColor"
        >
          {skill.icon}
        </svg>

        {/* Text Scramble / Label */}
        <span className="font-mono text-sm tracking-tight text-light/90">
          {displayText.split("").map((char, index) => (
            <span 
              key={index} 
              style={{ 
                color: isHovered && char !== skill.name[index] ? effectiveColor : undefined,
                opacity: isHovered && char !== skill.name[index] ? 0.8 : 1
              }}
              className="transition-colors duration-100"
            >
              {char}
            </span>
          ))}
        </span>
      </motion.div>
  );

  if (inMarquee) {
    return <div className="relative shrink-0">{card}</div>;
  }

  return (
    <MagneticWrapper strength={0.25} className="relative">
      {card}
    </MagneticWrapper>
  );
};

const SkillMarqueeRow = ({ skills, direction = 'left', speed = 35, rowIndex = 0, isDark = true }) => {
  const track = [...skills, ...skills];
  const directionClass = direction === 'right' ? 'skill-marquee-track--right' : 'skill-marquee-track--left';

  return (
    <div className="skill-marquee-row relative w-full overflow-hidden py-2">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-24"
        style={{ background: 'linear-gradient(to right, var(--color-primary), transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-24"
        style={{ background: 'linear-gradient(to left, var(--color-primary), transparent)' }}
      />

      <div
        className={`skill-marquee-track ${directionClass}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {track.map((skill, i) => (
          <SkillCard key={`${skill.name}-${rowIndex}-${i}`} skill={skill} inMarquee isDark={isDark} />
        ))}
      </div>
    </div>
  );
};

const getSkillRows = (skills) => {
  if (skills.length <= 5) return [skills];

  const rowCount = skills.length <= 10 ? 2 : 3;
  const rows = Array.from({ length: rowCount }, () => []);

  skills.forEach((skill, index) => {
    rows[index % rowCount].push(skill);
  });

  return rows.filter((row) => row.length > 0);
};

const SKILLS_DATA = [
  // Languages
  { name: "PYTHON", color: "#3776ab", level: 4, category: "LANGUAGE", status: "ADVANCED", group: "LANGUAGE", icon: <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" /> },
  { name: "JAVA", color: "#e76f51", level: 3, category: "LANGUAGE", status: "INTERMEDIATE", group: "LANGUAGE", viewBox: "0 0 32 32", icon: <path d="M 17.625 3 C 19.027344 6.308594 12.597656 8.335938 12 11.09375 C 11.453125 13.625 15.808594 16.59375 15.8125 16.59375 C 15.148438 15.546875 14.664063 14.664063 14 13.03125 C 12.875 10.273438 20.855469 7.785156 17.625 3 Z M 21.875 7.59375 C 21.875 7.59375 16.253906 7.949219 15.96875 11.625 C 15.839844 13.261719 17.453125 14.121094 17.5 15.3125 C 17.539063 16.285156 16.53125 17.09375 16.53125 17.09375 C 16.53125 17.09375 18.339844 16.765625 18.90625 15.28125 C 19.53125 13.632813 17.6875 12.507813 17.875 11.1875 C 18.054688 9.925781 21.875 7.59375 21.875 7.59375 Z M 23.25 16.0625 C 22.660156 16.035156 21.996094 16.253906 21.40625 16.6875 C 22.570313 16.429688 23.5625 17.160156 23.5625 18 C 23.5625 19.882813 20.875 21.65625 20.875 21.65625 C 20.875 21.65625 25.03125 21.191406 25.03125 18.09375 C 25.03125 16.816406 24.230469 16.109375 23.25 16.0625 Z M 12.21875 16.09375 C 10.769531 16.144531 7.875 16.382813 7.875 17.5 C 7.875 19.054688 14.617188 19.175781 19.4375 18.21875 C 19.4375 18.21875 20.75 17.304688 21.09375 16.96875 C 17.933594 17.625 10.71875 17.726563 10.71875 17.15625 C 10.71875 16.632813 13.03125 16.09375 13.03125 16.09375 C 13.03125 16.09375 12.703125 16.078125 12.21875 16.09375 Z M 11.78125 18.96875 C 10.988281 18.96875 9.8125 19.585938 9.8125 20.1875 C 9.8125 21.398438 15.78125 22.328125 20.1875 20.5625 L 18.65625 19.625 C 15.667969 20.601563 10.148438 20.277344 11.78125 18.96875 Z M 12.53125 21.6875 C 11.449219 21.6875 10.75 22.371094 10.75 22.875 C 10.75 24.425781 17.214844 24.578125 19.78125 23 L 18.15625 21.9375 C 16.242188 22.761719 11.425781 22.882813 12.53125 21.6875 Z M 8.90625 23.09375 C 7.140625 23.058594 6 23.859375 6 24.53125 C 6 28.105469 24.09375 27.933594 24.09375 24.28125 C 24.09375 23.675781 23.378906 23.386719 23.125 23.25 C 24.601563 26.742188 8.34375 26.46875 8.34375 24.40625 C 8.34375 23.9375 9.546875 23.46875 10.65625 23.6875 L 9.71875 23.15625 C 9.441406 23.113281 9.160156 23.097656 8.90625 23.09375 Z M 26 25.5 C 23.25 28.160156 16.289063 29.113281 9.28125 27.46875 C 16.289063 30.398438 25.964844 28.769531 26 25.5 Z" /> },
  { name: "C#", color: "#68217a", level: 3, category: "LANGUAGE", status: "INTERMEDIATE", group: "LANGUAGE", icon: <path d="M1.194 7.543v8.913c0 1.103.588 2.122 1.544 2.674l7.718 4.456a3.086 3.086 0 0 0 3.088 0l7.718-4.456a3.087 3.087 0 0 0 1.544-2.674V7.543a3.084 3.084 0 0 0-1.544-2.673L13.544.414a3.086 3.086 0 0 0-3.088 0L2.738 4.87a3.085 3.085 0 0 0-1.544 2.673Zm5.403 2.914v3.087a.77.77 0 0 0 .772.772.773.773 0 0 0 .772-.772.773.773 0 0 1 1.317-.546.775.775 0 0 1 .226.546 2.314 2.314 0 1 1-4.631 0v-3.087c0-.615.244-1.203.679-1.637a2.312 2.312 0 0 1 3.274 0c.434.434.678 1.023.678 1.637a.769.769 0 0 1-.226.545.767.767 0 0 1-1.091 0 .77.77 0 0 1-.226-.545.77.77 0 0 0-.772-.772.771.771 0 0 0-.772.772Zm12.35 3.087a.77.77 0 0 1-.772.772h-.772v.772a.773.773 0 0 1-1.544 0v-.772h-1.544v.772a.773.773 0 0 1-1.317.546.775.775 0 0 1-.226-.546v-.772H12a.771.771 0 1 1 0-1.544h.772v-1.543H12a.77.77 0 1 1 0-1.544h.772v-.772a.773.773 0 0 1 1.317-.546.775.775 0 0 1 .226.546v.772h1.544v-.772a.773.773 0 0 1 1.544 0v.772h.772a.772.772 0 0 1 0 1.544h-.772v1.543h.772a.776.776 0 0 1 .772.772Zm-3.088-2.315h-1.544v1.543h1.544v-1.543Z" /> },

  // Backend Frameworks
  { name: "DJANGO", color: "#092e20", darkColor: "#2ba977", lightColor: "#092e20", level: 4, category: "FRAMEWORK", status: "ADVANCED", group: "FRAMEWORK", icon: <path d="M11.146 0h3.924v18.166c-2.013.382-3.491.535-5.096.535-4.791 0-7.288-2.166-7.288-6.32 0-4.002 2.65-6.6 6.753-6.6.637 0 1.121.05 1.707.203zm0 9.143a3.894 3.894 0 00-1.325-.204c-1.988 0-3.134 1.223-3.134 3.365 0 2.09 1.096 3.236 3.109 3.236.433 0 .79-.025 1.35-.102V9.142zM21.314 6.06v9.098c0 3.134-.229 4.638-.917 5.937-.637 1.249-1.478 2.039-3.211 2.905l-3.644-1.733c1.733-.815 2.574-1.53 3.109-2.625.561-1.121.739-2.421.739-5.835V6.059h3.924zM17.39.021h3.924v4.026H17.39z" /> },
  { name: "FASTAPI", color: "#009688", level: 4, category: "FRAMEWORK", status: "ADVANCED", group: "FRAMEWORK", icon: <path d="M12 .0387C5.3729.0384.0003 5.3931 0 11.9988c-.001 6.6066 5.372 11.9628 12 11.9625 6.628.0003 12.001-5.3559 12-11.9625-.0003-6.6057-5.3729-11.9604-12-11.96m-.829 5.4153h7.55l-7.5805 5.3284h5.1828L5.279 18.5436q2.9466-6.5444 5.892-13.0896" /> },
  { name: "FLASK", color: "#aaaaaa", darkColor: "#cccccc", lightColor: "#555555", level: 3, category: "FRAMEWORK", status: "INTERMEDIATE", group: "FRAMEWORK", icon: <path d="M10.773 2.878c-.013 1.434.322 4.624.445 5.734l-8.558 3.83c-.56-.959-.98-2.304-1.237-3.38l-.06.027c-.205.09-.406.053-.494-.088l-.011-.018-.82-1.506c-.058-.105-.05-.252.024-.392a.78.78 0 0 1 .358-.331l9.824-4.207c.146-.064.299-.063.4.004.106.062.127.128.13.327Zm.68 7c.523 1.97.675 2.412.832 2.818l-7.263 3.7a19.35 19.35 0 0 1-1.81-2.83l8.24-3.689Zm12.432 8.786h.003c.283.402-.047.657-.153.698l-.947.37c.037.125.035.319-.217.414l-.736.287c-.229.09-.398-.059-.42-.2l-.025-.125c-4.427 1.784-7.94 1.685-10.696.647-1.981-.745-3.576-1.983-4.846-3.379l6.948-3.54c.721 1.431 1.586 2.454 2.509 3.178 2.086 1.638 4.415 1.712 5.793 1.563l-.047-.233c-.015-.077.007-.135.086-.165l.734-.288a.302.302 0 0 1 .342.086l.748-.288a.306.306 0 0 1 .341.086l.583.89Z" /> },
  { name: "SPRING BOOT", color: "#6db33f", level: 3, category: "FRAMEWORK", status: "INTERMEDIATE", group: "FRAMEWORK", viewBox: "0 0 32 32", icon: <path d="M5.466 27.993c.586.473 1.446.385 1.918-.202.475-.585.386-1.445-.2-1.92-.585-.474-1.444-.383-1.92.202-.45.555-.392 1.356.115 1.844l-.266-.234C1.972 24.762 0 20.597 0 15.978 0 7.168 7.168 0 15.98 0c4.48 0 8.53 1.857 11.435 4.836.66-.898 1.232-1.902 1.7-3.015 2.036 6.118 3.233 11.26 2.795 15.31-.592 8.274-7.508 14.83-15.93 14.83-3.912 0-7.496-1.416-10.276-3.757l-.238-.21zm23.58-4.982c4.01-5.336 1.775-13.965-.085-19.48-1.657 3.453-5.738 6.094-9.262 6.93-3.303.788-6.226.142-9.283 1.318-6.97 2.68-6.86 10.992-3.02 12.86.002 0 .23.124.227.12 0-.002 5.644-1.122 8.764-2.274 4.56-1.684 9.566-5.835 11.213-10.657-.877 5.015-5.182 9.84-9.507 12.056-2.302 1.182-4.092 1.445-7.88 2.756-.464.158-.828.314-.828.314.96-.16 1.917-.212 1.917-.212 5.393-.255 13.807 1.516 17.745-3.73z"/> },

  // AI Engineering
  {
    name: "RAG",
    color: "#ff3333",
    level: 4,
    category: "AI SYSTEM",
    status: "ADVANCED",
    group: "AI",
    viewBox: "0 0 24 24",
    icon: (
      <>
        {/* Knowledge base / document layers */}
        <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5L14.5 3H6a2 2 0 0 0-2 2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 3v5.5h5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Vector / Embedding bars */}
        <path d="M7.5 13h5.5M7.5 17h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
        {/* Retrieval Search loop */}
        <circle cx="10" cy="9" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M11.6 10.6l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        {/* AI Generative Sparkle */}
        <path d="M19 1.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z" fill="currentColor" />
      </>
    ),
  },
  {
    name: "MCP",
    color: "#ff6b6b",
    level: 4,
    category: "AI SYSTEM",
    status: "ADVANCED",
    group: "AI",
    viewBox: "0 0 180 180",
    icon: (
      <>
        <path d="M18 84.85L85.88 16.97a24 24 0 0 1 33.94 0v0a24 24 0 0 1 0 33.94L68.56 102.18" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
        <path d="M69.27 101.47l50.56-50.56a24 24 0 0 1 33.94 0l.35.35a24 24 0 0 1 0 33.94l-61.39 61.4a5 5 0 0 1-7.07 0l-12.6-12.6" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
        <path d="M102.85 33.94L52.65 84.15a24 24 0 0 0 0 33.94v0a24 24 0 0 0 33.94 0l50.2-50.2" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
      </>
    ),
  },
  { name: "LANGCHAIN", color: "#1c3c3c", darkColor: "#4ecdc4", lightColor: "#1c3c3c", level: 4, category: "AI TOOL", status: "ADVANCED", group: "AI", icon: <path d="M13.796 0a6.93 6.93 0 0 0-4.91 2.019L5.451 5.455l3.273 3.27 3.432-3.432a2.284 2.284 0 0 1 3.277 0 2.28 2.28 0 0 1 0 3.275L12 12.001l3.273 3.273 3.433-3.435c2.692-2.692 2.692-7.127 0-9.82A6.92 6.92 0 0 0 13.796 0m-5.07 8.728-3.433 3.434c-2.692 2.693-2.692 7.126 0 9.819A6.92 6.92 0 0 0 10.203 24a6.93 6.93 0 0 0 4.911-2.02l3.432-3.432-3.271-3.272-3.433 3.433a2.284 2.284 0 0 1-3.277 0 2.28 2.28 0 0 1 0-3.276L12 12z" /> },
  {
    name: "LANGGRAPH",
    color: "#2d6a6a",
    darkColor: "#5bb8b8",
    lightColor: "#2d6a6a",
    level: 3,
    category: "AI TOOL",
    status: "INTERMEDIATE",
    group: "AI",
    viewBox: "0 0 24 24",
    icon: <path d="M5 19H10A5 5 0 115 14ZM19 14A5 5 0 1114 19H19ZM10 5A5 5 0 105 10V5ZM19 5V10A5 5 0 1014 5Z" />,
  },

  // ML & Data Science
  {
    name: "SCIKIT-LEARN",
    color: "#f7931e",
    level: 3,
    category: "ML LIBRARY",
    status: "INTERMEDIATE",
    group: "ML",
    viewBox: "0 0 128 128",
    icon: (
      <>
        {/* Main learning cluster lobe */}
        <path d="M98.18 88.13c15.63-15.62 18.23-38.36 5.8-50.78-12.43-12.42-35.17-9.82-50.8 5.8-15.63 15.62-11.11 45.48-5.8 50.78 4.29 4.29 35.17 9.82 50.8-5.8Z" opacity="0.9" />
        {/* Secondary classification cluster */}
        <path d="M34.04 65.56c-9.07-9.06-22.27-10.57-29.48-3.37-7.21 7.21-5.7 20.4 3.37 29.46 9.07 9.07 26.4 6.44 29.48 3.37 2.49-2.49 5.71-20.4-3.37-29.46Z" opacity="0.75" />
        {/* Decision boundary / connecting bridge */}
        <circle cx="56" cy="74" r="5" fill="currentColor" opacity="0.4" />
        <circle cx="70" cy="54" r="4.5" fill="currentColor" opacity="0.4" />
      </>
    ),
  },
  { name: "PANDAS", color: "#150458", darkColor: "#6c5ce7", lightColor: "#150458", level: 4, category: "DATA LIBRARY", status: "ADVANCED", group: "ML", icon: <path d="M16.922 0h2.623v18.104h-2.623zm-4.126 12.94h2.623v2.57h-2.623zm0-7.037h2.623v5.446h-2.623zm0 11.197h2.623v5.446h-2.623zM4.456 5.896h2.622V24H4.455zm4.213 2.559h2.623v2.57H8.67zm0 4.151h2.623v5.447H8.67zm0-11.187h2.623v5.446H8.67Z" /> },
  { name: "NUMPY", color: "#4d77cf", level: 4, category: "DATA LIBRARY", status: "ADVANCED", group: "ML", icon: <path d="M10.315 4.876L6.3048 2.8517l-4.401 2.1965 4.1186 2.0683zm1.8381.9277l4.2045 2.1223-4.3622 2.1906-4.125-2.0718zm5.6153-2.9213l4.3193 2.1658-3.863 1.9402-4.2131-2.1252zm-1.859-.9329L12.021 0 8.1742 1.9193l4.0068 2.0208zm-3.0401 16.7443V24l4.7107-2.3507-.0053-5.3085zm4.7037-4.2057l-.0052-5.2528-4.6985 2.3356v5.2546zm5.6553-.9845v5.327l-4.0178 2.0052-.0029-5.3028zm0-1.8626V6.4214l-4.0253 2.001.0034 5.2633zM11.2062 11.571L8.0333 9.9756v6.895s-3.8804-8.2564-4.2399-8.998c-.0463-.0957-.2371-.2007-.2858-.2262C2.8118 7.2812.773 6.2485.773 6.2485V18.43l2.8204 1.5076v-6.3674s3.8392 7.3775 3.878 7.458c.0389.0807.4245.8582.8362 1.1314.5485.363 2.8992 1.7766 2.8992 1.7766z" /> },
  {
    name: "MATPLOTLIB",
    color: "#11557c",
    darkColor: "#4a9bd9",
    lightColor: "#11557c",
    level: 3,
    category: "DATA LIBRARY",
    status: "INTERMEDIATE",
    group: "ML",
    viewBox: "0 0 180 180",
    icon: (
      <>
        {/* Concentric polar grid rings */}
        <circle cx="90" cy="90" r="82" fill="none" stroke="currentColor" strokeWidth="4.5" opacity="0.5" />
        <circle cx="90" cy="90" r="58" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.4" />
        <circle cx="90" cy="90" r="32" fill="none" stroke="currentColor" strokeWidth="3.5" opacity="0.3" />
        {/* 8-axis radial spokes */}
        <path d="M90 8v164M148 32L32 148M172 90H8M148 148L32 32" stroke="currentColor" strokeWidth="3" opacity="0.35" />
        {/* Official Matplotlib polar data wedges */}
        <path d="m90 90h22a22 22 0 0 0 0-7z" opacity="0.95" />
        <path d="m90 90 38-48a60 60 0 0 0-18-9z" opacity="0.8" />
        <path d="m90 90-18-80a82 82 0 0 0-35 17z" opacity="0.9" />
        <path d="m90 90-65-31a72 72 0 0 0-6 44z" opacity="0.75" />
        <path d="m90 90-37 18a41 41 0 0 0 3 6z" opacity="0.7" />
        <path d="m90 90-12 51a52 52 0 0 0 20 0z" opacity="0.85" />
        <path d="m90 90 51 65a82 82 0 0 0 14-14z" opacity="0.95" />
      </>
    ),
  },
  {
    name: "SEABORN",
    color: "#2a6f9b",
    level: 3,
    category: "DATA LIBRARY",
    status: "INTERMEDIATE",
    group: "ML",
    viewBox: "0 0 24 24",
    icon: (
      <>
        {/* Outer circular emblem frame */}
        <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
        {/* Triple layered Seaborn KDE wave distributions */}
        <path d="M3.5 14.5c2-1 4.5-3.5 8.5-3.5 4 0 6.5 4.5 8.5 4.5v3a10.5 10.5 0 0 1-17-4z" opacity="0.85" />
        <path d="M4 11.5c2.5-1.5 5-4.5 8-4.5 3.5 0 5.5 3.5 8 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 16.5c3-1 5.5-2 8-2 3 0 5 1.5 8 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      </>
    ),
  },

  // Data & Analytics
  {
    name: "POWER BI",
    color: "#f2c811",
    darkColor: "#f2c811",
    lightColor: "#c49e00",
    level: 3,
    category: "BI TOOL",
    status: "INTERMEDIATE",
    group: "ANALYTICS",
    viewBox: "0 0 24 24",
    icon: (
      <>
        {/* 3 ascending rounded pill bars */}
        <rect x="3" y="13.5" width="4.8" height="8.5" rx="1.5" />
        <rect x="9.6" y="8" width="4.8" height="14" rx="1.5" opacity="0.85" />
        <rect x="16.2" y="2.5" width="4.8" height="19.5" rx="1.5" opacity="0.7" />
        {/* Baseline anchor */}
        <path d="M2 22h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </>
    ),
  },
  {
    name: "RAPIDMINER STUDIO",
    color: "#e8750a",
    level: 3,
    category: "ANALYTICS PLATFORM",
    status: "INTERMEDIATE",
    group: "ANALYTICS",
    viewBox: "0 0 24 24",
    icon: (
      <>
        {/* 3D Isometric modular cube container */}
        <path d="M12 2l8.5 4.8v10.4L12 22l-8.5-4.8V6.8L12 2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 12l8.5-4.8M12 12v10M12 12L3.5 7.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.5" />
        {/* RapidMiner bold 'R' operator glyph */}
        <path d="M8.5 7.5h4.2a2.3 2.3 0 0 1 2.3 2.3v0a2.3 2.3 0 0 1-2.3 2.3H8.5V7.5z M8.5 12.1h3l3.2 4.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Operator connection pin */}
        <circle cx="12" cy="2" r="1.3" fill="currentColor" />
        <circle cx="20.5" cy="7" r="1.3" fill="currentColor" />
      </>
    ),
  },

  // DevOps, Cloud & Databases
  { name: "VERCEL", color: "#ffffff", darkColor: "#ffffff", lightColor: "#000000", level: 3, category: "DEPLOYMENT", status: "INTERMEDIATE", group: "DEVOPS", viewBox: "0 0 256 222", icon: <path d="M128 0L256 221.705H0z" /> },
  { name: "RAILWAY", color: "#c6a0ff", level: 3, category: "DEPLOYMENT", status: "INTERMEDIATE", group: "DEVOPS", icon: <path d="M.113 10.27A13.026 13.026 0 000 11.48h18.23c-.064-.125-.15-.237-.235-.347-3.117-4.027-4.793-3.677-7.19-3.78-.8-.034-1.34-.048-4.524-.048-1.704 0-3.555.005-5.358.01-.234.63-.459 1.24-.567 1.737h9.342v1.216H.113v.002zm18.26 2.426H.009c.02.326.05.645.094.961h16.955c.754 0 1.179-.429 1.315-.96zm-17.318 4.28s2.81 6.902 10.93 7.024c4.855 0 9.027-2.883 10.92-7.024H1.056zM11.988 0C7.5 0 3.593 2.466 1.531 6.108l4.75-.005v-.002c3.71 0 3.849.016 4.573.047l.448.016c1.563.052 3.485.22 4.996 1.364.82.621 2.007 1.99 2.712 2.965.654.902.842 1.94.396 2.934-.408.914-1.289 1.458-2.353 1.458H.391s.099.42.249.886h22.748A12.026 12.026 0 0024 12.005C24 5.377 18.621 0 11.988 0z" /> },
  { name: "DOCKER", color: "#2496ed", level: 3, category: "DEVOPS TOOL", status: "INTERMEDIATE", group: "DEVOPS", viewBox: "0 0 340 268", icon: <path d="M334,110.1c-8.3-5.6-30.2-8-46.1-3.7-.9-15.8-9-29.2-24-40.8l-5.5-3.7-3.7,5.6c-7.2,11-10.3,25.7-9.2,39,.8,8.2,3.7,17.4,9.2,24.1-20.7,12-39.8,9.3-124.3,9.3H0c-.4,19.1,2.7,55.8,26,85.6,2.6,3.3,5.4,6.5,8.5,9.6,19,19,47.6,32.9,90.5,33,65.4,0,121.4-35.3,155.5-120.8,11.2.2,40.8,2,55.3-26,.4-.5,3.7-7.4,3.7-7.4l-5.5-3.7h0ZM85.2,92.7h-36.7v36.7h36.7v-36.7ZM132.6,92.7h-36.7v36.7h36.7v-36.7ZM179.9,92.7h-36.7v36.7h36.7v-36.7ZM227.3,92.7h-36.7v36.7h36.7v-36.7ZM37.8,92.7H1.1v36.7h36.7v-36.7ZM85.2,46.3h-36.7v36.7h36.7v-36.7ZM132.6,46.3h-36.7v36.7h36.7v-36.7ZM179.9,46.3h-36.7v36.7h36.7v-36.7ZM179.9,0h-36.7v36.7h36.7V0Z" /> },
  { name: "CI/CD", color: "#2088ff", level: 3, category: "DEVOPS TOOL", status: "INTERMEDIATE", group: "DEVOPS", icon: <path d="M10.984 13.836a.5.5 0 0 1-.353-.146l-.745-.743a.5.5 0 1 1 .706-.708l.392.391 1.181-1.18a.5.5 0 0 1 .708.707l-1.535 1.533a.504.504 0 0 1-.354.146zm9.353-.147l1.534-1.532a.5.5 0 0 0-.707-.707l-1.181 1.18-.392-.391a.5.5 0 1 0-.706.708l.746.743a.497.497 0 0 0 .706-.001zM4.527 7.452l2.557-1.585A1 1 0 0 0 7.09 4.17L4.533 2.56A1 1 0 0 0 3 3.406v3.196a1.001 1.001 0 0 0 1.527.85zm2.03-2.436L4 6.602V3.406l2.557 1.61zM24 12.5c0 1.93-1.57 3.5-3.5 3.5a3.503 3.503 0 0 1-3.46-3h-2.08a3.503 3.503 0 0 1-3.46 3 3.502 3.502 0 0 1-3.46-3h-.558c-.972 0-1.85-.399-2.482-1.042V17c0 1.654 1.346 3 3 3h.04c.244-1.693 1.7-3 3.46-3 1.93 0 3.5 1.57 3.5 3.5S13.43 24 11.5 24a3.502 3.502 0 0 1-3.46-3H8c-2.206 0-4-1.794-4-4V9.899A5.008 5.008 0 0 1 0 5c0-2.757 2.243-5 5-5s5 2.243 5 5a5.005 5.005 0 0 1-4.952 4.998A2.482 2.482 0 0 0 7.482 12h.558c.244-1.693 1.7-3 3.46-3a3.502 3.502 0 0 1 3.46 3h2.08a3.503 3.503 0 0 1 3.46-3c1.93 0 3.5 1.57 3.5 3.5zm-15 8c0 1.378 1.122 2.5 2.5 2.5s2.5-1.122 2.5-2.5-1.122-2.5-2.5-2.5S9 19.122 9 20.5zM5 9c2.206 0 4-1.794 4-4S7.206 1 5 1 1 2.794 1 5s1.794 4 4 4zm9 3.5c0-1.378-1.122-2.5-2.5-2.5S9 11.122 9 12.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5zm9 0c0-1.378-1.122-2.5-2.5-2.5S18 11.122 18 12.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5z" /> },
  { name: "POSTGRESQL", color: "#336791", level: 3, category: "DATABASE", status: "INTERMEDIATE", group: "DATABASE", icon: <path d="M23.5594 14.7228a.5269.5269 0 0 0-.0563-.1191c-.139-.2632-.4768-.3418-1.0074-.2321-1.6533.3411-2.2935.1312-2.5256-.0191 1.342-2.0482 2.445-4.522 3.0411-6.8297.2714-1.0507.7982-3.5237.1222-4.7316a1.5641 1.5641 0 0 0-.1509-.235C21.6931.9086 19.8007.0248 17.5099.0005c-1.4947-.0158-2.7705.3461-3.1161.4794a9.449 9.449 0 0 0-.5159-.0816 8.044 8.044 0 0 0-1.3114-.1278c-1.1822-.0184-2.2038.2642-3.0498.8406-.8573-.3211-4.7888-1.645-7.2219.0788C.9359 2.1526.3086 3.8733.4302 6.3043c.0409.818.5069 3.334 1.2423 5.7436.4598 1.5065.9387 2.7019 1.4334 3.582.553.9942 1.1259 1.5933 1.7143 1.7895.4474.1491 1.1327.1441 1.8581-.7279.8012-.9635 1.5903-1.8258 1.9446-2.2069.4351.2355.9064.3625 1.39.3772a.0569.0569 0 0 0 .0004.0041 11.0312 11.0312 0 0 0-.2472.3054c-.3389.4302-.4094.5197-1.5002.7443-.3102.064-1.1344.2339-1.1464.8115-.0025.1224.0329.2309.0919.3268.2269.4231.9216.6097 1.015.6331 1.3345.3335 2.5044.092 3.3714-.6787-.017 2.231.0775 4.4174.3454 5.0874.2212.5529.7618 1.9045 2.4692 1.9043.2505 0 .5263-.0291.8296-.0941 1.7819-.3821 2.5557-1.1696 2.855-2.9059.1503-.8707.4016-2.8753.5388-4.1012.0169-.0703.0357-.1207.057-.1362.0007-.0005.0697-.0471.4272.0307a.3673.3673 0 0 0 .0443.0068l.2539.0223.0149.001c.8468.0384 1.9114-.1426 2.5312-.4308.6438-.2988 1.8057-1.0323 1.5951-1.6698zM2.371 11.8765c-.7435-2.4358-1.1779-4.8851-1.2123-5.5719-.1086-2.1714.4171-3.6829 1.5623-4.4927 1.8367-1.2986 4.8398-.5408 6.108-.13-.0032.0032-.0066.0061-.0098.0094-2.0238 2.044-1.9758 5.536-1.9708 5.7495-.0002.0823.0066.1989.0162.3593.0348.5873.0996 1.6804-.0735 2.9184-.1609 1.1504.1937 2.2764.9728 3.0892.0806.0841.1648.1631.2518.2374-.3468.3714-1.1004 1.1926-1.9025 2.1576-.5677.6825-.9597.5517-1.0886.5087-.3919-.1307-.813-.5871-1.2381-1.3223-.4796-.839-.9635-2.0317-1.4155-3.5126zm6.0072 5.0871c-.1711-.0428-.3271-.1132-.4322-.1772.0889-.0394.2374-.0902.4833-.1409 1.2833-.2641 1.4815-.4506 1.9143-1.0002.0992-.126.2116-.2687.3673-.4426a.3549.3549 0 0 0 .0737-.1298c.1708-.1513.2724-.1099.4369-.0417.156.0646.3078.26.3695.4752.0291.1016.0619.2945-.0452.4444-.9043 1.2658-2.2216 1.2494-3.1676 1.0128zm2.094-3.988-.0525.141c-.133.3566-.2567.6881-.3334 1.003-.6674-.0021-1.3168-.2872-1.8105-.8024-.6279-.6551-.9131-1.5664-.7825-2.5004.1828-1.3079.1153-2.4468.079-3.0586-.005-.0857-.0095-.1607-.0122-.2199.2957-.2621 1.6659-.9962 2.6429-.7724.4459.1022.7176.4057.8305.928.5846 2.7038.0774 3.8307-.3302 4.7363-.084.1866-.1633.3629-.2311.5454zm7.3637 4.5725c-.0169.1768-.0358.376-.0618.5959l-.146.4383a.3547.3547 0 0 0-.0182.1077c-.0059.4747-.054.6489-.115.8693-.0634.2292-.1353.4891-.1794 1.0575-.11 1.4143-.8782 2.2267-2.4172 2.5565-1.5155.3251-1.7843-.4968-2.0212-1.2217a6.5824 6.5824 0 0 0-.0769-.2266c-.2154-.5858-.1911-1.4119-.1574-2.5551.0165-.5612-.0249-1.9013-.3302-2.6462.0044-.2932.0106-.5909.019-.8918a.3529.3529 0 0 0-.0153-.1126 1.4927 1.4927 0 0 0-.0439-.208c-.1226-.4283-.4213-.7866-.7797-.9351-.1424-.059-.4038-.1672-.7178-.0869.067-.276.1831-.5875.309-.9249l.0529-.142c.0595-.16.134-.3257.213-.5012.4265-.9476 1.0106-2.2453.3766-5.1772-.2374-1.0981-1.0304-1.6343-2.2324-1.5098-.7207.0746-1.3799.3654-1.7088.5321a5.6716 5.6716 0 0 0-.1958.1041c.0918-1.1064.4386-3.1741 1.7357-4.4823a4.0306 4.0306 0 0 1 .3033-.276.3532.3532 0 0 0 .1447-.0644c.7524-.5706 1.6945-.8506 2.802-.8325.4091.0067.8017.0339 1.1742.081 1.939.3544 3.2439 1.4468 4.0359 2.3827.8143.9623 1.2552 1.9315 1.4312 2.4543-1.3232-.1346-2.2234.1268-2.6797.779-.9926 1.4189.543 4.1729 1.2811 5.4964.1353.2426.2522.4522.2889.5413.2403.5825.5515.9713.7787 1.2552.0696.087.1372.1714.1885.245-.4008.1155-1.1208.3825-1.0552 1.717-.0123.1563-.0423.4469-.0834.8148-.0461.2077-.0702.4603-.0994.7662zm.8905-1.6211c-.0405-.8316.2691-.9185.5967-1.0105a2.8566 2.8566 0 0 0 .135-.0406 1.202 1.202 0 0 0 .1342.103c.5703.3765 1.5823.4213 3.0068.1344-.2016.1769-.5189.3994-.9533.6011-.4098.1903-1.0957.333-1.7473.3636-.7197.0336-1.0859-.0807-1.1721-.151zm.5695-9.2712c-.0059.3508-.0542.6692-.1054 1.0017-.055.3576-.112.7274-.1264 1.1762-.0142.4368.0404.8909.0932 1.3301.1066.887.216 1.8003-.2075 2.7014a3.5272 3.5272 0 0 1-.1876-.3856c-.0527-.1276-.1669-.3326-.3251-.6162-.6156-1.1041-2.0574-3.6896-1.3193-4.7446.3795-.5427 1.3408-.5661 2.1781-.463zm.2284 7.0137a12.3762 12.3762 0 0 0-.0853-.1074l-.0355-.0444c.7262-1.1995.5842-2.3862.4578-3.4385-.0519-.4318-.1009-.8396-.0885-1.2226.0129-.4061.0666-.7543.1185-1.0911.0639-.415.1288-.8443.1109-1.3505.0134-.0531.0188-.1158.0118-.1902-.0457-.4855-.5999-1.938-1.7294-3.253-.6076-.7073-1.4896-1.4972-2.6889-2.0395.5251-.1066 1.2328-.2035 2.0244-.1859 2.0515.0456 3.6746.8135 4.8242 2.2824a.908.908 0 0 1 .0667.1002c.7231 1.3556-.2762 6.2751-2.9867 10.5405zm-8.8166-6.1162c-.025.1794-.3089.4225-.6211.4225a.5821.5821 0 0 1-.0809-.0056c-.1873-.026-.3765-.144-.5059-.3156-.0458-.0605-.1203-.178-.1055-.2844.0055-.0401.0261-.0985.0925-.1488.1182-.0894.3518-.1226.6096-.0867.3163.0441.6426.1938.6113.4186zm7.9305-.4114c.0111.0792-.049.201-.1531.3102-.0683.0717-.212.1961-.4079.2232a.5456.5456 0 0 1-.075.0052c-.2935 0-.5414-.2344-.5607-.3717-.024-.1765.2641-.3106.5611-.352.297-.0414.6111.0088.6356.1851z" /> },
  {
    name: "MYSQL",
    color: "#00758f",
    level: 3,
    category: "DATABASE",
    status: "INTERMEDIATE",
    group: "DATABASE",
    viewBox: "0 0 24 24",
    icon: (
      <path d="M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.18-.153zM5.77 18.695h-.927a50.854 50.854 0 00-.27-4.41h-.008l-1.41 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 00-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.064h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.716-1.01 1.073-1.583 1.073-.153 0-.34-.046-.566-.138v-.494c.11.017.24.026.386.026.268 0 .483-.075.647-.222.197-.18.295-.382.295-.605 0-.155-.077-.47-.23-.944L6.23 14.615h.91l.727 2.36c.164.536.233.91.205 1.123.4-1.064.678-2.227.835-3.483zm12.325 4.08h-2.63v-5.53h.885v4.85h1.745zm-3.32.135l-1.016-.5c.09-.076.177-.158.255-.25.433-.506.648-1.258.648-2.253 0-1.83-.718-2.746-2.155-2.746-.704 0-1.254.232-1.65.697-.43.508-.646 1.256-.646 2.245 0 .972.19 1.686.574 2.14.35.41.877.615 1.583.615.264 0 .506-.033.725-.098l1.325.772.36-.622zM15.5 17.588c-.225-.36-.337-.94-.337-1.736 0-1.393.424-2.09 1.27-2.09.443 0 .77.167.977.5.224.362.336.936.336 1.723 0 1.404-.424 2.108-1.27 2.108-.445 0-.77-.167-.978-.5zm-1.658-.425c0 .47-.172.856-.516 1.156-.344.3-.803.45-1.384.45-.543 0-1.064-.172-1.573-.515l.237-.476c.438.22.833.328 1.19.328.332 0 .593-.073.783-.22a.754.754 0 00.3-.615c0-.33-.23-.61-.648-.845-.388-.213-1.163-.657-1.163-.657-.422-.307-.632-.636-.632-1.177 0-.45.157-.81.47-1.085.315-.278.72-.415 1.22-.415.512 0 .98.136 1.4.41l-.213.476a2.726 2.726 0 00-1.064-.23c-.283 0-.502.068-.654.206a.685.685 0 00-.248.524c0 .328.234.61.666.85.393.215 1.187.67 1.187.67.433.305.648.63.648 1.168zm9.382-5.852c-.535-.014-.95.04-1.297.188-.1.04-.26.04-.274.167.055.053.063.14.11.214.08.134.218.313.346.407.14.11.28.216.427.31.26.16.555.255.81.416.145.094.293.213.44.313.073.05.12.14.214.172v-.02c-.046-.06-.06-.147-.105-.214-.067-.067-.134-.127-.2-.193a3.223 3.223 0 00-.695-.675c-.214-.146-.682-.35-.77-.595l-.013-.014c.146-.013.32-.066.46-.106.227-.06.435-.047.67-.106.106-.027.213-.06.32-.094v-.06c-.12-.12-.21-.283-.334-.395a8.867 8.867 0 00-1.104-.823c-.21-.134-.476-.22-.697-.334-.08-.04-.214-.06-.26-.127-.12-.146-.19-.34-.275-.514a17.69 17.69 0 01-.547-1.163c-.12-.262-.193-.523-.34-.763-.69-1.137-1.437-1.826-2.586-2.5-.247-.14-.543-.2-.856-.274-.167-.008-.334-.02-.5-.027-.11-.047-.216-.174-.31-.235-.38-.24-1.364-.76-1.644-.072-.18.434.267.862.422 1.082.115.153.26.328.34.5.047.116.06.235.107.356.106.294.207.622.347.897.073.14.153.287.247.413.054.073.146.107.167.227-.094.136-.1.334-.154.5-.24.757-.146 1.693.194 2.25.107.166.362.534.703.393.3-.12.234-.5.32-.835.02-.08.007-.133.048-.187v.015c.094.188.188.367.274.555.206.328.566.668.867.895.16.12.287.328.487.402v-.02h-.015c-.043-.058-.1-.086-.154-.133a3.445 3.445 0 01-.35-.4 8.76 8.76 0 01-.747-1.218c-.11-.21-.202-.436-.29-.643-.04-.08-.04-.2-.107-.24-.1.146-.247.273-.32.453-.127.288-.14.642-.188 1.01-.027.007-.014 0-.027.014-.214-.052-.287-.274-.367-.46-.2-.475-.233-1.238-.06-1.785.047-.14.247-.582.167-.716-.042-.127-.174-.2-.247-.303a2.478 2.478 0 01-.24-.427c-.16-.374-.24-.788-.414-1.162-.08-.173-.22-.354-.334-.513-.127-.18-.267-.307-.368-.52-.033-.073-.08-.194-.027-.274.014-.054.042-.075.094-.09.088-.072.335.022.422.062.247.1.455.194.662.334.094.066.195.193.315.226h.14c.214.047.455.014.655.073.355.114.675.28.962.46a5.953 5.953 0 012.085 2.286c.08.154.115.295.188.455.14.33.313.663.455.982.14.315.275.636.476.897.1.14.502.213.682.286.133.06.34.115.46.188.23.14.454.3.67.454.11.076.443.243.463.378z" />
    ),
  },

  // Frontend
  { name: "HTML5", color: "#e34f26", level: 4, category: "MARKUP", status: "ADVANCED", group: "FRONTEND", icon: <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.076-.757.076-.771.076-.756H6.697l.233 2.716.233 2.717h6.94l-.326 3.205-2.815.874-.006-.001-2.752-.868-.178-2.135H5.907l.331 3.622 5.725 1.733 5.695-1.733.463-5.426.063-.733.016-.189H8.531z" /> },
  { name: "CSS3", color: "#1572b6", level: 4, category: "STYLING", status: "ADVANCED", group: "FRONTEND", icon: <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.002l5.355-1.12.926-9.694-.046-.504z" /> },
  { name: "JAVASCRIPT", color: "#f7df1e", darkColor: "#f7df1e", lightColor: "#b09b00", level: 3, category: "LANGUAGE", status: "INTERMEDIATE", group: "FRONTEND", icon: <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.405-.585-.585-.765-.63-.63-1.47-.945-2.83-.915l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.81 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" /> },
];

const FILTERS = ["ALL", "LANGUAGES", "FRAMEWORKS", "AI ENGINEERING", "ML & DATA", "DATA & ANALYTICS", "DEVOPS & DB", "FRONTEND"];

const FILTER_TRANSITION = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

const filterGridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const filterItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: FILTER_TRANSITION },
};

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeFilter, setActiveFilter] = useState("ALL");
  const isDark = useResolvedTheme();

  const filteredSkills = SKILLS_DATA.filter((skill) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "LANGUAGES") return skill.group === "LANGUAGE";
    if (activeFilter === "FRAMEWORKS") return skill.group === "FRAMEWORK";
    if (activeFilter === "AI ENGINEERING") return skill.group === "AI";
    if (activeFilter === "ML & DATA") return skill.group === "ML";
    if (activeFilter === "DATA & ANALYTICS") return skill.group === "ANALYTICS";
    if (activeFilter === "DEVOPS & DB") return ["DEVOPS", "DATABASE"].includes(skill.group);
    if (activeFilter === "FRONTEND") return skill.group === "FRONTEND";
    return true;
  });

  const skillRows = useMemo(
    () => (activeFilter === "ALL" ? getSkillRows(filteredSkills) : []),
    [activeFilter, filteredSkills]
  );

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const metaNames = SKILLS_META.map((skill) => skill.name).join(',');
    const dataNames = SKILLS_DATA.map((skill) => skill.name).join(',');
    if (metaNames !== dataNames) {
      console.warn('[Skills] SKILLS_DATA is out of sync with src/data/skillsMeta.js');
    }
  }, []);

  return (
    <section id="skills" className="section-padding bg-transparent relative overflow-hidden" aria-label="Technical Skills and Capabilities">
      {/* Subtle Dot-Grid Background Overlay */}
      <div
        className="absolute inset-0 z-[-1] opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--color-border-strong) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Section Heading */}
      <div className="container-custom relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <ScrollReveal delay={0}>
            <p className="text-sm text-muted mb-2 tracking-widest uppercase flex items-center gap-3">
              <span className="text-red font-bold">// 01</span>
              <span>&mdash; CAPABILITIES</span>
            </p>
            <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
              <span className="text-muted/30"></span>
              <TextReveal text="SKILLS" delay={0.2} className="mx-2 inline-flex" />
              <span className="text-muted/30"></span>
            </h2>
            <div className="w-16 h-[4px]" style={{ backgroundColor: 'var(--color-red)' }} />
          </ScrollReveal>
        </motion.div>

        {/* â”€â”€ RETRO BRUTALIST FILTER TABS â”€â”€ */}
        <nav aria-label="Skills filter" className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 text-xs font-mono max-w-3xl mx-auto px-4">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`px-3 py-1.5 border-2 border-border-strong uppercase transition-all duration-150 relative ${
                activeFilter === filter 
                  ? "bg-accent text-primary shadow-[2px_2px_0px_var(--color-red)] -translate-x-[1px] -translate-y-[1px]" 
                  : "bg-transparent text-muted hover:text-accent hover:border-accent"
              }`}
            >
              {filter}
            </button>
          ))}
        </nav>

        <motion.div
          layout
          className="overflow-hidden mt-4"
          transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {activeFilter === 'ALL' ? (
              <motion.ul
                key="skills-all"
                layout
                role="list"
                aria-label="All skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={FILTER_TRANSITION}
                className="flex flex-col gap-4 md:gap-5"
              >
                {skillRows.map((row, rowIndex) => (
                  <li key={`all-${rowIndex}`}>
                    <SkillMarqueeRow
                      skills={row}
                      rowIndex={rowIndex}
                      direction={rowIndex % 2 === 0 ? 'right' : 'left'}
                      speed={28 + rowIndex * 6}
                      isDark={isDark}
                    />
                  </li>
                ))}
              </motion.ul>
            ) : (
              <motion.ul
                key={activeFilter}
                layout
                role="list"
                aria-label={`${activeFilter} skills`}
                variants={filterGridVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex flex-wrap justify-center gap-3 md:gap-4 content-start pb-1"
              >
                {filteredSkills.map((skill) => (
                  <motion.li key={skill.name} variants={filterItemVariants} className="relative">
                    <SkillCard skill={skill} disableEntrance isDark={isDark} />
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
