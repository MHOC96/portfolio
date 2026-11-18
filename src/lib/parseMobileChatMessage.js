/**
 * Mobile chat output parser and normalizer for MHOC assistant responses.
 *
 * Designed as a standalone, dependency-free ES module so mobile UI renderers
 * can convert streaming or completed assistant markdown into structured blocks
 * and inline tokens without breaking Sinhala script, prose bullets, or URLs.
 */

const SINHALA_SCRIPT_RE = /[\u0D80-\u0DFF]/;

const KNOWN_SKILL_CATEGORIES = new Set([
  'languages',
  'frameworks',
  'ai engineering',
  'ml & data',
  'data & analytics',
  'devops & db',
  'devops & cloud',
  'databases',
  'frontend',
]);

const NON_SKILL_LABELS = new Set([
  'tech',
  'link',
  'links',
  'email',
  'phone',
  'whatsapp',
  'github',
  'linkedin',
  'note',
  'summary',
  'status',
  'http',
  'https',
]);

const DEMO_HOST_PATTERNS = [
  /\.vercel\.app$/i,
  /\.netlify\.app$/i,
  /\.pages\.dev$/i,
  /\.onrender\.com$/i,
  /\.herokuapp\.com$/i,
  /\.github\.io$/i,
  /\.web\.app$/i,
  /\.firebaseapp\.com$/i,
  /\.fly\.dev$/i,
  /\.railway\.app$/i,
  /\.streamlit\.app$/i,
];

const FENCE_OPEN_RE = /^[ \t]*```([A-Za-z0-9_+-]*)[ \t]*$/;
const FENCE_CLOSE_RE = /^[ \t]*```[ \t]*$/;
const DIVIDER_RE = /^[ \t]*(?:-{3,}|\*{3,})[ \t]*$/;
const BULLET_LINE_RE = /^[•›\-*]\s+(.+)$/;
const NUMBERED_LINE_RE = /^(\d+)\.\s+(.+)$/;
const PROJECT_TECH_RE =
  /^(?:[•›\-*]\s+)?(?:\*\*Tech:\*\*|\*\*Tech\*\*\s*:|Tech\s*:)\s*(.*)$/i;
const PROJECT_LINKS_RE =
  /^(?:[•›\-*]\s+)?(?:\*\*Links?:\*\*|\*\*Links?\*\*\s*:|Links?\s*:)\s*(.*)$/i;
const PROJECT_DIRECT_LINKS_RE =
  /^(?:[•›\-*]\s+)?(?:\*\*(?:GitHub|Live(?:\s+Demo)?):\*\*|(?:\*\*)?(?:GitHub|Live(?:\s+Demo)?)(?:\*\*)?\s*:)\s*https?:\/\//i;
const STANDALONE_LABEL_RE =
  /^(?:\*\*(Tech|Links?):\*\*|\*\*(Tech|Links?)\*\*\s*:|(Tech|Links?)\s*:)\s*(.*)$/i;

/**
 * Returns true when the text contains any Sinhala Unicode character (U+0D80–U+0DFF).
 *
 * @param {string} text
 * @returns {boolean}
 */
export function hasSinhalaScript(text) {
  return typeof text === 'string' && SINHALA_SCRIPT_RE.test(text);
}

/**
 * Trims trailing sentence punctuation from a URL while preserving balanced parentheses.
 *
 * @param {string} rawUrl
 * @returns {{ url: string, trailing: string }}
 */
function trimTrailingUrlPunctuation(rawUrl) {
  let url = rawUrl;
  let trailing = '';

  while (url.length > 0) {
    const lastChar = url[url.length - 1];
    if (/[.,;:!?\]>]/.test(lastChar)) {
      trailing = lastChar + trailing;
      url = url.slice(0, -1);
      continue;
    }

    if (lastChar === ')') {
      const openCount = (url.match(/\(/g) || []).length;
      const closeCount = (url.match(/\)/g) || []).length;
      if (closeCount > openCount) {
        trailing = lastChar + trailing;
        url = url.slice(0, -1);
        continue;
      }
    }

    break;
  }

  return { url, trailing };
}

/**
 * Produces a concise display label from a URL hostname for mobile link chips.
 *
 * @param {string} url
 * @returns {string}
 */
export function formatDomainLabel(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, '');
    const lower = host.toLowerCase();

    if (lower === 'github.com' || lower.endsWith('.github.com')) return 'GitHub';
    if (lower === 'wa.me' || lower === 'whatsapp.com' || lower.endsWith('.whatsapp.com')) {
      return 'WhatsApp';
    }
    if (lower === 'linkedin.com' || lower.endsWith('.linkedin.com')) return 'LinkedIn';

    return host;
  } catch {
    return url;
  }
}

/**
 * Splits raw text into alternating non-code and fenced-code segments so text
 * normalizations never corrupt code examples.
 *
 * @param {string} text
 * @returns {Array<{ isCode: boolean, text: string }>}
 */
function splitFencedSegments(text) {
  const lines = text.split('\n');
  const segments = [];
  let buffer = [];
  let inCode = false;

  for (const line of lines) {
    if (!inCode && FENCE_OPEN_RE.test(line)) {
      if (buffer.length > 0) {
        segments.push({ isCode: false, text: buffer.join('\n') });
        buffer = [];
      }
      inCode = true;
      buffer.push(line);
      continue;
    }

    if (inCode && FENCE_CLOSE_RE.test(line)) {
      buffer.push(line);
      segments.push({ isCode: true, text: buffer.join('\n') });
      buffer = [];
      inCode = false;
      continue;
    }

    buffer.push(line);
  }

  if (buffer.length > 0) {
    segments.push({ isCode: inCode, text: buffer.join('\n') });
  }

  return segments;
}

/**
 * Removes the last unmatched `**` outside inline code spans so partial streaming
 * bold markers are never displayed literally to the user.
 *
 * @param {string} text
 * @returns {string}
 */
function stripTrailingUnclosedBold(text) {
  // Process line-by-line from the end, skipping divider lines like `***`.
  const lines = text.split('\n');
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (DIVIDER_RE.test(line)) continue;

    // Mask inline code spans so `**` inside backticks is ignored.
    const masked = line.replace(/`[^`\n]*`/g, (match) => ' '.repeat(match.length));
    const matches = [...masked.matchAll(/\*\*/g)];

    if (matches.length % 2 === 1) {
      const lastMatch = matches[matches.length - 1];
      const idx = lastMatch.index;
      lines[i] = line.slice(0, idx) + line.slice(idx + 2);
      // Clean up any trailing space left behind by removing a dangling `**`.
      lines[i] = lines[i].replace(/[ \t]+$/, '');
      break;
    }
  }

  return lines.join('\n');
}

/**
 * Normalizes a non-code prose/markdown segment for mobile parsing.
 *
 * @param {string} segment
 * @returns {string}
 */
function normalizeProseSegment(segment) {
  return (
    segment
      // Normalize markdown headings `#{1,6} Title` -> `**Title**` without double-wrapping.
      .replace(/^[ \t]*#{1,6}[ \t]+(.+?)[ \t]*#*$/gm, (_, headingText) => {
        const clean = headingText
          .replace(/^\*\*([^*\n]+?)(?::\*\*|\*\*:?)$/, '$1')
          .replace(/^\*\*|\*\*$/g, '')
          .trim();
        return clean ? `**${clean}**` : '';
      })
      // Normalize standalone bold headings with trailing colons (`**Title**:` / `**Title:**`).
      .replace(/^[ \t]*\*\*([^*\n]+?)(?::\*\*|\*\*:)[ \t]*$/gm, (_, title) => `**${title.trim()}**`)
      // Split inline ` • ` bullets onto separate lines.
      .replace(/(?<=[^\n])[ \t]+•[ \t]+/g, '\n• ')
      // Join orphaned list markers (`•\nItem`, `1.\nItem`) onto one line.
      .replace(
        /^[ \t]*([•›\-*]|\d+\.)[ \t]*\n+(?=\S)(?!(?:[•›\-*]|\d+\.)(?:[ \t]|$))/gm,
        '$1 '
      )
      .replace(/[ \t]+$/gm, '')
  );
}

/**
 * Normalizes raw assistant text for mobile rendering and block parsing.
 *
 * @param {string} raw
 * @param {boolean} [isStreaming=false]
 * @returns {string}
 */
export function normalizeMobileText(raw, isStreaming = false) {
  if (typeof raw !== 'string' || raw.length === 0) return '';

  let text = raw
    .replace(/\r\n?/g, '\n')
    .replace(/[\u200B\u00A0]/g, ' ')
    .replace(/^[ \t]*INITIATING SYSTEM\.\.\.[ \t]*/i, '')
    .replace(/[ \t]+$/gm, '');

  const segments = splitFencedSegments(text);
  text = segments
    .map((segment) => (segment.isCode ? segment.text : normalizeProseSegment(segment.text)))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  if (isStreaming) {
    const postSegments = splitFencedSegments(text);
    const lastSegment = postSegments[postSegments.length - 1];
    if (lastSegment && !lastSegment.isCode) {
      // Strip dangling empty markers (`1.`, `•`, `-`, `*`, `**`) at the very end.
      lastSegment.text = lastSegment.text.replace(
        /(?:^|\n)[ \t]*(?:\d+\.|[•›\-*]|\*\*)[ \t]*$/,
        ''
      );
      // Tolerate an unclosed `**` on the trailing segment without exposing raw asterisks.
      lastSegment.text = stripTrailingUnclosedBold(lastSegment.text);
      text = postSegments.map((s) => s.text).join('\n');
    }
  }

  return text.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Strips surrounding markdown bold markers from a heading or label string.
 *
 * @param {string} text
 * @returns {string}
 */
function stripOuterBold(text) {
  return text.replace(/^\*\*([^*]+)\*\*$/, '$1').trim();
}

/**
 * Parses a project's `Tech:` value into trimmed technology strings.
 *
 * @param {string} value
 * @returns {string[]}
 */
function parseTechList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => stripOuterBold(item.trim()))
    .filter(Boolean);
}

/**
 * Infers label and kind for a bare URL inside a project's `Links:` line.
 *
 * @param {string} url
 * @param {string} [explicitLabel]
 * @returns {{ label: string, kind: 'github'|'live'|'link', url: string }}
 */
function buildProjectLink(url, explicitLabel = '') {
  const cleanLabel = explicitLabel.trim();
  const domainLabel = formatDomainLabel(url);

  if (/^github$/i.test(cleanLabel) || domainLabel === 'GitHub') {
    return { label: cleanLabel || 'GitHub', kind: 'github', url };
  }

  if (/^(?:live|live demo|demo|preview|site|website|app)$/i.test(cleanLabel)) {
    return { label: cleanLabel, kind: 'live', url };
  }

  if (cleanLabel) {
    return { label: cleanLabel, kind: 'link', url };
  }

  if (domainLabel === 'WhatsApp' || domainLabel === 'LinkedIn') {
    return { label: domainLabel, kind: 'link', url };
  }

  try {
    const host = new URL(url).hostname.replace(/^www\./i, '');
    if (DEMO_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
      return { label: 'Live Demo', kind: 'live', url };
    }
  } catch {
    // Fall back to domainLabel below.
  }

  return { label: domainLabel, kind: 'link', url };
}

/**
 * Parses project `Links:` text into deduplicated link objects.
 *
 * @param {string} rawLinks
 * @returns {Array<{ label: string, kind: 'github'|'live'|'link', url: string }>}
 */
function parseProjectLinks(rawLinks) {
  if (!rawLinks || /none\s+listed\s+on\s+portfolio/i.test(rawLinks)) {
    return [];
  }

  const results = [];
  const seenUrls = new Set();

  const addLink = (url, explicitLabel = '') => {
    const { url: cleanUrl } = trimTrailingUrlPunctuation(url.trim());
    if (!cleanUrl || seenUrls.has(cleanUrl)) return;
    seenUrls.add(cleanUrl);
    results.push(buildProjectLink(cleanUrl, explicitLabel));
  };

  const segments = rawLinks
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  for (const segment of segments) {
    if (/^(?:none|n\/a|-)$/i.test(segment)) continue;

    // 1. Extract markdown links `[Label](url)` anywhere in the segment.
    let remainder = segment.replace(
      /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
      (_, label, url) => {
        addLink(url, label);
        return ' ';
      }
    );

    remainder = remainder.trim();
    if (!remainder) continue;

    // 2. Match `Label: https://...` (e.g., `GitHub: https://...` or `**Live:** https://...`).
    const labeledMatch = remainder.match(
      /^(?:\*\*([A-Za-z][A-Za-z0-9 &_-]{0,30}):\*\*|\*\*([A-Za-z][A-Za-z0-9 &_-]{0,30})\*\*\s*:|([A-Za-z][A-Za-z0-9 &_-]{0,30})\s*:)\s*(https?:\/\/\S+)$/
    );
    if (labeledMatch) {
      addLink(labeledMatch[4], labeledMatch[1] ?? labeledMatch[2] ?? labeledMatch[3]);
      continue;
    }

    // 3. Extract any remaining bare URLs in the segment.
    const urlMatches = remainder.match(/https?:\/\/[^\s<>()]+/g);
    if (urlMatches) {
      for (const rawUrl of urlMatches) {
        addLink(rawUrl);
      }
    }
  }

  return results;
}

/**
 * Checks whether a bullet text represents a short skill tag rather than prose.
 *
 * @param {string} text
 * @returns {boolean}
 */
function isShortSkillBullet(text) {
  if (!text) return false;
  if (/https?:\/\//i.test(text)) return false;
  if (/[.!?]$/.test(text)) return false;
  if (/@/.test(text)) return false;

  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 4;
}

/**
 * Parses an inline `Category: item1, item2, ...` line into a `skill_group` block if valid.
 *
 * @param {string} line
 * @returns {{ type: 'skill_group', category: string, items: string[] } | null}
 */
function tryParseInlineSkillGroup(line) {
  const withoutBullet = line.replace(/^[•›\-*]\s+/, '').trim();
  const match = withoutBullet.match(
    /^(?:\*\*([^:\n*]{2,40}?):\*\*|\*\*([^:\n*]{2,40}?)\*\*\s*:|([^:\n*]{2,40}?)\s*:)\s*(.+)$/
  );
  if (!match) return null;

  const category = stripOuterBold((match[1] ?? match[2] ?? match[3]).trim());
  const lowerCategory = category.toLowerCase();
  const rawValue = match[4].trim();

  if (!category || !rawValue || NON_SKILL_LABELS.has(lowerCategory)) return null;
  if (/https?:\/\//i.test(rawValue) || /@/.test(rawValue)) return null;

  const isKnownCategory = KNOWN_SKILL_CATEGORIES.has(lowerCategory);
  const categoryWords = category.split(/\s+/).filter(Boolean);
  if (!isKnownCategory && categoryWords.length > 3) return null;

  if (!rawValue.includes(',') && !isKnownCategory) return null;

  const items = rawValue
    .split(',')
    .map((item) => stripOuterBold(item.trim()))
    .filter(Boolean);

  if (items.length === 0) return null;
  if (!isKnownCategory && items.length < 2) return null;

  const allShortTags = items.every((item) => isShortSkillBullet(item));
  if (!allShortTags) return null;

  return { type: 'skill_group', category, items };
}

/**
 * Parses a numbered project block starting at `startIndex`, or returns null if
 * the numbered line is part of an ordinary ordered list.
 *
 * @param {string[]} lines
 * @param {number} startIndex
 * @param {{ isStreaming: boolean, hasPriorProject: boolean }} context
 * @returns {{ block: object, nextIndex: number } | null}
 */
function tryParseProjectBlock(lines, startIndex, { isStreaming, hasPriorProject }) {
  const firstLine = lines[startIndex].trim();
  const numMatch = firstLine.match(NUMBERED_LINE_RE);
  if (!numMatch) return null;

  const index = Number(numMatch[1]);
  const rawTitle = numMatch[2].trim();
  const strictBoldTitleMatch = rawTitle.match(/^\*\*([^*\n]+)\*\*$/);
  const boldWithTailMatch = rawTitle.match(/^\*\*([^*\n]+)\*\*\s*(?:[-–—:]\s*(.+))?$/);

  const title = boldWithTailMatch
    ? boldWithTailMatch[1].trim()
    : stripOuterBold(rawTitle);
  let summary =
    boldWithTailMatch && boldWithTailMatch[2] ? boldWithTailMatch[2].trim() : '';

  let tech = [];
  let links = [];
  let hasMetadata = false;
  let candidateSummary = '';
  let lastConsumedIndex = startIndex;
  let inspectedNonEmpty = 0;

  for (let i = startIndex + 1; i < lines.length && inspectedNonEmpty < 3; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    // Stop lookahead if we hit a new block boundary.
    if (
      FENCE_OPEN_RE.test(trimmed) ||
      DIVIDER_RE.test(trimmed) ||
      NUMBERED_LINE_RE.test(trimmed) ||
      /^\*\*[^*\n]+\*\*$/.test(trimmed)
    ) {
      break;
    }

    inspectedNonEmpty += 1;

    const techMatch = trimmed.match(PROJECT_TECH_RE);
    if (techMatch) {
      tech = parseTechList(techMatch[1]);
      hasMetadata = true;
      lastConsumedIndex = i;
      continue;
    }

    const linksMatch = trimmed.match(PROJECT_LINKS_RE);
    if (linksMatch) {
      links = parseProjectLinks(linksMatch[1]);
      hasMetadata = true;
      lastConsumedIndex = i;
      continue;
    }

    if (PROJECT_DIRECT_LINKS_RE.test(trimmed)) {
      links = parseProjectLinks(trimmed);
      hasMetadata = true;
      lastConsumedIndex = i;
      continue;
    }

    // Only accept a single optional summary line before Tech/Links, not bullet items.
    if (!BULLET_LINE_RE.test(trimmed) && !summary && !candidateSummary && !hasMetadata) {
      candidateSummary = trimmed;
      lastConsumedIndex = i;
      continue;
    }

    break;
  }

  // Commit candidate summary if metadata exists OR if streaming a bold project heading.
  const remainingLines = lines.slice(startIndex + 1).some((l) => NUMBERED_LINE_RE.test(l.trim()));
  const looksLikeStreamingProject =
    isStreaming &&
    !remainingLines &&
    (Boolean(strictBoldTitleMatch) || hasPriorProject);

  if (!hasMetadata && !looksLikeStreamingProject) {
    return null;
  }

  if (candidateSummary) {
    summary = candidateSummary;
  }

  const block = {
    type: 'project',
    index,
    title,
    ...(summary ? { summary } : {}),
    tech,
    links,
  };

  return { block, nextIndex: lastConsumedIndex + 1 };
}

/**
 * Extracts deduplicated contact/hiring actions from non-project lines.
 *
 * @param {string[]} lines
 * @param {boolean} isStreaming
 * @returns {Array<{ label: string, kind: 'email'|'phone'|'whatsapp'|'github'|'linkedin'|'link', href: string }>}
 */
function extractContactActions(lines, isStreaming) {
  const text = lines.join('\n').trim();
  if (!text) return [];

  const actions = [];
  const seenKeys = new Set();

  const addAction = (action, dedupeKey) => {
    if (seenKeys.has(dedupeKey)) return;
    seenKeys.add(dedupeKey);
    actions.push(action);
  };

  // 1. Emails
  const emailRe = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  for (const match of text.matchAll(emailRe)) {
    const endIdx = match.index + match[0].length;
    if (isStreaming && endIdx === text.length) continue;

    const email = match[0];
    addAction(
      { label: 'Email', kind: 'email', href: `mailto:${email}` },
      `email:${email.toLowerCase()}`
    );
  }

  // 2. Contact URLs (WhatsApp, GitHub, LinkedIn — with or without protocol).
  // Replace markdown link wrappers cleanly so trailing `)` doesn't stick to URLs.
  const urlRe =
    /(?:https?:\/\/)?(?:www\.)?(?:wa\.me\/[^\s<>()]+|github\.com\/[^\s<>()]+|linkedin\.com\/[^\s<>()]+)/gi;

  for (const match of text.matchAll(urlRe)) {
    const rawMatch = match[0];
    const matchStart = match.index;
    const matchEnd = matchStart + rawMatch.length;

    // Avoid matching substrings inside an email domain or word.
    if (matchStart > 0 && /[A-Za-z0-9@._-]/.test(text[matchStart - 1])) {
      continue;
    }
    if (isStreaming && matchEnd === text.length) {
      continue;
    }

    const { url: trimmed } = trimTrailingUrlPunctuation(rawMatch);
    if (!trimmed) continue;

    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const normalizedKey = href.toLowerCase().replace(/\/+$/, '');
    const lower = normalizedKey;

    if (lower.includes('wa.me/')) {
      addAction({ label: 'WhatsApp', kind: 'whatsapp', href }, `url:${normalizedKey}`);
    } else if (lower.includes('github.com/')) {
      addAction({ label: 'GitHub', kind: 'github', href }, `url:${normalizedKey}`);
    } else if (lower.includes('linkedin.com/')) {
      addAction({ label: 'LinkedIn', kind: 'linkedin', href }, `url:${normalizedKey}`);
    }
  }

  // 3. International / E.164 phone numbers (skip URLs so `wa.me/947...` isn't matched).
  const textWithoutUrls = text.replace(/https?:\/\/[^\s<>()]+/gi, ' ');
  const phoneRe = /(?<![\w+])\+\d[\d\s\-()]{6,18}\d(?![\w])/g;

  for (const match of textWithoutUrls.matchAll(phoneRe)) {
    const endIdx = match.index + match[0].length;
    if (isStreaming && endIdx === textWithoutUrls.length) continue;

    const display = match[0].trim();
    const digits = display.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) continue;

    const e164 = `+${digits}`;
    addAction(
      { label: 'Call', kind: 'phone', href: `tel:${e164}` },
      `phone:${e164}`
    );
  }

  return actions;
}

/**
 * Parses an assistant message into semantic block objects tailored for mobile UI rendering.
 *
 * @param {string} text
 * @param {{ isStreaming?: boolean }} [options]
 * @returns {Array<object>}
 */
export function parseMobileBlocks(text, { isStreaming = false } = {}) {
  const normalized = normalizeMobileText(text, isStreaming);
  if (!normalized) return [];

  const lines = normalized.split('\n');
  const blocks = [];
  const nonProjectLines = [];
  let hasPriorProject = false;

  const appendListItems = (ordered, items) => {
    const last = blocks[blocks.length - 1];
    if (last && last.type === 'list' && last.ordered === ordered) {
      last.items.push(...items);
    } else {
      blocks.push({ type: 'list', ordered, items: [...items] });
    }
  };

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // 1. Fenced code block
    const fenceMatch = rawLine.match(FENCE_OPEN_RE);
    if (fenceMatch) {
      const language = (fenceMatch[1] || '').trim();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !FENCE_CLOSE_RE.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length && FENCE_CLOSE_RE.test(lines[i])) {
        i += 1;
      }
      blocks.push({
        type: 'code_block',
        language,
        code: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Divider (`---` / `***`)
    if (DIVIDER_RE.test(trimmed)) {
      blocks.push({ type: 'divider' });
      i += 1;
      continue;
    }

    // 3. Inline skill group (`- Languages: PYTHON, JAVA, C#` or `Languages: PYTHON, JAVA`)
    const inlineSkill = tryParseInlineSkillGroup(trimmed);
    if (inlineSkill) {
      blocks.push(inlineSkill);
      nonProjectLines.push(trimmed);
      i += 1;
      continue;
    }

    // 4. Known skill heading followed by short skill bullets (`<= 4` words, no period/http)
    const headingCandidate = stripOuterBold(trimmed.replace(/:$/, '').trim());
    if (
      KNOWN_SKILL_CATEGORIES.has(headingCandidate.toLowerCase()) &&
      !BULLET_LINE_RE.test(trimmed) &&
      !NUMBERED_LINE_RE.test(trimmed)
    ) {
      const skillItems = [];
      let lookahead = i + 1;

      while (lookahead < lines.length) {
        const nextTrimmed = lines[lookahead].trim();
        if (!nextTrimmed) {
          // Stop across a blank line if bullets already started and next non-empty isn't a bullet.
          let peek = lookahead + 1;
          while (peek < lines.length && !lines[peek].trim()) peek += 1;
          if (peek >= lines.length || !BULLET_LINE_RE.test(lines[peek].trim())) {
            break;
          }
          lookahead += 1;
          continue;
        }

        const bMatch = nextTrimmed.match(BULLET_LINE_RE);
        if (!bMatch || !isShortSkillBullet(bMatch[1].trim())) {
          break;
        }

        skillItems.push(stripOuterBold(bMatch[1].trim()));
        lookahead += 1;
      }

      if (skillItems.length > 0) {
        blocks.push({
          type: 'skill_group',
          category: headingCandidate,
          items: skillItems,
        });
        nonProjectLines.push(trimmed, ...skillItems);
        i = lookahead;
        continue;
      }
    }

    // 5. Bold heading (`**Heading**`)
    const boldHeadingMatch = trimmed.match(/^\*\*([^*\n]+)\*\*$/);
    if (boldHeadingMatch) {
      blocks.push({ type: 'heading', text: boldHeadingMatch[1].trim() });
      nonProjectLines.push(trimmed);
      i += 1;
      continue;
    }

    // 6. Numbered project or ordered list item
    const numMatch = trimmed.match(NUMBERED_LINE_RE);
    if (numMatch) {
      const projectResult = tryParseProjectBlock(lines, i, {
        isStreaming,
        hasPriorProject,
      });
      if (projectResult) {
        blocks.push(projectResult.block);
        hasPriorProject = true;
        i = projectResult.nextIndex;
        continue;
      }

      appendListItems(true, [numMatch[2].trim()]);
      nonProjectLines.push(trimmed);
      i += 1;
      continue;
    }

    // 7. Unordered bullet list (never split prose bullets on commas)
    const bulletMatch = trimmed.match(BULLET_LINE_RE);
    if (bulletMatch) {
      appendListItems(false, [bulletMatch[1].trim()]);
      nonProjectLines.push(trimmed);
      i += 1;
      continue;
    }

    // 8. Standalone `Tech:` / `Links:` / `Link:` label fallback
    const labelMatch = trimmed.match(STANDALONE_LABEL_RE);
    if (labelMatch) {
      const rawLabel = labelMatch[1] ?? labelMatch[2] ?? labelMatch[3];
      const normalizedLabel =
        rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase();
      blocks.push({
        type: 'label',
        label: normalizedLabel,
        text: labelMatch[4].trim(),
      });
      nonProjectLines.push(trimmed);
      i += 1;
      continue;
    }

    // 9. Paragraph (group consecutive plain prose lines until blank line or structural marker)
    const paragraphLines = [trimmed];
    nonProjectLines.push(trimmed);
    i += 1;

    while (i < lines.length) {
      const nextRaw = lines[i];
      const nextTrimmed = nextRaw.trim();
      if (!nextTrimmed) break;
      if (
        FENCE_OPEN_RE.test(nextRaw) ||
        DIVIDER_RE.test(nextTrimmed) ||
        BULLET_LINE_RE.test(nextTrimmed) ||
        NUMBERED_LINE_RE.test(nextTrimmed) ||
        STANDALONE_LABEL_RE.test(nextTrimmed) ||
        /^\*\*[^*\n]+\*\*$/.test(nextTrimmed) ||
        tryParseInlineSkillGroup(nextTrimmed) ||
        KNOWN_SKILL_CATEGORIES.has(stripOuterBold(nextTrimmed.replace(/:$/, '').trim()).toLowerCase())
      ) {
        break;
      }
      paragraphLines.push(nextTrimmed);
      nonProjectLines.push(nextTrimmed);
      i += 1;
    }

    blocks.push({
      type: 'paragraph',
      text: paragraphLines.join('\n'),
    });
  }

  const contactActions = extractContactActions(nonProjectLines, isStreaming);
  if (contactActions.length > 0) {
    blocks.push({ type: 'contact_actions', actions: contactActions });
  }

  return blocks;
}

/**
 * Tokenizes inline markdown, links, emails, and E.164 phone numbers for mobile rendering.
 *
 * @param {string} text
 * @param {{ isStreaming?: boolean }} [options]
 * @returns {Array<
 *   | { type: 'text', value: string }
 *   | { type: 'bold', value: string }
 *   | { type: 'italic', value: string }
 *   | { type: 'code', value: string }
 *   | { type: 'link', label: string, url: string }
 *   | { type: 'email', value: string }
 *   | { type: 'phone', display: string, href: string }
 * >}
 */
export function parseInlineTokens(text, { isStreaming = false } = {}) {
  if (typeof text !== 'string' || text.length === 0) return [];

  let input = text;
  if (isStreaming) {
    input = stripTrailingUnclosedBold(input);
  }

  const tokens = [];
  const pushText = (value) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.type === 'text') {
      prev.value += value;
    } else {
      tokens.push({ type: 'text', value });
    }
  };

  // Ordered priority: inline code -> markdown links -> bare URLs -> emails -> E.164 phones -> bold -> italic.
  const INLINE_TOKEN_RE =
    /`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|tel:[^\s)]+)\)|(https?:\/\/[^\s<>()]+)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|((?<![\w+])\+\d[\d\s\-()]{6,18}\d(?![\w]))|\*\*(?!\s)((?:[^*\n]|\*(?!\*))+?)\*\*|(?<!\*)\*(?!\s)([^*\n]*?\S)\*(?!\*)|(?<!\w)_(?!\s)([^_\n]*?\S)_(?!\w)/g;

  let cursor = 0;

  for (const match of input.matchAll(INLINE_TOKEN_RE)) {
    const start = match.index;
    const fullMatch = match[0];

    if (start > cursor) {
      pushText(input.slice(cursor, start));
    }

    const [
      ,
      codeValue,
      mdLinkLabel,
      mdLinkUrl,
      bareUrl,
      emailValue,
      phoneRaw,
      boldValue,
      italicStarValue,
      italicUnderValue,
    ] = match;

    if (codeValue !== undefined) {
      tokens.push({ type: 'code', value: codeValue });
    } else if (mdLinkLabel !== undefined && mdLinkUrl !== undefined) {
      tokens.push({ type: 'link', label: mdLinkLabel, url: mdLinkUrl });
    } else if (bareUrl !== undefined) {
      const endPos = start + fullMatch.length;
      if (isStreaming && endPos === input.length) {
        // Bare URL is still streaming at the very end without trailing whitespace.
        pushText(bareUrl);
      } else {
        const { url, trailing } = trimTrailingUrlPunctuation(bareUrl);
        if (url) {
          tokens.push({ type: 'link', label: formatDomainLabel(url), url });
        } else {
          pushText(bareUrl);
        }
        if (trailing) {
          pushText(trailing);
        }
      }
    } else if (emailValue !== undefined) {
      const endPos = start + fullMatch.length;
      if (isStreaming && endPos === input.length) {
        pushText(emailValue);
      } else {
        tokens.push({ type: 'email', value: emailValue });
      }
    } else if (phoneRaw !== undefined) {
      const digits = phoneRaw.replace(/\D/g, '');
      const endPos = start + fullMatch.length;
      if (
        digits.length >= 7 &&
        digits.length <= 15 &&
        !(isStreaming && endPos === input.length)
      ) {
        // Trim unmatched trailing `)` if phone was inside parentheses like `(+94 701246602)`.
        let display = phoneRaw;
        let trailing = '';
        if (display.endsWith(')') && !display.includes('(')) {
          display = display.slice(0, -1);
          trailing = ')';
        }
        tokens.push({ type: 'phone', display: display.trim(), href: `tel:+${digits}` });
        if (trailing) pushText(trailing);
      } else {
        pushText(phoneRaw);
      }
    } else if (boldValue !== undefined) {
      tokens.push({ type: 'bold', value: boldValue.trimEnd() });
    } else if (italicStarValue !== undefined || italicUnderValue !== undefined) {
      tokens.push({ type: 'italic', value: italicStarValue ?? italicUnderValue });
    }

    cursor = start + fullMatch.length;
  }

  if (cursor < input.length) {
    pushText(input.slice(cursor));
  }

  return tokens;
}
