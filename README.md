# Oshadha Canchana | Portfolio

Personal portfolio for **Oshadha Canchana** — Backend Developer, Python Developer, and AI Engineer. Built with a neo-brutalist, Nothing OS–inspired aesthetic: sharp borders, monospace typography, and a red accent palette.

## Features

- **Hero** — Animated intro, interactive avatar, availability status, resume download
- **Skills** — Filterable tech stack with marquee rows on the ALL tab
- **Projects** — Horizontal scroll showcase with architecture diagrams
- **Experience & Education** — Timeline with sticky photo panel
- **Contact** — EmailJS form, WhatsApp, phone, GitHub, LinkedIn
- **MHOC** — AI assistant powered by Groq (`openai/gpt-oss-120b`), grounded in portfolio data
- **Terminals** — Command palette (`TerminalFeature`) and draggable floating terminal
- **Music player** — Ambient background player
- **Effects** — Lenis smooth scroll, animated background, cursor bubble, sound effects

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Routing | React Router |
| Contact | EmailJS |
| Chatbot | Groq API (OpenAI-compatible) |
| Scroll | Lenis |
| Deploy | Vercel |

## Project structure

```
src/
├── components/
│   ├── sections/     # Hero, Skills, Projects, Education, Contact
│   ├── features/     # MHOC chat, terminals, loader, music player
│   ├── layout/       # Header, footer
│   ├── effects/      # Background, smooth scroll, cursor
│   └── ui/           # Reusable UI primitives
├── data/             # Single source of truth for site + MHOC
│   ├── profile.js
│   ├── skillsMeta.js
│   ├── projectsMeta.js
│   ├── timeline.js
│   └── buildPortfolioContext.js
└── hooks/            # Geolocation, idle detection
```

Update content in `src/data/` — sections and MHOC stay in sync automatically.

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/MHOC96/Portfolio.git
cd Portfolio
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your keys:

```env
VITE_GROQ_API_KEY=gsk_your_key_here
VITE_GROQ_MODEL=openai/gpt-oss-120b
VITE_SERVICE_ID=your_emailjs_service_id
VITE_TEMPLATE_ID=your_emailjs_template_id
VITE_PUBLIC_KEY=your_emailjs_public_key
VITE_RESUME_URL=/resume.pdf
```

| Variable | Purpose |
|----------|---------|
| `VITE_GROQ_API_KEY` | Groq API key for MHOC chatbot ([console.groq.com](https://console.groq.com/keys)) |
| `VITE_GROQ_MODEL` | Model ID (default: `openai/gpt-oss-120b`) |
| `VITE_SERVICE_ID` | EmailJS service ID |
| `VITE_TEMPLATE_ID` | EmailJS template ID |
| `VITE_PUBLIC_KEY` | EmailJS public key |
| `VITE_RESUME_URL` | Resume file path or external URL |

> **Note:** `VITE_*` variables are exposed in the browser bundle. Do not put secrets you cannot rotate publicly. For production, consider proxying the chat API through a server.

### 3. Add resume

Place your resume at `public/resume.pdf`, or set `VITE_RESUME_URL` to an external link.

> **Production deploy:** `public/resume.pdf` must be committed to git (it is explicitly allowed in `.gitignore`). If the PDF is only on your machine, Vercel will not have it and `/resume.pdf` will show a 404 page.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for production

```bash
npm run build
npm run preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Customization

| What to change | Where |
|----------------|-------|
| Name, bio, contact | `src/data/profile.js` |
| Skills list | `src/data/skillsMeta.js` |
| Projects | `src/data/projectsMeta.js` |
| Experience & education | `src/data/timeline.js` |
| MHOC system prompt rules | `src/data/buildPortfolioContext.js` |
| Project architecture diagrams | `src/components/sections/Projects.jsx` |
| OG / meta tags | `index.html` |

## Contact

- **Email:** oshadhacanchana@gmail.com
- **Phone / WhatsApp:** +94 701246602
- **GitHub:** [MHOC96](https://github.com/MHOC96)
- **LinkedIn:** [oshadha-canchana](https://www.linkedin.com/in/oshadha-canchana/)

## License

Personal portfolio project. Use for inspiration; please do not copy verbatim without attribution.

---

Developed by **Oshadha Canchana**
