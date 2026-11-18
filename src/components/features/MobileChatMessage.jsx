import { Fragment } from 'react';
import {
  hasSinhalaScript,
  parseInlineTokens,
  parseMobileBlocks,
} from '../../lib/parseMobileChatMessage';

const HAIRLINE_BORDER = 'border-[color:color-mix(in_srgb,var(--color-accent)_14%,transparent)]';
const SURFACE_SUBTLE = 'bg-[color:color-mix(in_srgb,var(--color-accent)_4%,transparent)]';
const SURFACE_CHIP = 'bg-[color:color-mix(in_srgb,var(--color-accent)_6%,transparent)]';
const SURFACE_PILL = 'bg-[color:color-mix(in_srgb,var(--color-accent)_8%,transparent)]';
const LINK_UNDERLINE =
  'underline underline-offset-4 decoration-[color:color-mix(in_srgb,var(--color-accent)_40%,transparent)] hover:decoration-accent';

const isSafeHref = (href) =>
  typeof href === 'string' && /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href.trim());

const isExternalHref = (href) =>
  typeof href === 'string' && /^https?:\/\//i.test(href.trim());

function StreamingCursor() {
  return (
    <span
      aria-hidden="true"
      className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-1 rounded-full bg-accent animate-pulse"
    />
  );
}

function InlineText({ text, isStreaming = false, showCursor = false }) {
  const tokens = parseInlineTokens(text ?? '', { isStreaming });

  return (
    <>
      {tokens.map((token, idx) => {
        if (token.type === 'bold') {
          return (
            <strong key={idx} className="font-semibold text-accent">
              {token.value}
            </strong>
          );
        }

        if (token.type === 'italic') {
          return (
            <em key={idx} className="italic text-light">
              {token.value}
            </em>
          );
        }

        if (token.type === 'code') {
          return (
            <code
              key={idx}
              className={`rounded-md border ${HAIRLINE_BORDER} ${SURFACE_CHIP} px-1.5 py-0.5 font-mono text-[13px] text-accent`}
            >
              {token.value}
            </code>
          );
        }

        if (token.type === 'link') {
          const label = token.label || token.url;
          if (!isSafeHref(token.url)) {
            return <Fragment key={idx}>{label}</Fragment>;
          }
          const external = isExternalHref(token.url);
          return (
            <a
              key={idx}
              href={token.url}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className={`font-medium text-accent ${LINK_UNDERLINE} active:opacity-75 transition-colors`}
            >
              {label}
            </a>
          );
        }

        if (token.type === 'email') {
          return (
            <a
              key={idx}
              href={`mailto:${token.value}`}
              className={`font-medium text-accent ${LINK_UNDERLINE} active:opacity-75 transition-colors`}
            >
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
            <a
              key={idx}
              href={href}
              className={`font-medium text-accent ${LINK_UNDERLINE} active:opacity-75 transition-colors whitespace-nowrap`}
            >
              {token.display}
            </a>
          );
        }

        return <Fragment key={idx}>{token.value}</Fragment>;
      })}
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

function ProjectCard({ block, isStreaming }) {
  const indexLabel =
    block.index !== undefined && block.index !== null
      ? String(block.index).padStart(2, '0')
      : null;
  const techItems = Array.isArray(block.tech) ? block.tech.filter(Boolean) : [];
  const links = Array.isArray(block.links) ? block.links.filter((l) => l && isSafeHref(l.url)) : [];

  return (
    <article
      className={`rounded-xl border ${HAIRLINE_BORDER} ${SURFACE_SUBTLE} p-3.5 space-y-2.5`}
    >
      <div className="flex items-start gap-2.5">
        {indexLabel && (
          <span
            className={`inline-flex items-center justify-center shrink-0 rounded-md border ${HAIRLINE_BORDER} ${SURFACE_PILL} px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted tabular-nums mt-[2px]`}
          >
            {indexLabel}
          </span>
        )}
        <h4 className="flex-1 min-w-0 text-[15px] font-semibold leading-snug text-accent">
          <InlineText text={block.title} isStreaming={isStreaming} />
        </h4>
      </div>

      {block.summary && (
        <p className="text-[13.5px] leading-[1.6] text-light">
          <InlineText text={block.summary} isStreaming={isStreaming} />
        </p>
      )}

      {techItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {techItems.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center rounded-md border ${HAIRLINE_BORDER} ${SURFACE_CHIP} px-2 py-0.5 text-[11px] font-medium text-light`}
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-0.5">
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
                className={`inline-flex items-center justify-center gap-1.5 min-h-[38px] rounded-lg border ${HAIRLINE_BORDER} ${SURFACE_PILL} px-3 py-1.5 text-[13px] font-medium text-accent active:scale-[0.98] transition-transform`}
              >
                <span>{label}</span>
                {!hasArrow && (
                  <span aria-hidden="true" className="text-muted text-xs leading-none">
                    ↗
                  </span>
                )}
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

  return (
    <div className="space-y-1.5">
      {block.category && (
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          {block.category}
        </div>
      )}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center rounded-md border ${HAIRLINE_BORDER} ${SURFACE_CHIP} px-2.5 py-1 text-[12.5px] font-medium text-light`}
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
    <div className="flex flex-wrap gap-2 pt-0.5">
      {actions.map((action, idx) => {
        const external = isExternalHref(action.href);
        return (
          <a
            key={idx}
            href={action.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className={`inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl border ${HAIRLINE_BORDER} ${SURFACE_CHIP} px-3.5 py-2 text-[13.5px] font-medium text-accent active:scale-[0.98] transition-transform`}
          >
            <ActionIcon kind={action.kind} />
            <span>{action.label}</span>
          </a>
        );
      })}
    </div>
  );
}

const supportsInlineCursor = (block) => {
  if (!block) return false;
  if (block.type === 'heading' || block.type === 'paragraph' || block.type === 'label') {
    return true;
  }
  if (block.type === 'list' && Array.isArray(block.items) && block.items.length > 0) {
    return true;
  }
  return false;
};

export default function MobileChatMessage({ text = '', isStreaming = false }) {
  const safeText = typeof text === 'string' ? text : String(text ?? '');
  const isSinhala = hasSinhalaScript(safeText);
  const leadingClass = isSinhala ? 'leading-[1.75]' : 'leading-[1.65]';
  const blocks = parseMobileBlocks(safeText, { isStreaming });

  if (!blocks.length) {
    if (!safeText && !isStreaming) return null;
    return (
      <p className={`text-[15px] ${leadingClass} text-light whitespace-pre-wrap break-words [overflow-wrap:anywhere]`}>
        {safeText}
        {isStreaming && <StreamingCursor />}
      </p>
    );
  }

  const lastIndex = blocks.length - 1;
  const lastBlock = blocks[lastIndex];
  const cursorHandledInline = isStreaming && supportsInlineCursor(lastBlock);

  return (
    <div
      className={`space-y-3.5 text-[15px] ${leadingClass} text-light break-words [overflow-wrap:anywhere] min-w-0`}
    >
      {blocks.map((block, index) => {
        const isLast = index === lastIndex;
        const showBlockCursor = isStreaming && isLast;

        if (block.type === 'heading') {
          const headingHasSinhala = hasSinhalaScript(block.text || '');
          return (
            <h3
              key={index}
              className={`pt-1 text-[13px] font-semibold text-accent border-b ${HAIRLINE_BORDER} pb-1.5 ${
                headingHasSinhala ? '' : 'uppercase tracking-[0.08em]'
              }`}
            >
              <InlineText
                text={block.text}
                isStreaming={isStreaming}
                showCursor={showBlockCursor}
              />
            </h3>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={index} className="text-light">
              <InlineText
                text={block.text}
                isStreaming={isStreaming}
                showCursor={showBlockCursor}
              />
            </p>
          );
        }

        if (block.type === 'list') {
          const items = Array.isArray(block.items) ? block.items : [];
          if (!items.length) return null;
          const ListTag = block.ordered ? 'ol' : 'ul';

          return (
            <ListTag key={index} className="space-y-2 list-none pl-0">
              {items.map((item, itemIdx) => {
                const isLastItem = showBlockCursor && itemIdx === items.length - 1;
                return (
                  <li key={itemIdx} className="flex items-start gap-2 text-light">
                    <span
                      aria-hidden={!block.ordered}
                      className={`w-5 shrink-0 font-mono text-[12px] text-muted select-none pt-[2px] ${
                        block.ordered ? 'text-right tabular-nums' : 'text-center'
                      }`}
                    >
                      {block.ordered ? `${itemIdx + 1}.` : '•'}
                    </span>
                    <span className="flex-1 min-w-0">
                      <InlineText
                        text={item}
                        isStreaming={isStreaming}
                        showCursor={isLastItem}
                      />
                    </span>
                  </li>
                );
              })}
            </ListTag>
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
          return (
            <div
              key={index}
              className={`rounded-xl border ${HAIRLINE_BORDER} ${SURFACE_SUBTLE} overflow-hidden`}
            >
              {block.language && (
                <div
                  className={`border-b ${HAIRLINE_BORDER} ${SURFACE_CHIP} px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted`}
                >
                  {block.language}
                </div>
              )}
              <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-[1.6] text-light">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        if (block.type === 'divider') {
          return <hr key={index} className={`border-0 border-t ${HAIRLINE_BORDER} my-1`} />;
        }

        if (block.type === 'label') {
          return (
            <div key={index} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13.5px]">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted shrink-0">
                {block.label}:
              </span>
              <span className="text-light min-w-0 flex-1">
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
      })}

      {isStreaming && !cursorHandledInline && (
        <div className="leading-none">
          <StreamingCursor />
        </div>
      )}
    </div>
  );
}
