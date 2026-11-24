import { DECK_META } from '../slideData.js';

/**
 * SlideFrame — Fixed 1280x720 Editorial Academic slide wrapper.
 *
 * Consumes canonical --pres-* design tokens scoped under .present-root.
 * Supports three visually distinct architectural variants:
 *   - "cover":   Archival warm-ivory canvas with bold Oxford Navy left spine.
 *   - "content": 3px Oxford Navy top edge, balanced editorial header, generous margins.
 *   - "closing": High-contrast Oxford Navy architectural Q&A plate (bookend).
 *
 * Inner usable content dimensions inside .slide-body-content:
 *   - variant="content": 1176px x 538px (52px horizontal margins, 20px vertical padding)
 *   - variant="cover":   1166px x 596px (62px left spine clearance, 52px right)
 *   - variant="closing": 1166px x 596px (Oxford Navy architectural Q&A plate)
 */

const padTwo = (value) => String(value ?? 1).padStart(2, '0');

export default function SlideFrame({
  slideNumber = 1,
  totalSlides,
  section,
  title,
  subtitle,
  variant = 'content',
  footnote,
  meta = DECK_META,
  className = '',
  children,
}) {
  const isContent = variant === 'content';
  const isCover = variant === 'cover';
  const isClosing = variant === 'closing';

  const resolvedTotal = totalSlides ?? meta?.totalSlides ?? 13;
  const formattedPage = `${padTwo(slideNumber)} / ${padTwo(resolvedTotal)}`;

  const indexNo = meta?.indexNo || '25688';
  const regNo = meta?.regNo || '112219';
  const shortTitle = meta?.shortTitle || 'Task-to-Provider Authorization Gateway for Multi-Server MCP';

  const canvasClass = [
    'slide-canvas',
    isCover ? 'slide-canvas--cover' : '',
    isClosing ? 'slide-canvas--closing' : '',
    isContent ? 'slide-canvas--content' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const bodyClass = isContent
    ? 'slide-body slide-body--content'
    : isClosing
      ? 'slide-body slide-body--closing'
      : 'slide-body slide-body--cover';

  return (
    <article
      className={canvasClass}
      data-slide-number={slideNumber}
      data-slide-variant={variant}
      aria-label={title ? `Slide ${slideNumber}: ${title}` : `Slide ${slideNumber}`}
    >
      {/* Architectural edge accent — varies cleanly by slide role */}
      {isContent && <div className="slide-accent-bar" aria-hidden="true" />}
      {isCover && <div className="slide-cover-spine" aria-hidden="true" />}
      {isClosing && <div className="slide-closing-spine" aria-hidden="true" />}

      {/* Editorial Header (Content Slides Only) */}
      {isContent && (
        <header className="slide-header">
          <div className="slide-header-inner">
            <div className="slide-header-left">
              {section && <div className="slide-eyebrow">{section}</div>}
              {title && <h1 className="slide-title">{title}</h1>}
            </div>

            {subtitle && <p className="slide-subtitle">{subtitle}</p>}
          </div>
        </header>
      )}

      {/* Main Slide Body */}
      <section className={bodyClass}>
        <div className="slide-body-content">{children}</div>
        {footnote && <div className="slide-footnote">{footnote}</div>}
      </section>

      {/* Mandatory Academic Footer on Every Slide */}
      <footer className="slide-footer">
        <div className="slide-footer-id">
          <span>Index No: {indexNo}</span>
          <span className="slide-footer-sep" aria-hidden="true">
            |
          </span>
          <span>Reg No: {regNo}</span>
        </div>

        <div className="slide-footer-title">{shortTitle}</div>

        <div
          className="slide-footer-page"
          aria-label={`Slide ${slideNumber} of ${resolvedTotal}`}
        >
          {formattedPage}
        </div>
      </footer>
    </article>
  );
}
