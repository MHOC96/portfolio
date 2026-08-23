import { useState, useEffect } from 'react';

const VisitorCounter = () => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    // Fetch and increment the counter
    fetch('https://api.counterapi.dev/v1/MHOC96/portfolio/up')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.count !== undefined) {
          setCount(data.count);
        }
      })
      .catch((err) => console.error('Failed to fetch visitor count:', err));
  }, []);

  if (count === null) return null;

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 border-2 bg-primary transition-colors" style={{ borderColor: 'var(--color-border-strong)', boxShadow: '4px 4px 0px var(--color-border-strong)' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" style={{ color: 'var(--color-red)' }}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <span className="font-mono text-xs tracking-widest uppercase font-bold text-muted">
        VISITORS: <span className="text-accent">{count.toLocaleString()}</span>
      </span>
    </div>
  );
};

export default VisitorCounter;
