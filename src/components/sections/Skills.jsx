import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import TextReveal from '../ui/TextReveal';
import MagneticWrapper from '../ui/MagneticWrapper';
import { SKILLS_META } from '../../data/skillsMeta';

const SkillCard = ({ skill, inMarquee = false }) => {
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
          borderColor: isHovered ? skill.color : 'var(--color-border-strong)',
          boxShadow: isHovered 
            ? `6px 6px 0px ${skill.color}` 
            : `4px 4px 0px ${skill.color}`,
          transform: isHovered && !isMobile ? 'translate(-2px, -2px)' : 'none',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Subtle color glow backplate */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: skill.color }}
        />
        
        {/* Brand Icon SVG */}
        <svg 
          viewBox={skill.viewBox || "0 0 24 24"} 
          className="w-6 h-6 shrink-0 opacity-80 group-hover:opacity-100 transition-all duration-300"
          style={{ 
            color: isHovered ? skill.color : 'inherit',
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
                color: isHovered && char !== skill.name[index] ? skill.color : undefined,
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

const SkillMarqueeRow = ({ skills, direction = 'left', speed = 35, rowIndex = 0 }) => {
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
          <SkillCard key={`${skill.name}-${rowIndex}-${i}`} skill={skill} inMarquee />
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

const CODE_ICON = <path d="M8 6l-4 6 4 6M16 6l4 6-4 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
const DOT_ICON = <circle cx="12" cy="12" r="4" />;

const SKILLS_DATA = [
  // Languages
  { name: "PYTHON", color: "#3776ab", level: 4, category: "LANGUAGE", status: "ADVANCED", group: "LANGUAGE", icon: <path d="M11.96 2.18C9.84 2.18 8.18 3.42 8.18 5.64c0 1.02.54 1.8 1.38 2.28L7.5 9.9c-1.56.84-2.52 2.34-2.52 4.2 0 2.88 2.46 5.1 5.7 5.1h2.28c2.22 0 3.84-1.26 3.84-3.48 0-1.02-.54-1.8-1.38-2.28l2.04-2.04c1.56-.84 2.52-2.34 2.52-4.2 0-2.88-2.46-5.1-5.7-5.1h-2.28zm-.72 2.04h1.44c1.38 0 2.28.72 2.28 1.86 0 .66-.3 1.14-.84 1.44l-2.88-3.3zm1.44 11.76H11.24c-1.38 0-2.28-.72-2.28-1.86 0-.66.3-1.14.84-1.44l2.88 3.3z" /> },
  { name: "JAVA", color: "#e76f51", level: 3, category: "LANGUAGE", status: "INTERMEDIATE", group: "LANGUAGE", icon: <path d="M 17.625 3 C 19.027344 6.308594 12.597656 8.335938 12 11.09375 C 11.453125 13.625 15.808594 16.59375 15.8125 16.59375 C 15.148438 15.546875 14.664063 14.664063 14 13.03125 C 12.875 10.273438 20.855469 7.785156 17.625 3 Z M 21.875 7.59375 C 21.875 7.59375 16.253906 7.949219 15.96875 11.625 C 15.839844 13.261719 17.453125 14.121094 17.5 15.3125 C 17.539063 16.285156 16.53125 17.09375 16.53125 17.09375 C 16.53125 17.09375 18.339844 16.765625 18.90625 15.28125 C 19.53125 13.632813 17.6875 12.507813 17.875 11.1875 C 18.054688 9.925781 21.875 7.59375 21.875 7.59375 Z M 23.25 16.0625 C 22.660156 16.035156 21.996094 16.253906 21.40625 16.6875 C 22.570313 16.429688 23.5625 17.160156 23.5625 18 C 23.5625 19.882813 20.875 21.65625 20.875 21.65625 C 20.875 21.65625 25.03125 21.191406 25.03125 18.09375 C 25.03125 16.816406 24.230469 16.109375 23.25 16.0625 Z M 12.21875 16.09375 C 10.769531 16.144531 7.875 16.382813 7.875 17.5 C 7.875 19.054688 14.617188 19.175781 19.4375 18.21875 C 19.4375 18.21875 20.75 17.304688 21.09375 16.96875 C 17.933594 17.625 10.71875 17.726563 10.71875 17.15625 C 10.71875 16.632813 13.03125 16.09375 13.03125 16.09375 C 13.03125 16.09375 12.703125 16.078125 12.21875 16.09375 Z M 11.78125 18.96875 C 10.988281 18.96875 9.8125 19.585938 9.8125 20.1875 C 9.8125 21.398438 15.78125 22.328125 20.1875 20.5625 L 18.65625 19.625 C 15.667969 20.601563 10.148438 20.277344 11.78125 18.96875 Z M 12.53125 21.6875 C 11.449219 21.6875 10.75 22.371094 10.75 22.875 C 10.75 24.425781 17.214844 24.578125 19.78125 23 L 18.15625 21.9375 C 16.242188 22.761719 11.425781 22.882813 12.53125 21.6875 Z M 8.90625 23.09375 C 7.140625 23.058594 6 23.859375 6 24.53125 C 6 28.105469 24.09375 27.933594 24.09375 24.28125 C 24.09375 23.675781 23.378906 23.386719 23.125 23.25 C 24.601563 26.742188 8.34375 26.46875 8.34375 24.40625 C 8.34375 23.9375 9.546875 23.46875 10.65625 23.6875 L 9.71875 23.15625 C 9.441406 23.113281 9.160156 23.097656 8.90625 23.09375 Z M 26 25.5 C 23.25 28.160156 16.289063 29.113281 9.28125 27.46875 C 16.289063 30.398438 25.964844 28.769531 26 25.5 Z" /> },
  { name: "C#", color: "#68217a", level: 3, category: "LANGUAGE", status: "INTERMEDIATE", group: "LANGUAGE", icon: DOT_ICON },

  // Backend Frameworks
  { name: "DJANGO", color: "#092e20", level: 4, category: "FRAMEWORK", status: "ADVANCED", group: "FRAMEWORK", icon: DOT_ICON },
  { name: "FASTAPI", color: "#009688", level: 4, category: "FRAMEWORK", status: "ADVANCED", group: "FRAMEWORK", icon: DOT_ICON },
  { name: "FLASK", color: "#aaaaaa", level: 3, category: "FRAMEWORK", status: "INTERMEDIATE", group: "FRAMEWORK", icon: DOT_ICON },
  { name: "SPRING BOOT", color: "#6db33f", level: 3, category: "FRAMEWORK", status: "INTERMEDIATE", group: "FRAMEWORK", viewBox: "0 0 32 32", icon: <path d="M5.466 27.993c.586.473 1.446.385 1.918-.202.475-.585.386-1.445-.2-1.92-.585-.474-1.444-.383-1.92.202-.45.555-.392 1.356.115 1.844l-.266-.234C1.972 24.762 0 20.597 0 15.978 0 7.168 7.168 0 15.98 0c4.48 0 8.53 1.857 11.435 4.836.66-.898 1.232-1.902 1.7-3.015 2.036 6.118 3.233 11.26 2.795 15.31-.592 8.274-7.508 14.83-15.93 14.83-3.912 0-7.496-1.416-10.276-3.757l-.238-.21zm23.58-4.982c4.01-5.336 1.775-13.965-.085-19.48-1.657 3.453-5.738 6.094-9.262 6.93-3.303.788-6.226.142-9.283 1.318-6.97 2.68-6.86 10.992-3.02 12.86.002 0 .23.124.227.12 0-.002 5.644-1.122 8.764-2.274 4.56-1.684 9.566-5.835 11.213-10.657-.877 5.015-5.182 9.84-9.507 12.056-2.302 1.182-4.092 1.445-7.88 2.756-.464.158-.828.314-.828.314.96-.16 1.917-.212 1.917-.212 5.393-.255 13.807 1.516 17.745-3.73z"/> },

  // AI Engineering
  { name: "RAG", color: "#ff3333", level: 4, category: "AI SYSTEM", status: "ADVANCED", group: "AI", icon: CODE_ICON },
  { name: "MCP", color: "#ff6b6b", level: 4, category: "AI SYSTEM", status: "ADVANCED", group: "AI", icon: CODE_ICON },
  { name: "LANGCHAIN", color: "#1c3c3c", level: 4, category: "AI TOOL", status: "ADVANCED", group: "AI", icon: DOT_ICON },
  { name: "LANGGRAPH", color: "#2d6a6a", level: 3, category: "AI TOOL", status: "INTERMEDIATE", group: "AI", icon: DOT_ICON },

  // ML & Data Science
  { name: "SCIKIT-LEARN", color: "#f7931e", level: 3, category: "ML LIBRARY", status: "INTERMEDIATE", group: "ML", icon: DOT_ICON },
  { name: "PANDAS", color: "#150458", level: 4, category: "DATA LIBRARY", status: "ADVANCED", group: "ML", icon: DOT_ICON },
  { name: "NUMPY", color: "#4d77cf", level: 4, category: "DATA LIBRARY", status: "ADVANCED", group: "ML", icon: DOT_ICON },
  { name: "MATPLOTLIB", color: "#11557c", level: 3, category: "DATA LIBRARY", status: "INTERMEDIATE", group: "ML", icon: DOT_ICON },
  { name: "SEABORN", color: "#2a6f9b", level: 3, category: "DATA LIBRARY", status: "INTERMEDIATE", group: "ML", icon: DOT_ICON },

  // DevOps, Cloud & Databases
  { name: "VERCEL", color: "#ffffff", level: 3, category: "DEPLOYMENT", status: "INTERMEDIATE", group: "DEVOPS", viewBox: "0 0 256 222", icon: <path d="M128 0L256 221.705H0z" /> },
  { name: "RAILWAY", color: "#c6a0ff", level: 3, category: "DEPLOYMENT", status: "INTERMEDIATE", group: "DEVOPS", icon: DOT_ICON },
  { name: "DOCKER", color: "#2496ed", level: 3, category: "DEVOPS TOOL", status: "INTERMEDIATE", group: "DEVOPS", viewBox: "0 0 340 268", icon: <path d="M334,110.1c-8.3-5.6-30.2-8-46.1-3.7-.9-15.8-9-29.2-24-40.8l-5.5-3.7-3.7,5.6c-7.2,11-10.3,25.7-9.2,39,.8,8.2,3.7,17.4,9.2,24.1-20.7,12-39.8,9.3-124.3,9.3H0c-.4,19.1,2.7,55.8,26,85.6,2.6,3.3,5.4,6.5,8.5,9.6,19,19,47.6,32.9,90.5,33,65.4,0,121.4-35.3,155.5-120.8,11.2.2,40.8,2,55.3-26,.4-.5,3.7-7.4,3.7-7.4l-5.5-3.7h0ZM85.2,92.7h-36.7v36.7h36.7v-36.7ZM132.6,92.7h-36.7v36.7h36.7v-36.7ZM179.9,92.7h-36.7v36.7h36.7v-36.7ZM227.3,92.7h-36.7v36.7h36.7v-36.7ZM37.8,92.7H1.1v36.7h36.7v-36.7ZM85.2,46.3h-36.7v36.7h36.7v-36.7ZM132.6,46.3h-36.7v36.7h36.7v-36.7ZM179.9,46.3h-36.7v36.7h36.7v-36.7ZM179.9,0h-36.7v36.7h36.7V0Z" /> },
  { name: "CI/CD", color: "#ff3333", level: 3, category: "DEVOPS TOOL", status: "INTERMEDIATE", group: "DEVOPS", icon: CODE_ICON },
  { name: "POSTGRESQL", color: "#336791", level: 3, category: "DATABASE", status: "INTERMEDIATE", group: "DATABASE", icon: DOT_ICON },
  { name: "MYSQL", color: "#00758f", level: 3, category: "DATABASE", status: "INTERMEDIATE", group: "DATABASE", viewBox: "0 0 32 32", icon: <path d="m24.129 23.412-.508-.484c-.251-.331-.518-.624-.809-.891l-.005-.004q-.448-.407-.931-.774-.387-.266-1.064-.641c-.371-.167-.661-.46-.818-.824l-.004-.01-.048-.024c.212-.021.406-.06.592-.115l-.023.006.57-.157c.236-.074.509-.122.792-.133h.006c.298-.012.579-.06.847-.139l-.025.006q.194-.048.399-.109t.351-.109v-.169q-.145-.217-.351-.496c-.131-.178-.278-.333-.443-.468l-.005-.004q-.629-.556-1.303-1.076c-.396-.309-.845-.624-1.311-.916l-.068-.04c-.246-.162-.528-.312-.825-.435l-.034-.012q-.448-.182-.883-.399c-.097-.048-.21-.09-.327-.119l-.011-.002c-.117-.024-.217-.084-.29-.169l-.001-.001c-.138-.182-.259-.389-.355-.609l-.008-.02q-.145-.339-.314-.651-.363-.702-.702-1.427t-.651-1.452q-.217-.484-.399-.967c-.134-.354-.285-.657-.461-.942l.013.023c-.432-.736-.863-1.364-1.331-1.961l.028.038c-.463-.584-.943-1.106-1.459-1.59l-.008-.007c-.509-.478-1.057-.934-1.632-1.356l-.049-.035q-.896-.651-1.96-1.282c-.285-.168-.616-.305-.965-.393l-.026-.006-1.113-.278-.629-.048q-.314-.024-.629-.024c-.148-.078-.275-.171-.387-.279-.11-.105-.229-.204-.353-.295l-.01-.007c-.605-.353-1.308-.676-2.043-.93l-.085-.026c-.193-.113-.425-.179-.672-.179-.176 0-.345.034-.499.095l.009-.003c-.38.151-.67.458-.795.84l-.003.01c-.073.172-.115.371-.115.581 0 .368.13.705.347.968l-.002-.003q.544.725.834 1.14.217.291.448.605c.141.188.266.403.367.63l.008.021c.056.119.105.261.141.407l.003.016q.048.206.121.448.217.556.411 1.14c.141.425.297.785.478 1.128l-.019-.04q.145.266.291.52t.314.496c.065.098.147.179.241.242l.003.002c.099.072.164.185.169.313v.001c-.114.168-.191.369-.217.586l-.001.006c-.035.253-.085.478-.153.695l.008-.03c-.223.666-.351 1.434-.351 2.231 0 .258.013.512.04.763l-.003-.031c.06.958.349 1.838.812 2.6l-.014-.025c.197.295.408.552.641.787.168.188.412.306.684.306.152 0 .296-.037.422-.103l-.005.002c.35-.126.599-.446.617-.827v-.002c.048-.474.12-.898.219-1.312l-.013.067c.024-.063.038-.135.038-.211 0-.015-.001-.03-.002-.045v.002q-.012-.109.133-.206v.048q.145.339.302.677t.326.677c.295.449.608.841.952 1.202l-.003-.003c.345.372.721.706 1.127 1.001l.022.015c.212.162.398.337.566.528l.004.004c.158.186.347.339.56.454l.01.005v-.024h.048c-.039-.087-.102-.157-.18-.205l-.002-.001c-.079-.044-.147-.088-.211-.136l.005.003q-.217-.217-.448-.484t-.423-.508q-.508-.702-.969-1.467t-.871-1.555q-.194-.387-.375-.798t-.351-.798c-.049-.099-.083-.213-.096-.334v-.005c-.006-.115-.072-.214-.168-.265l-.002-.001c-.121.206-.255.384-.408.545l.001-.001c-.159.167-.289.364-.382.58l-.005.013c-.141.342-.244.739-.289 1.154l-.002.019q-.072.641-.145 1.318l-.048.024-.024.024c-.26-.053-.474-.219-.59-.443l-.002-.005q-.182-.351-.326-.69c-.248-.637-.402-1.374-.423-2.144v-.009c-.009-.122-.013-.265-.013-.408 0-.666.105-1.308.299-1.91l-.012.044q.072-.266.314-.896t.097-.871c-.05-.165-.143-.304-.265-.41l-.001-.001c-.122-.106-.233-.217-.335-.335l-.003-.004q-.169-.244-.326-.52t-.278-.544c-.165-.382-.334-.861-.474-1.353l-.022-.089c-.159-.565-.336-1.043-.546-1.503l.026.064c-.111-.252-.24-.47-.39-.669l.006.008q-.244-.326-.436-.617-.244-.314-.484-.605c-.163-.197-.308-.419-.426-.657l-.009-.02c-.048-.097-.09-.21-.119-.327l-.002-.011c-.011-.035-.017-.076-.017-.117 0-.082.024-.159.066-.223l-.001.002c-.011-.056.037-.105.073-.145.039-.035.089-.061.143-.072h.002c.085-.055.188-.088.3-.088.084 0 .165.019.236.053l-.003-.001c-.219.062.396.124.569.195l-.036-.013q.459.194.847.375c.298.142.552.292.792.459l-.018-.012q.194.121.387.266t.411.291h.339q.387 0 .822.037c.293.023.564.078.822.164l-.024-.007c.481.143.894.312 1.286.515l-.041-.019q.593.302 1.125.641c.589.367 1.098.743 1.577 1.154l-.017-.014c.5.428.954.867 1.38 1.331l.01.012c.416.454.813.947 1.176 1.464l.031.047c.334.472.671 1.018.974 1.584l.042.085c.081.154.163.343.234.536l.011.033q.097.278.217.57.266.605.57 1.221t.57 1.198l.532 1.161c.187.406.396.756.639 1.079l-.011-.015c.203.217.474.369.778.422l.008.001c.368.092.678.196.978.319l-.047-.017c.143.065.327.134.516.195l.04.011c.212.065.396.151.565.259l-.009-.005c.327.183.604.363.868.559l-.021-.015q.411.302.822.57.194.145.651.423t.484.52c-.114-.004-.249-.007-.384-.007-.492 0-.976.032-1.45.094l.056-.006c-.536.072-1.022.203-1.479.39l.04-.014c-.113.049-.248.094-.388.129l-.019.004c-.142.021-.252.135-.266.277v.001c.061.076.11.164.143.26l.002.006c.034.102.075.19.125.272l-.003-.006c.119.211.247.393.391.561l-.004-.005c.141.174.3.325.476.454l.007.005q.244.194.508.399c.161.126.343.25.532.362l.024.013c.284.174.614.34.958.479l.046.016c.374.15.695.324.993.531l-.016-.011q.291.169.58.375t.556.399c.073.072.137.152.191.239l.003.005c.091.104.217.175.36.193h.003v-.048c-.088-.067-.153-.16-.184-.267l-.001-.004c-.025-.102-.062-.191-.112-.273l.002.004zm-18.576-19.205q-.194 0-.363.012c-.115.008-.222.029-.323.063l.009-.003v.024h.048q.097.145.244.326t.266.351l.387.798.048-.024c.113-.082.2-.192.252-.321l.002-.005c.052-.139.082-.301.082-.469 0-.018 0-.036-.001-.054v.003c-.045-.044-.082-.096-.108-.154l-.001-.003-.081-.182c-.053-.084-.127-.15-.214-.192l-.003-.001c-.094-.045-.174-.102-.244-.169z"/> },

  // Frontend
  { name: "HTML5", color: "#e34f26", level: 4, category: "MARKUP", status: "ADVANCED", group: "FRONTEND", icon: <path d="M4.5 2h15l-1.2 13.5L12 18l-6.3-2.5L4.5 2zm3.1 3.5L7.7 14h2.2l.3-3.4 2.7 1.1.3-3.3-2.7-1 .2-2.2H12l.2 2.2 2.7 1-.3 3.3-2.7-1.1-.5 5.7H8.6l-.5-5.7-1.5.6z" /> },
  { name: "CSS3", color: "#1572b6", level: 4, category: "STYLING", status: "ADVANCED", group: "FRONTEND", icon: <path d="M4.5 2h15l-1.1 12.6L12 18l-6.4-3.4L4.5 2zm11.9 4.2H8.8l.2 2.2h7.1l-.6 6.8-3.7 1.2-3.7-1.2-.2-2.6h2l.1 1.4 2 .7 2-.7.3-2.8H7.9l-.5-5.8h9.8l-.1 1.1z" /> },
  { name: "JAVASCRIPT", color: "#f7df1e", level: 3, category: "LANGUAGE", status: "INTERMEDIATE", group: "FRONTEND", icon: <path d="M4 2h16v20l-8-4.5L4 22V2zm3.2 12.4l1.8 1.1c.4.7.7 1.3 1.5 1.3.8 0 1.3-.3 1.3-1.5V9.2h2.2v6.2c0 2.3-1.2 3.3-3 3.3-1.6 0-2.5-.8-3.2-1.8zm8.3 2.1c.8.8 1.7 1.4 3.4 1.4 1.4 0 2.3-.7 2.3-1.7 0-1.2-.9-1.6-2.4-2.3l-.8-.4c-2.4-1-4-2.3-4-5 0-2.5 1.9-4.4 4.9-4.4 2.1 0 3.6.7 4.7 2.6l-2.6 1.7c-.6-.9-1.2-1.3-2.1-1.3-.9 0-1.5.6-1.5 1.3 0 .9 1.1 1.3 2.9 1.9l1 .4c2.8 1.2 4.4 2.4 4.4 5.2 0 3-2.4 4.7-5.7 4.7-3.2 0-5.3-1.5-6.3-3.4l2.6-1.8z" /> },
];

const FILTERS = ["ALL", "LANGUAGES", "FRAMEWORKS", "AI ENGINEERING", "ML & DATA", "DEVOPS & DB", "FRONTEND"];

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filteredSkills = SKILLS_DATA.filter((skill) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "LANGUAGES") return skill.group === "LANGUAGE";
    if (activeFilter === "FRAMEWORKS") return skill.group === "FRAMEWORK";
    if (activeFilter === "AI ENGINEERING") return skill.group === "AI";
    if (activeFilter === "ML & DATA") return skill.group === "ML";
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
    <section id="skills" className="section-padding bg-transparent relative overflow-hidden py-24">
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
            <h4 className="text-sm text-muted mb-2 tracking-widest uppercase flex items-center gap-3">
              <span className="text-red font-bold">// 01</span>
              <span>&mdash; CAPABILITIES</span>
            </h4>
            <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter" style={{ fontFamily: 'monospace' }}>
              <span className="text-muted/30"></span>
              <TextReveal text="SKILLS" delay={0.2} className="mx-2 inline-flex" />
              <span className="text-muted/30"></span>
            </h2>
            <div className="w-16 h-[4px]" style={{ backgroundColor: 'var(--color-red)' }} />
          </ScrollReveal>
        </motion.div>

        {/* â”€â”€ RETRO BRUTALIST FILTER TABS â”€â”€ */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 text-xs font-mono max-w-3xl mx-auto px-4">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 border-2 border-border-strong uppercase transition-all duration-150 relative ${
                activeFilter === filter 
                  ? "bg-accent text-primary shadow-[2px_2px_0px_var(--color-red)] -translate-x-[1px] -translate-y-[1px]" 
                  : "bg-transparent text-muted hover:text-accent hover:border-accent"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {activeFilter === "ALL" ? (
          <div className="flex flex-col gap-4 md:gap-5 mt-4 min-h-[220px]">
            {skillRows.map((row, rowIndex) => (
              <SkillMarqueeRow
                key={`all-${rowIndex}`}
                skills={row}
                rowIndex={rowIndex}
                direction={rowIndex % 2 === 0 ? 'right' : 'left'}
                speed={28 + rowIndex * 6}
              />
            ))}
          </div>
        ) : (
        <motion.div 
            key={activeFilter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`flex flex-wrap justify-center gap-4 md:gap-5 mt-4 content-start ${
              filteredSkills.length === 4 ? 'min-h-0' : 'min-h-[220px]'
            }`}
          >
            {filteredSkills.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
        </motion.div>
        )}
      </div>
    </section>
  );
};

export default Skills;
