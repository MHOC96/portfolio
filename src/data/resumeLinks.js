export const RESUME_BACKEND_URL = import.meta.env.VITE_RESUME_BACKEND_URL?.trim() || '';
export const RESUME_AI_URL = import.meta.env.VITE_RESUME_AI_URL?.trim() || '';

/** @deprecated use RESUME_BACKEND_URL / RESUME_AI_URL */
export const LEGACY_RESUME_URL = import.meta.env.VITE_RESUME_URL?.trim() || '/resume.pdf';

export const RESUME_OPTIONS = [
  {
    id: 'backend',
    label: 'Backend Developer',
    description: 'Python, Django, FastAPI, APIs & systems',
    url: RESUME_BACKEND_URL,
  },
  {
    id: 'ai',
    label: 'AI Engineer',
    description: 'RAG, agents, LLMs & ML pipelines',
    url: RESUME_AI_URL,
  },
].filter((option) => option.url);

export const openResumeUrl = (url) => {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
};
