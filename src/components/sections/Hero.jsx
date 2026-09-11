import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import TextDecode from '../ui/TextDecode';
import { useGeolocation } from '../../hooks/useGeolocation';
import Avatar from '../Avatar';
import VisitorCounter from '../ui/VisitorCounter';
import TextReveal from '../ui/TextReveal';
import MagneticButton from '../ui/MagneticButton';
import { PROFILE } from '../../data/profile';


const ROLES = PROFILE.roles;

const TypewriterRole = () => {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);

  // Blink cursor independently
  useEffect(() => {
    const id = setInterval(() => setCursorOn(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  // Typing engine
  useEffect(() => {
    const current = ROLES[roleIdx];
    let timeout;

    if (!isDeleting && displayed.length < current.length) {
      // Still typing
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 75);
    } else if (!isDeleting && displayed.length === current.length) {
      // Pause at end, then start deleting
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayed.length > 0) {
      // Erasing
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 40);
    } else if (isDeleting && displayed.length === 0) {
      // Move to next role
      setIsDeleting(false);
      setRoleIdx(i => (i + 1) % ROLES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, roleIdx]);

  return (
    <span className="inline-flex items-center min-w-0 sm:min-w-[12ch] md:min-w-[18ch] max-w-full">
      <span className="break-words">{displayed}</span>
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          marginLeft: '3px',
          backgroundColor: 'var(--color-red)',
          opacity: cursorOn ? 1 : 0,
          verticalAlign: 'middle',
          transition: 'opacity 0.1s',
        }}
      />
    </span>
  );
};

const Hero = () => {
  const sectionRef = useRef(null);

  const { locData } = useGeolocation();

  // Scroll progress tied to the hero section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Spring-smooth scroll values
  const smoothY = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  // Parallax layers — px values only (% strings crash framer-motion's accelerated animation resolver)
  const textY = useTransform(smoothY, [0, 1], [0, -220]);
  const avatarY = useTransform(smoothY, [0, 1], [0, -100]);
  const bgY = useTransform(smoothY, [0, 1], [0, 180]);
  const titleScale = useTransform(smoothY, [0, 0.5], [1, 0.92]);
  const opacity = useTransform(smoothY, [0, 0.75], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="min-h-screen flex items-center relative overflow-hidden bg-transparent pt-[5.25rem] md:pt-16"
    >
      {/* Slow-drifting depth background ring */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden
      >
        <div
          className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[min(500px,90vw)] h-[min(500px,90vw)] opacity-[0.05]"
          style={{ border: '2px solid var(--color-red)', transform: 'rotate(15deg)' }}
        />
        <div
          className="absolute top-[60%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-[min(700px,95vw)] h-[min(700px,95vw)] opacity-[0.03]"
          style={{ border: '2px solid var(--color-accent)', transform: 'rotate(-5deg)' }}
        />
      </motion.div>

      <div className="container-custom relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

          {/* ── TEXT LAYER — moves up faster on scroll ── */}
          <motion.div
            style={{ y: textY, scale: titleScale, opacity }}
            className="w-full lg:w-3/5 text-center lg:text-left"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div variants={childVariants} className="mb-8">
                <h2
                  className="font-mono text-[11px] tracking-[0.5em] mb-6"
                  style={{ color: 'var(--color-red)', opacity: 0.7 }}
                >
                  // SYSTEM.INIT
                </h2>

                {/* Name */}
                <h2 className="font-mono tracking-tighter text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-3 leading-none break-words">
                  <TextDecode
                    text={`${PROFILE.firstName} ${PROFILE.lastName}`}
                    className="glitch-hover"
                    style={{ cursor: 'crosshair' }}
                    speed={35}
                    stagger={2}
                  />
                </h2>

                {/* Typewriter cycling role — fixed height prevents bio text below from jumping */}
                <div
                  className="flex items-center justify-center lg:justify-start gap-0 font-mono text-base sm:text-xl md:text-3xl lg:text-4xl font-semibold mb-5 tracking-tight whitespace-normal sm:whitespace-nowrap min-h-[1.75rem] md:min-h-[2.25rem] lg:min-h-[2.75rem] max-w-full"
                  style={{ color: 'var(--color-red)' }}
                >
                  <TypewriterRole />
                </div>

                <div className="text-muted text-sm md:text-base font-mono tracking-wide max-w-lg mx-auto lg:mx-0 mt-4 mb-8 border-l-4 pl-4" style={{ borderColor: 'var(--color-red)' }}>
                  <TextReveal text={PROFILE.bio} />
                  <br />
                  <TextReveal text={`/* ${PROFILE.focus} */`} className="text-accent opacity-75 mt-2" delay={0.4} />
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 border-2 bg-primary" style={{ borderColor: 'var(--color-accent)', boxShadow: '4px 4px 0px var(--color-accent)' }}>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--color-accent)' }} />
                      <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: 'var(--color-accent)' }} />
                    </span>
                    <span className="font-mono text-xs tracking-widest uppercase font-bold text-accent">
                      STATUS: {PROFILE.status}
                    </span>
                  </div>
                  <VisitorCounter />
                </div>
              </motion.div>

              <motion.div
                variants={childVariants}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-14"
              >
                <MagneticButton>
                  <a href={PROFILE.contact.github} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest px-4 py-3 border-2 transition-all"
                    style={{ borderColor: 'var(--color-border-strong)' }}>
                    <svg className="w-5 h-5 group-hover:text-red transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.581 9.522 21.276 9.522 21.008C9.522 20.766 9.513 20.011 9.508 19.172C6.726 19.791 6.143 17.898 6.143 17.898C5.699 16.754 5.064 16.451 5.064 16.451C4.187 15.818 5.131 15.829 5.131 15.829C6.104 15.898 6.626 16.868 6.626 16.868C7.498 18.412 8.974 17.945 9.541 17.687C9.63 17.058 9.888 16.592 10.175 16.32C7.956 16.046 5.62 15.233 5.62 11.477C5.62 10.386 6.01 9.491 6.646 8.787C6.546 8.531 6.202 7.57 6.747 6.181C6.747 6.181 7.563 5.908 9.497 7.211C10.29 7.002 11.151 6.898 12.001 6.894C12.849 6.899 13.71 7.002 14.505 7.211C16.437 5.908 17.252 6.181 17.252 6.181C17.798 7.57 17.454 8.531 17.354 8.787C17.991 9.491 18.379 10.386 18.379 11.477C18.379 15.246 16.038 16.044 13.813 16.313C14.172 16.647 14.492 17.308 14.492 18.313C14.492 19.754 14.479 20.674 14.479 21.007C14.479 21.278 14.659 21.586 15.167 21.49C19.137 20.162 22 16.418 22 12C22 6.477 17.523 2 12 2Z" />
                    </svg>
                    <span className="group-hover:text-red transition-colors">GITHUB</span>
                  </a>
                </MagneticButton>

                <MagneticButton>
                  <a href={PROFILE.contact.linkedin} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest px-4 py-3 border-2 transition-all"
                    style={{ borderColor: 'var(--color-border-strong)' }}>
                    <svg className="w-5 h-5 group-hover:text-red transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.0003 3H5.00031C3.89574 3 3.00031 3.89543 3.00031 5V19C3.00031 20.1046 3.89574 21 5.00031 21H19.0003C20.1048 21 21.0003 20.1046 21.0003 19V5C21.0003 3.89543 20.1048 3 19.0003 3ZM8.30031 18.4H5.30031V9.7H8.30031V18.4ZM6.80031 8.5C5.80031 8.5 5.00031 7.7 5.00031 6.8C5.00031 5.8 5.80031 5 6.80031 5C7.80031 5 8.50031 5.8 8.50031 6.8C8.50031 7.7 7.80031 8.5 6.80031 8.5ZM18.7003 18.4H15.7003V13.8C15.7003 12.7 15.7003 11.2 14.1003 11.2C12.4003 11.2 12.2003 12.6 12.2003 13.7V18.5H9.20031V9.7H12.0003V10.9H12.1003C12.4003 10.3 13.2003 9.5 14.7003 9.5C17.5003 9.5 18.1003 11.3 18.1003 13.7V18.4H18.7003Z" />
                    </svg>
                    <span className="group-hover:text-red transition-colors">LINKEDIN</span>
                  </a>
                </MagneticButton>
              </motion.div>

              <motion.div
                variants={childVariants}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
              >
                <MagneticButton strength={20}>
                  <a href="#projects" className="glitch-click group flex items-center justify-center font-bold text-xs tracking-widest uppercase transition-all duration-200 text-white bg-red border-2 border-accent"
                    style={{
                      backgroundColor: 'var(--color-red)',
                      padding: '1rem 2rem',
                      boxShadow: '4px 4px 0px var(--color-accent)',
                      transform: 'translate(-2px, -2px)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '0px 0px 0px var(--color-accent)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '4px 4px 0px var(--color-accent)'; }}>
                    EXPLORE_PROJECTS
                  </a>
                </MagneticButton>
                <MagneticButton strength={20}>
                  <a href={import.meta.env.VITE_RESUME_URL || '/resume.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glitch-click group flex items-center justify-center font-bold text-xs tracking-widest uppercase transition-all duration-200 text-red bg-primary border-2 border-red mt-2 sm:mt-0"
                    style={{
                      padding: '1rem 2rem',
                      boxShadow: '4px 4px 0px var(--color-red)',
                      transform: 'translate(-2px, -2px)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '0px 0px 0px var(--color-red)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '4px 4px 0px var(--color-red)'; }}>
                    VIEW_RESUME
                  </a>
                </MagneticButton>
              </motion.div>

              <motion.div
                variants={childVariants}
                className="mt-8 flex items-center gap-4 text-xs font-mono text-muted/50 uppercase tracking-widest"
              >
                <div className="flex flex-col border-l-2 pl-3" style={{ borderColor: 'var(--color-red)' }}>
                  <span>SYS.LOC: {locData.city}, {locData.countryCode}</span>
                  <span>LAT: {Math.abs(locData.lat).toFixed(4)}° {locData.lat >= 0 ? 'N' : 'S'}</span>
                  <span>LNG: {Math.abs(locData.lon).toFixed(4)}° {locData.lon >= 0 ? 'E' : 'W'}</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── AVATAR LAYER — moves at slower rate (3D depth illusion) ── */}
          <motion.div
            style={{ y: avatarY, opacity }}
            className="w-full lg:w-2/5 flex justify-center lg:justify-end"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative hidden md:block"
            >
              <div className="absolute inset-0 bg-light opacity-[0.03] blur-[60px] rounded-full scale-125" />
              <Avatar />
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll-down cue */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[1px] h-10 origin-top"
          style={{ backgroundColor: 'var(--color-red)', opacity: 0.5 }}
        />
        <span className="font-mono text-[9px] tracking-[0.4em] text-muted uppercase opacity-50">scroll</span>
      </motion.div>
    </section>
  );
};

export default Hero;
