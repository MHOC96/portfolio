/**
 * ScrollPanel — a single full-viewport panel for use inside HorizontalScroll.
 * Each panel is exactly 100vw × 100vh and flex-shrink-0 to prevent collapsing.
 */
const ScrollPanel = ({ children, className = '' }) => (
  <div
    className={`w-screen h-[calc(100vh-4rem)] flex-shrink-0 flex items-center justify-center overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export default ScrollPanel;
