import { Fragment, useEffect, useRef, useState } from 'react';
import {
  hasSinhalaScript,
  parseInlineTokens,
  parseMobileBlocks,
} from '../../lib/parseMobileChatMessage';

const SUPPORTS_COLOR_MIX =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('color', 'color-mix(in srgb, #ffffff 10%, transparent)');

const THEME = {
  borderColor: SUPPORTS_COLOR_MIX
    ? 'color-mix(in srgb, var(--color-accent) 14%, transparent)'
    : 'rgba(128, 128, 128, 0.24)',
  surfaceSubtle: SUPPORTS_COLOR_MIX
    ? 'color-mix(in srgb, var(--color-accent) 4%, transparent)'
    : 'var(--color-surface)',
  surfaceChip: SUPPORTS_COLOR_MIX
    ? 'color-mix(in srgb, var(--color-accent) 6%, transparent)'
    : 'var(--color-surface)',
  surfacePill: SUPPORTS_COLOR_MIX
    ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)'
    : 'var(--color-surface)',
  redBorder: SUPPORTS_COLOR_MIX
    ? 'color-mix(in srgb, var(--color-red) 36%, transparent)'
    : 'rgba(255, 51, 51, 0.36)',
  redSurfaceSubtle: SUPPORTS_COLOR_MIX
    ? 'color-mix(in srgb, var(--color-red) 7%, transparent)'
    : 'rgba(255, 51, 51, 0.08)',
  redSurfaceChip: SUPPORTS_COLOR_MIX
    ? 'color-mix(in srgb, var(--color-red) 13%, transparent)'
    : 'rgba(255, 51, 51, 0.13)',
};

const LINK_CLASSES =
  'font-medium text-accent underline underline-offset-4 decoration-[rgba(128,128,128,0.45)] hover:decoration-[var(--color-red)] focus-visible:decoration-[var(--color-red)] active:opacity-75 transition-colors';

const isSafeHref = (href) =>
  typeof href === 'string' &&
  /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#|\.\.?\/)/i.test(href.trim());

const isExternalHref = (href) =>
  typeof href === 'string' && /^https?:\/\//i.test(href.trim());

function StreamingCursor() {
  return (
    <span
      aria-hidden="true"
      className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-1 rounded-full bg-[var(--color-red)] animate-pulse"
    />
  );
}

function InlineTokens({ tokens, isStreaming = false }) {
  if (!Array.isArray(tokens) || tokens.length === 0) return null;

  return (
    <>
      {tokens.map((token, idx) => {
        if (token.type === 'bold') {
          return (
            <strong key={idx} className="font-semibold text-accent">
              {token.children ? (
                <InlineTokens tokens={token.children} isStreaming={isStreaming} />
              ) : (
                token.value
              )}
            </strong>
          );
        }

        if (token.type === 'italic') {
          return (
            <em key={idx} className="italic text-light">
              {token.children ? (
                <InlineTokens tokens={token.children} isStreaming={isStreaming} />
              ) : (
                token.value
              )}
            </em>
          );
        }

        if (token.type === 'strikethrough') {
          return (
            <del key={idx} className="line-through text-muted">
              {token.children ? (
                <InlineTokens tokens={token.children} isStreaming={isStreaming} />
              ) : (
                token.value
              )}
            </del>
          );
        }

        if (token.type === 'code') {
          return (
            <code
              key={idx}
              style={{
                borderColor: THEME.borderColor,
                backgroundColor: THEME.surfaceChip,
              }}
              className="rounded-md border px-1.5 py-[1px] font-mono text-[13px] leading-[1.35] text-accent break-words"
            >
              {token.value}
            </code>
          );
        }

        if (token.type === 'link') {
          const labelContent =
            Array.isArray(token.labelTokens) && token.labelTokens.length > 0 ? (
              <InlineTokens tokens={token.labelTokens} isStreaming={isStreaming} />
            ) : (
              token.label || token.url
            );

          if (!isSafeHref(token.url)) {
            return <Fragment key={idx}>{labelContent}</Fragment>;
          }

          const external = isExternalHref(token.url);
          return (
            <a
              key={idx}
              href={token.url}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className={LINK_CLASSES}
            >
              {labelContent}
              {external && <span className="sr-only"> (opens in new tab)</span>}
            </a>
          );
        }

        if (token.type === 'email') {
          return (
            <a key={idx} href={`mailto:${token.value}`} className={LINK_CLASSES}>
              {token.value}
            </a>
          );
        }

        if (token.type === 'phone') {
          const href = token.href || `tel:${token.display}`;
          if (!isSafeHref(href)) {
            return <Fragment key={idx}>{token.display}</Fragment>;
          }
          return (
            <a key={idx} href={href} className={`${LINK_CLASSES} whitespace-nowrap`}>
              {token.display}
            </a>
          );
        }

        return <Fragment key={idx}>{token.value}</Fragment>;
      })}
    </>
  );
}

function InlineText({ text, isStreaming = false, showCursor = false }) {
  const tokens = parseInlineTokens(text ?? '', { isStreaming });

  return (
    <>
      <InlineTokens tokens={tokens} isStreaming={isStreaming} />
      {showCursor && <StreamingCursor />}
    </>
  );
}

function ActionIcon({ kind }) {
  const normalized = (kind || '').toLowerCase();

  if (normalized === 'email' || normalized === 'mail') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0 text-muted"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    );
  }

  if (normalized === 'phone' || normalized === 'call' || normalized === 'tel') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0 text-muted"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }

  if (normalized === 'whatsapp') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0 text-muted"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    );
  }

  if (normalized === 'github') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0 text-muted"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }

  if (normalized === 'linkedin') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0 text-muted"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-muted"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    const codeText = block.code ?? '';
    let didCopy = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(codeText);
        didCopy = true;
      } catch {
        didCopy = false;
      }
    }

    if (!didCopy && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = codeText;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        didCopy = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        didCopy = false;
      }
    }

    if (didCopy) {
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopied(false), 1800);
    }
  };

  const languageLabel = block.language || 'code';

  return (
    <div
      style={{
        borderColor: THEME.borderColor,
        backgroundColor: THEME.surfaceSubtle,
      }}
      className="min-w-0 max-w-full rounded-xl border overflow-hidden"
    >
      <div
        style={{
          borderColor: THEME.borderColor,
          backgroundColor: THEME.surfaceChip,
        }}
        className="flex items-center justify-between gap-2 border-b px-3 py-1"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-red)] shrink-0"
          />
          <span className="font-mono text-[11px] font-medium text-accent truncate">
            {languageLabel}
          </span>
          {block.meta && (
            <span className="font-mono text-[10.5px] text-muted truncate">
              {block.meta}
            </span>
          )}
          {block.isStreaming && (
            <span className="font-mono text-[10px] text-[var(--color-red)] shrink-0">
              streaming
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setWrap((prev) => !prev)}
            aria-pressed={wrap}
            className="inline-flex items-center justify-center min-h-[36px] px-2 rounded-md font-mono text-[11px] text-muted hover:text-accent active:opacity-75 transition-colors"
          >
            {wrap ? 'Scroll' : 'Wrap'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied code' : 'Copy code'}
            style={{
              borderColor: copied ? THEME.redBorder : THEME.borderColor,
              backgroundColor: copied ? THEME.redSurfaceChip : THEME.surfacePill,
            }}
            className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-2.5 rounded-md border font-mono text-[11px] font-medium text-accent active:scale-[0.98] transition-all"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="text-[var(--color-red)]"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="text-muted"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <pre
        tabIndex={0}
        className={`max-w-full overflow-x-auto p-3 font-mono text-[12.5px] leading-[1.6] text-light focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-red)] ${
          wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
        }`}
      >
        <code>{block.code}</code>
      </pre>
    </div>
  );
}

function HeadingBlock({ block, isStreaming, showCursor }) {
  const level = Math.min(Math.max(Number(block.level) || 2, 1), 6);
  const headingHasSinhala = hasSinhalaScript(block.text || '');

  if (level <= 2) {
    return (
      <h3
        style={{ borderColor: THEME.borderColor }}
        className={`flex items-center gap-2 pt-1.5 pb-1.5 font-semibold text-accent border-b ${
          level === 1 ? 'text-[16px]' : 'text-[15px]'
        }`}
      >
        <span
          aria-hidden="true"
          className="w-[3px] h-4 rounded-full bg-[var(--color-red)] shrink-0"
        />
        <span className="min-w-0 flex-1">
          <InlineText
            text={block.text}
            isStreaming={isStreaming}
            showCursor={showCursor}
          />
        </span>
      </h3>
    );
  }

  if (level === 3) {
    return (
      <h4 className="pt-1 text-[14px] font-semibold text-accent">
        <InlineText
          text={block.text}
          isStreaming={isStreaming}
          showCursor={showCursor}
        />
      </h4>
    );
  }

  return (
    <h5
      className={`pt-0.5 text-[12.5px] font-semibold text-muted ${
        headingHasSinhala ? '' : 'uppercase tracking-[0.06em]'
      }`}
    >
      <InlineText
        text={block.text}
        isStreaming={isStreaming}
        showCursor={showCursor}
      />
    </h5>
  );
}

function MessageList({ block, isStreaming, showCursor, nested = false }) {
  const items = Array.isArray(block.items) ? block.items : [];
  if (!items.length) return null;

  const ListTag = block.ordered ? 'ol' : 'ul';
  const startNum = block.ordered && Number.isFinite(block.start) ? block.start : 1;

  return (
    <ListTag
      start={block.ordered && startNum !== 1 ? startNum : undefined}
      className={`${nested ? 'mt-2 space-y-1.5' : 'space-y-2'} list-none pl-0`}
    >
      {items.map((rawItem, itemIdx) => {
        const item =
          typeof rawItem === 'string' ? { text: rawItem, children: [] } : rawItem;
        const isLastItem = showCursor && itemIdx === items.length - 1;
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        const isTask = typeof item.checked === 'boolean';
        const displayNum =
          item.number !== undefined ? item.number : startNum + itemIdx;

        return (
          <li key={itemIdx} className="flex items-start gap-2 text-light min-w-0">
            {isTask ? (
              <span
                role="img"
                aria-label={item.checked ? 'Completed task' : 'Incomplete task'}
                style={{
                  borderColor: item.checked ? THEME.redBorder : THEME.borderColor,
                  backgroundColor: item.checked
                    ? THEME.redSurfaceChip
                    : THEME.surfaceChip,
                }}
                className="inline-flex items-center justify-center w-4 h-4 rounded border shrink-0 mt-[4px]"
              >
                {item.checked && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="text-[var(--color-red)]"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
            ) : (
              <span
                aria-hidden="true"
                className={`min-w-[1.25rem] shrink-0 font-mono text-[12px] select-none pt-[2px] ${
                  block.ordered
                    ? 'text-right tabular-nums font-semibold text-[var(--color-red)]'
                    : 'text-center text-[var(--color-red)]'
                }`}
              >
                {block.ordered ? `${displayNum}.` : '•'}
              </span>
            )}

            <div className="flex-1 min-w-0">
              <span
                className={`whitespace-pre-line ${
                  isTask && item.checked ? 'line-through text-muted' : ''
                }`}
              >
                <InlineText
                  text={item.text}
                  isStreaming={isStreaming}
                  showCursor={isLastItem && !hasChildren}
                />
              </span>

              {hasChildren &&
                item.children.map((childList, childIdx) => (
                  <MessageList
                    key={childIdx}
                    block={childList}
                    isStreaming={isStreaming}
                    showCursor={isLastItem && childIdx === item.children.length - 1}
                    nested
                  />
                ))}
            </div>
          </li>
        );
      })}
    </ListTag>
  );
}

function TableBlock({ block, isStreaming }) {
  const headers = Array.isArray(block.headers) ? block.headers : [];
  const rows = Array.isArray(block.rows) ? block.rows : [];
  const alignments = Array.isArray(block.alignments) ? block.alignments : [];

  if (!headers.length) return null;

  const alignClass = (colIdx) => {
    const align = alignments[colIdx];
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div
      style={{
        borderColor: THEME.borderColor,
        backgroundColor: THEME.surfaceSubtle,
      }}
      className="min-w-0 max-w-full overflow-x-auto rounded-xl border"
    >
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr
            style={{
              borderColor: THEME.borderColor,
              backgroundColor: THEME.surfaceChip,
            }}
            className="border-b"
          >
            {headers.map((header, colIdx) => (
              <th
                key={colIdx}
                scope="col"
                className={`px-3 py-2 font-semibold text-accent whitespace-nowrap ${alignClass(
                  colIdx
                )}`}
              >
                <InlineText text={header} isStreaming={isStreaming} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              style={{
                borderColor: THEME.borderColor,
                backgroundColor:
                  rowIdx % 2 === 1 ? THEME.surfaceChip : 'transparent',
              }}
              className="border-t first:border-t-0"
            >
              {headers.map((_, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-3 py-2 align-top text-light ${alignClass(colIdx)}`}
                >
                  <InlineText
                    text={row[colIdx] ?? ''}
                    isStreaming={isStreaming}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlockquoteBlock({ block, isStreaming, showCursor }) {
  const innerBlocks = parseMobileBlocks(block.text || '', {
    isStreaming,
    includeContactActions: false,
  });

  return (
    <blockquote
      style={{ backgroundColor: THEME.surfaceSubtle }}
      className="min-w-0 border-l-[3px] border-[var(--color-red)] rounded-r-lg pl-3.5 pr-3 py-2 space-y-2 text-light"
    >
      {innerBlocks.length > 0 ? (
        <RenderBlocks
          blocks={innerBlocks}
          isStreaming={isStreaming}
          showTrailingCursor={showCursor}
        />
      ) : (
        <p className="whitespace-pre-line">
          <InlineText
            text={block.text}
            isStreaming={isStreaming}
            showCursor={showCursor}
          />
        </p>
      )}
    </blockquote>
  );
}

function ProjectCard({ block, isStreaming }) {
  const indexLabel =
    block.index !== undefined && block.index !== null
      ? String(block.index).padStart(2, '0')
      : null;
  const techItems = Array.isArray(block.tech) ? block.tech.filter(Boolean) : [];
  const links = Array.isArray(block.links)
    ? block.links.filter((l) => l && isSafeHref(l.url))
    : [];

  return (
    <article
      style={{
        borderColor: THEME.borderColor,
        backgroundColor: THEME.surfaceSubtle,
      }}
      className="min-w-0 max-w-full overflow-hidden rounded-xl border p-3.5 space-y-2.5"
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {indexLabel && (
          <span
            style={{
              borderColor: THEME.redBorder,
              backgroundColor: THEME.redSurfaceChip,
            }}
            className="inline-flex items-center justify-center shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-semibold text-accent tabular-nums mt-[2px]"
          >
            {indexLabel}
          </span>
        )}
        <h4 className="flex-1 min-w-0 text-[15px] font-semibold leading-snug text-accent">
          <InlineText text={block.title} isStreaming={isStreaming} />
        </h4>
      </div>

      {block.summary && (
        <p className="text-[13.5px] leading-[1.6] text-light whitespace-pre-line">
          <InlineText text={block.summary} isStreaming={isStreaming} />
        </p>
      )}

      {techItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {techItems.map((item, idx) => (
            <span
              key={idx}
              style={{
                borderColor: THEME.borderColor,
                backgroundColor: THEME.surfaceChip,
              }}
              className="inline-flex items-center max-w-full break-words rounded-md border px-2 py-0.5 text-[11px] font-medium text-light"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-0.5 min-w-0">
          {links.map((link, idx) => {
            const label = link.label || link.kind || 'Open';
            const external = isExternalHref(link.url);
            const hasArrow = /[↗→]$/.test(label.trim());

            return (
              <a
                key={idx}
                href={link.url}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                style={{
                  borderColor: THEME.borderColor,
                  backgroundColor: THEME.surfacePill,
                }}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] max-w-full rounded-lg border px-3 py-2 text-[13px] font-medium text-accent hover:border-[var(--color-red)] active:scale-[0.98] transition-all"
              >
                <span className="truncate">{label}</span>
                {!hasArrow && (
                  <span
                    aria-hidden="true"
                    className="text-[var(--color-red)] text-xs leading-none shrink-0"
                  >
                    ↗
                  </span>
                )}
                {external && <span className="sr-only"> (opens in new tab)</span>}
              </a>
            );
          })}
        </div>
      )}
    </article>
  );
}

function SkillGroup({ block }) {
  const items = Array.isArray(block.items) ? block.items.filter(Boolean) : [];
  const categoryHasSinhala = hasSinhalaScript(block.category || '');

  return (
    <div className="space-y-1.5 min-w-0">
      {block.category && (
        <div
          className={`text-[11px] font-semibold text-muted ${
            categoryHasSinhala ? '' : 'uppercase tracking-[0.08em]'
          }`}
        >
          {block.category}
        </div>
      )}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {items.map((item, idx) => (
            <span
              key={idx}
              style={{
                borderColor: THEME.borderColor,
                backgroundColor: THEME.surfaceChip,
              }}
              className="inline-flex items-center max-w-full break-words rounded-md border px-2.5 py-1 text-[12.5px] font-medium text-light"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactActions({ block }) {
  const actions = Array.isArray(block.actions)
    ? block.actions.filter((a) => a && isSafeHref(a.href))
    : [];

  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-0.5 min-w-0">
      {actions.map((action, idx) => {
        const external = isExternalHref(action.href);
        return (
          <a
            key={idx}
            href={action.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            style={{
              borderColor: THEME.borderColor,
              backgroundColor: THEME.surfaceChip,
            }}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] max-w-full rounded-xl border px-3.5 py-2 text-[13.5px] font-medium text-accent hover:border-[var(--color-red)] active:scale-[0.98] transition-all"
          >
            <ActionIcon kind={action.kind} />
            <span className="truncate">{action.label}</span>
            {external && <span className="sr-only"> (opens in new tab)</span>}
          </a>
        );
      })}
    </div>
  );
}

const supportsInlineCursor = (block) => {
  if (!block) return false;
  if (
    block.type === 'heading' ||
    block.type === 'paragraph' ||
    block.type === 'label' ||
    block.type === 'blockquote'
  ) {
    return true;
  }
  if (block.type === 'list' && Array.isArray(block.items) && block.items.length > 0) {
    return true;
  }
  return false;
};

function RenderBlocks({ blocks, isStreaming, showTrailingCursor = true }) {
  const lastIndex = blocks.length - 1;

  return blocks.map((block, index) => {
    const isLast = index === lastIndex;
    const showBlockCursor = isStreaming && showTrailingCursor && isLast;

    if (block.type === 'heading') {
      return (
        <HeadingBlock
          key={index}
          block={block}
          isStreaming={isStreaming}
          showCursor={showBlockCursor}
        />
      );
    }

    if (block.type === 'paragraph') {
      return (
        <p key={index} className="text-light whitespace-pre-line">
          <InlineText
            text={block.text}
            isStreaming={isStreaming}
            showCursor={showBlockCursor}
          />
        </p>
      );
    }

    if (block.type === 'blockquote') {
      return (
        <BlockquoteBlock
          key={index}
          block={block}
          isStreaming={isStreaming}
          showCursor={showBlockCursor}
        />
      );
    }

    if (block.type === 'table') {
      return <TableBlock key={index} block={block} isStreaming={isStreaming} />;
    }

    if (block.type === 'list') {
      return (
        <MessageList
          key={index}
          block={block}
          isStreaming={isStreaming}
          showCursor={showBlockCursor}
        />
      );
    }

    if (block.type === 'project') {
      return <ProjectCard key={index} block={block} isStreaming={isStreaming} />;
    }

    if (block.type === 'skill_group') {
      return <SkillGroup key={index} block={block} />;
    }

    if (block.type === 'contact_actions') {
      return <ContactActions key={index} block={block} />;
    }

    if (block.type === 'code_block') {
      return <CodeBlock key={index} block={block} />;
    }

    if (block.type === 'divider') {
      return (
        <hr
          key={index}
          style={{ borderColor: THEME.borderColor }}
          className="border-0 border-t my-1"
        />
      );
    }

    if (block.type === 'label') {
      return (
        <div
          key={index}
          className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13.5px]"
        >
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted shrink-0">
            {block.label}:
          </span>
          <span className="text-light min-w-0 flex-1 whitespace-pre-line">
            <InlineText
              text={block.text}
              isStreaming={isStreaming}
              showCursor={showBlockCursor}
            />
          </span>
        </div>
      );
    }

    return null;
  });
}

export default function MobileChatMessage({
  text = '',
  isStreaming = false,
  isError = false,
}) {
  const safeText = typeof text === 'string' ? text : String(text ?? '');
  if (!safeText.trim() && !isStreaming) return null;

  const isSinhala = hasSinhalaScript(safeText);
  const leadingClass = isSinhala ? 'leading-[1.75]' : 'leading-[1.65]';
  const blocks = parseMobileBlocks(safeText, { isStreaming });

  const containerClass = `space-y-3 text-[15px] ${leadingClass} text-light break-words [overflow-wrap:anywhere] min-w-0`;

  if (!blocks.length) {
    return (
      <div role={isError ? 'alert' : undefined} className={containerClass}>
        <p className="text-light whitespace-pre-line break-words [overflow-wrap:anywhere]">
          {safeText}
          {isStreaming && <StreamingCursor />}
        </p>
      </div>
    );
  }

  const lastBlock = blocks[blocks.length - 1];
  const cursorHandledInline = isStreaming && supportsInlineCursor(lastBlock);

  return (
    <div role={isError ? 'alert' : undefined} className={containerClass}>
      <RenderBlocks blocks={blocks} isStreaming={isStreaming} />

      {isStreaming && !cursorHandledInline && (
        <div className="leading-none">
          <StreamingCursor />
        </div>
      )}
    </div>
  );
}
