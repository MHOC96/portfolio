import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import emailjs from '@emailjs/browser';
import ScrollReveal from '../ui/ScrollReveal';
import { useGeolocation } from '../../hooks/useGeolocation';
import TextReveal from '../ui/TextReveal';
import MagneticButton from '../ui/MagneticButton';
import { PROFILE } from '../../data/profile';

const Contact = () => {
  const ref = useRef(null);
  const formRef = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { locData } = useGeolocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null
  });

  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(PROFILE.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;

    // Map form field names to state property names
    const stateMapping = {
      'name': 'name',
      'email': 'email',
      'message': 'message'
    };

    setFormData({
      ...formData,
      [stateMapping[fieldName] || fieldName]: fieldValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot anti-spam check
    const honeypot = formRef.current?.querySelector('[name="website"]');
    if (honeypot && honeypot.value) {
      // Bot detected — silently ignore
      setStatus({ submitting: false, submitted: true, error: null });
      return;
    }

    setStatus({ submitting: true, submitted: false, error: null });

    // Fetch user info with fallbacks (helps if one is blocked by adblockers)
    let ip = locData.ip;
    let location = locData.fullLocation;
    let deviceName = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

    // EmailJS configuration
    const serviceId = import.meta.env.VITE_SERVICE_ID;
    const templateId = import.meta.env.VITE_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_PUBLIC_KEY;

    // Initialize EmailJS with your public key
    emailjs.init(publicKey);

    // Append info to message so it displays in email regardless of template
    const detailedMessage = `${formData.message}\n\n---\nSender Info:\nIP: ${ip}\nLocation: ${location}\nDevice: ${deviceName}`;

    // Prepare form data for EmailJS to match your template variables
    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: detailedMessage,
      title: `Portfolio Contact from ${formData.name}`, // Matches {{title}} in your screenshot
      ip: ip,
      location: location,
      device: deviceName
    };

    emailjs.send(serviceId, templateId, templateParams)
      .then((response) => {
        console.log('Email sent successfully:', response);
        setStatus({ submitting: false, submitted: true, error: null });
        setFormData({ name: '', email: '', message: '' });

        setTimeout(() => {
          setStatus(prev => ({ ...prev, submitted: false }));
        }, 5000);
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
        setStatus({ submitting: false, submitted: false, error: 'Failed to send message. Please try again.' });
      });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="contact" className="section-padding bg-transparent">
      <div className="container-custom" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <ScrollReveal delay={0}>
            <h4 className="font-mono text-sm text-muted mb-2"><span className="text-red">// 05</span> &mdash; GET IN TOUCH</h4>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-accent"><span className="glitch-hover" data-text="CONTACT ME">CONTACT ME</span></h2>
            <div className="w-16 h-[2px]" style={{ backgroundColor: 'var(--color-red)', opacity: 0.6 }}></div>
          </ScrollReveal>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.h3
              variants={itemVariants}
              className="text-xl font-medium mb-6"
            >
              Let's start a conversation
            </motion.h3>

            <div className="text-muted mb-8 text-lg font-mono leading-relaxed">
              <TextReveal text="Have a project in mind? Want to discuss collaboration opportunities? I'm always open to discussing new projects, creative ideas or opportunities to be part of your vision." />
            </div>

            <motion.div
              variants={containerVariants}
              className="space-y-6"
            >
              <motion.div
                variants={itemVariants}
                className="flex items-start"
              >
                <div className="mr-5 p-3 bg-primary" style={{ border: '2px solid var(--color-border-strong)', boxShadow: '4px 4px 0px var(--color-border-strong)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Email</h4>
                  <div className="flex items-center gap-3">
                    <a href={`mailto:${PROFILE.contact.email}`} className="text-muted hover:text-light transition-colors break-all">
                      {PROFILE.contact.email}
                    </a>
                    <button
                      onClick={copyEmail}
                      className="p-1.5 rounded-md hover:bg-secondary/40 text-muted hover:text-light transition-all flex-shrink-0"
                      title="Copy email address"
                    >
                      {copied ? (
                        <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-start"
              >
                <div className="mr-5 p-3 bg-primary" style={{ border: '2px solid var(--color-border-strong)', boxShadow: '4px 4px 0px var(--color-border-strong)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent">
                    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3522 21.4019C21.1472 21.5901 20.9053 21.7335 20.6441 21.8227C20.3829 21.9119 20.1085 21.9451 19.836 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.17C2.095 3.90347 2.12787 3.63526 2.21649 3.38398C2.30512 3.1327 2.44756 2.89566 2.63476 2.69384C2.82196 2.49202 3.0498 2.33062 3.30379 2.22073C3.55777 2.11084 3.83233 2.05504 4.10999 2.06H7.10999C7.5953 2.05522 8.06579 2.23344 8.43376 2.56009C8.80173 2.88674 9.04207 3.33942 9.10999 3.83C9.23662 4.82007 9.47144 5.79105 9.80999 6.72C9.94454 7.08225 9.97366 7.47501 9.8939 7.85353C9.81415 8.23206 9.62886 8.58045 9.35999 8.86L8.08999 10.13C9.51355 12.5815 11.5685 14.6365 14.02 16.06L15.29 14.79C15.5695 14.5211 15.9179 14.3358 16.2965 14.2561C16.675 14.1763 17.0678 14.2055 17.43 14.34C18.3589 14.6786 19.3299 14.9134 20.32 15.04C20.8204 15.1088 21.2793 15.3572 21.6055 15.7355C21.9317 16.1138 22.1022 16.5942 22.08 17.09L22 16.92Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Phone / WhatsApp</h4>
                  <div className="flex items-center gap-4">
                    <a
                      href={`tel:${PROFILE.contact.phoneE164}`}
                      className="text-muted hover:text-light transition-colors"
                    >
                      {PROFILE.contact.phone}
                    </a>
                    <a
                      href={PROFILE.contact.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted hover:text-light transition-colors"
                      title="Open WhatsApp"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-start"
              >
                <div className="mr-5 p-3 bg-primary" style={{ border: '2px solid var(--color-border-strong)', boxShadow: '4px 4px 0px var(--color-border-strong)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent">
                    <path d="M9 19C9 20.1046 7.65685 21 6 21C4.34315 21 3 20.1046 3 19C3 17.8954 4.34315 17 6 17C7.65685 17 9 17.8954 9 19ZM9 19V5C9 3.89543 9.89543 3 11 3H21C22.1046 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21M21 21C19.3431 21 18 20.1046 18 19C18 17.8954 19.3431 17 21 17C22.6569 17 24 17.8954 24 19C24 20.1046 22.6569 21 21 21ZM15 19C15 20.1046 13.6569 21 12 21C10.3431 21 9 20.1046 9 19C9 17.8954 10.3431 17 12 17C13.6569 17 15 17.8954 15 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Connect</h4>
                  <div className="flex flex-wrap gap-6 mt-4">
                    <a href={PROFILE.contact.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted hover:text-light transition-colors">
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.581 9.522 21.276 9.522 21.008C9.522 20.766 9.513 20.011 9.508 19.172C6.726 19.791 6.143 17.898 6.143 17.898C5.699 16.754 5.064 16.451 5.064 16.451C4.187 15.818 5.131 15.829 5.131 15.829C6.104 15.898 6.626 16.868 6.626 16.868C7.498 18.412 8.974 17.945 9.541 17.687C9.63 17.058 9.888 16.592 10.175 16.32C7.956 16.046 5.62 15.233 5.62 11.477C5.62 10.386 6.01 9.491 6.646 8.787C6.546 8.531 6.202 7.57 6.747 6.181C6.747 6.181 7.563 5.908 9.497 7.211C10.29 7.002 11.151 6.898 12.001 6.894C12.849 6.899 13.71 7.002 14.505 7.211C16.437 5.908 17.252 6.181 17.252 6.181C17.798 7.57 17.454 8.531 17.354 8.787C17.991 9.491 18.379 10.386 18.379 11.477C18.379 15.246 16.038 16.044 13.813 16.313C14.172 16.647 14.492 17.308 14.492 18.313C14.492 19.754 14.479 20.674 14.479 21.007C14.479 21.278 14.659 21.586 15.167 21.49C19.137 20.162 22 16.418 22 12C22 6.477 17.523 2 12 2Z" />
                      </svg>

                    </a>

                    {/* <a href="https://leetcode.com/u/Yashuroy08/" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted hover:text-light transition-colors">
                      <img src="https://leetcode.com/_next/static/images/logo-dark-c96c407d175e36c81e236fcfdd682a0b.png"
                        alt="LeetCode Logo"
                        className="w-6 h-6" />

                    </a> */}

                    <a href={PROFILE.contact.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted hover:text-light transition-colors">
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <form ref={formRef} onSubmit={handleSubmit} className="neo-card p-6 md:p-8 transition-all duration-300" style={{ boxShadow: '8px 8px 0px var(--color-border-strong)', borderColor: 'var(--color-border-strong)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-red)'; e.currentTarget.style.boxShadow = '8px 8px 0px var(--color-red)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.boxShadow = '8px 8px 0px var(--color-border-strong)'; }}>
              <h3 className="text-xl font-medium mb-6 uppercase tracking-widest border-b-2 border-border-strong pb-2 transition-colors duration-300">Send Message</h3>

              {/* Honeypot field — hidden from humans, catches bots */}
              <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                <input type="text" name="website" tabIndex="-1" autoComplete="off" />
              </div>

              <div className="mb-6 flex flex-col items-start w-full relative group">
                <label htmlFor="name" className="absolute -top-3 left-4 bg-primary px-2 font-mono text-[10px] tracking-widest uppercase transition-colors group-focus-within:text-red group-hover:text-red z-10" style={{ color: 'var(--color-muted)' }}>[ NAME ]</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent p-4 text-light font-mono focus:outline-none transition-all duration-200 z-0"
                  style={{ border: '2px solid var(--color-border-strong)', borderRadius: '0px' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-red)'; e.target.style.boxShadow = '4px 4px 0px var(--color-red)'; e.target.style.transform = 'translate(-2px, -2px)'; e.target.dataset.focused = 'true'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border-strong)'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'translate(0px, 0px)'; e.target.dataset.focused = 'false'; }}
                  onMouseEnter={e => { if (e.target.dataset.focused !== 'true') e.target.style.borderColor = 'var(--color-red)' }}
                  onMouseLeave={e => { if (e.target.dataset.focused !== 'true') e.target.style.borderColor = 'var(--color-border-strong)' }}
                  required
                />
              </div>

              <div className="mb-6 flex flex-col items-start w-full relative group">
                <label htmlFor="email" className="absolute -top-3 left-4 bg-primary px-2 font-mono text-[10px] tracking-widest uppercase transition-colors group-focus-within:text-red group-hover:text-red z-10" style={{ color: 'var(--color-muted)' }}>[ EMAIL_ADDRESS ]</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent p-4 text-light font-mono focus:outline-none transition-all duration-200 z-0"
                  style={{ border: '2px solid var(--color-border-strong)', borderRadius: '0px' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-red)'; e.target.style.boxShadow = '4px 4px 0px var(--color-red)'; e.target.style.transform = 'translate(-2px, -2px)'; e.target.dataset.focused = 'true'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border-strong)'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'translate(0px, 0px)'; e.target.dataset.focused = 'false'; }}
                  onMouseEnter={e => { if (e.target.dataset.focused !== 'true') e.target.style.borderColor = 'var(--color-red)' }}
                  onMouseLeave={e => { if (e.target.dataset.focused !== 'true') e.target.style.borderColor = 'var(--color-border-strong)' }}
                  required
                />
              </div>

              <div className="mb-8 flex flex-col items-start w-full relative group">
                <label htmlFor="message" className="absolute -top-3 left-4 bg-primary px-2 font-mono text-[10px] tracking-widest uppercase transition-colors group-focus-within:text-red group-hover:text-red z-10" style={{ color: 'var(--color-muted)' }}>[ MESSAGE ]</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full bg-transparent p-4 text-light font-mono focus:outline-none transition-all duration-200 z-0 resize-none"
                  style={{ border: '2px solid var(--color-border-strong)', borderRadius: '0px' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-red)'; e.target.style.boxShadow = '6px 6px 0px var(--color-red)'; e.target.style.transform = 'translate(-3px, -3px)'; e.target.dataset.focused = 'true'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border-strong)'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'translate(0px, 0px)'; e.target.dataset.focused = 'false'; }}
                  onMouseEnter={e => { if (e.target.dataset.focused !== 'true') e.target.style.borderColor = 'var(--color-red)' }}
                  onMouseLeave={e => { if (e.target.dataset.focused !== 'true') e.target.style.borderColor = 'var(--color-border-strong)' }}
                  required
                >
                </textarea>
              </div>

              <MagneticButton className="w-full" strength={10}>
                <button
                  type="submit"
                  className={`glitch-click w-full py-4 font-mono font-bold text-sm tracking-[0.2em] uppercase transition-all duration-100 flex items-center justify-center gap-3 ${status.submitting ? 'opacity-50 cursor-not-allowed hidden-shadow' : 'hover:bg-accent hover:text-primary cursor-pointer'}`}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-accent)',
                    border: '2px solid var(--color-accent)',
                    boxShadow: status.submitting ? '0px 0px 0px transparent' : '6px 6px 0px var(--color-accent)',
                    transform: status.submitting ? 'translate(0px, 0px)' : 'translate(-3px, -3px)'
                  }}
                  disabled={status.submitting}
                  onMouseDown={(e) => { if (!status.submitting) { e.currentTarget.style.transform = 'translate(3px, 3px)'; e.currentTarget.style.boxShadow = '0px 0px 0px var(--color-accent)'; } }}
                  onMouseUp={(e) => { if (!status.submitting) { e.currentTarget.style.transform = 'translate(-3px, -3px)'; e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-accent)'; } }}
                  onMouseLeave={(e) => { if (!status.submitting) { e.currentTarget.style.transform = 'translate(-3px, -3px)'; e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-accent)'; } }}
                >
                  {status.submitting ? '[ SENDING... ]' : '[ SEND MESSAGE]'}
                </button>
              </MagneticButton>

              {status.submitted && (
                <div className="mt-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 text-green-300 text-center">
                  Message sent successfully!
                </div>
              )}

              {status.error && (
                <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 text-center">
                  {status.error}
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;