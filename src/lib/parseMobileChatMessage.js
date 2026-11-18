/**
 * Mobile chat output parser and normalizer for MHOC assistant responses.
 *
 * Designed as a standalone, dependency-free ES module so mobile UI renderers
 * can convert streaming or completed assistant markdown into structured blocks
 * and inline tokens without breaking Sinhala script, code blocks, prose bullets, or URLs.
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

const FENCE_OPEN_RE = /^[ \t]*(`{3,}|~{3,})[ \t]*(.*?)[ \t]*$/;
const DIVIDER_RE = /^[ \t]*(?:(\*[ \t]*){3,}|(-[ \t]*){3,}|(_[ \t]*){3,})[ \t]*$/;
const BULLET_LINE_RE = /^([ \t]*)([•›\-*+])[ \t]+(.+)$/;
const NUMBERED_LINE_RE = /^([ \t]*)(\d+)\.[ \t]+(.+)$/;
const TASK_ITEM_RE = /^\[([ xX])\][ \t]+(.*)$/;
const BLOCKQUOTE_LINE_RE = /^[ \t]*>(?:[ \t]?(.*))?$/;
const ATX_HEADING_RE = /^[ \t]*(#{1,6})(?:[ \t]+(.+?)|(?<=#{2,6})([^\s#\d].+?))[ \t]*$/;
const PROJECT_TECH_RE =
  /^(?:[•›\-*+]\s+)?(?:\*\*Tech:\*\*|\*\*Tech\*\*\s*:|Tech\s*:)\s*(.*)$/i;
const PROJECT_LINKS_RE =
  /^(?:[•›\-*+]\s+)?(?:\*\*Links?:\*\*|\*\*Links?\*\*\s*:|Links?\s*:)\s*(.*)$/i;
const PROJECT_DIRECT_LINKS_RE =
  /^(?:[•›\-*+]\s+)?(?:\*\*(?:GitHub|Live(?:\s+Demo)?|Demo|Website|Site|Portfolio|Email|Phone):\*\*|(?:\*\*)?(?:GitHub|Live(?:\s+Demo)?|Demo|Website|Site|Portfolio|Email|Phone)(?:\*\*)?\s*:)\s*(?:https?:\/\/|mailto:|tel:)/i;
const STANDALONE_LABEL_RE =
  /^(?:\*\*(Tech|Links?):\*\*|\*\*(Tech|Links?)\*\*\s*:|(Tech|Links?)\s*:)\s*(.*)$/i;
const ESCAPABLE_CHAR_RE = /[\\`*_{}[\]()#+\-.!~<>|]/;
const SAFE_HREF_RE = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#|\.\.?\/)/i;
const TABLE_SEP_CELL_RE = /^:?-{2,}:?$/;

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
 * Matches a valid fence opener line, respecting CommonMark rule that backtick
 * info strings cannot contain backticks.
 *
 * @param {string} line
 * @returns {{ char: string, length: number, info: string, language: string, meta: string } | null}
 */
function parseFenceOpen(line) {
  const match = line.match(FENCE_OPEN_RE);
  if (!match) return null;
  const marker = match[1];
  const info = (match[2] || '').trim();
  const char = marker[0];
  if (char === '`' && info.includes('`')) return null;

  const spaceIdx = info.search(/\s/);
  const language = spaceIdx === -1 ? info : info.slice(0, spaceIdx);
  const meta = spaceIdx === -1 ? '' : info.slice(spaceIdx + 1).trim();

  return { char, length: marker.length, info, language, meta };
}

/**
 * Checks whether a line closes the currently open fenced code block.
 *
 * @param {string} line
 * @param {{ char: string, length: number }} fence
 * @returns {boolean}
 */
function isFenceClose(line, fence) {
  const match = line.match(/^[ \t]*(`{3,}|~{3,})[ \t]*$/);
  if (!match) return false;
  const marker = match[1];
  return marker[0] === fence.char && marker.length >= fence.length;
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
 * Checks whether a URL looks complete enough to turn into a clickable link chip
 * (especially during streaming).
 *
 * @param {string} url
 * @returns {boolean}
 */
function isCompleteLinkUrl(url) {
  if (!url) return false;
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(url)) return true;
  if (/^tel:\+?\d[\d\-()]{5,}$/i.test(url)) return true;
  if (/^(\/(?!\/)|#|\.\.?\/)/.test(url)) return true;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname;
    if (!host) return false;
    if (host === 'localhost') return true;
    return /^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(host) && !host.endsWith('.');
  } catch {
    return false;
  }
}

/**
 * Produces a concise display label from a URL hostname for mobile link chips.
 *
 * @param {string} url
 * @returns {string}
 */
export function formatDomainLabel(url) {
  if (/^mailto:/i.test(url)) return 'Email';
  if (/^tel:/i.test(url)) return 'Call';

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
 * Formats a bare prose URL with domain + path context, truncating cleanly if long.
 *
 * @param {string} url
 * @param {number} [maxLength=44]
 * @returns {string}
 */
function formatBareUrlLabel(url, maxLength = 44) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, '');
    const rawPath = `${parsed.pathname || ''}${parsed.search || ''}${parsed.hash || ''}`;
    const cleanPath = rawPath === '/' ? '' : rawPath.replace(/\/+$/, '');
    const display = cleanPath ? `${host}${cleanPath}` : host;

    if (display.length <= maxLength) return display;
    return `${display.slice(0, maxLength - 1)}…`;
  } catch {
    return url;
  }
}

/**
 * Splits raw text into alternating non-code and fenced-code segments so text
 * normalizations never corrupt code examples (including trailing spaces or blank lines).
 *
 * @param {string} text
 * @returns {Array<{ isCode: boolean, text: string }>}
 */
function splitFencedSegments(text) {
  const lines = text.split('\n');
  const segments = [];
  let buffer = [];
  let activeFence = null;

  for (const line of lines) {
    if (!activeFence) {
      const fence = parseFenceOpen(line);
      if (fence) {
        if (buffer.length > 0) {
          segments.push({ isCode: false, text: buffer.join('\n') });
          buffer = [];
        }
        activeFence = fence;
        buffer.push(line);
        continue;
      }
    } else if (isFenceClose(line, activeFence)) {
      buffer.push(line);
      segments.push({ isCode: true, text: buffer.join('\n') });
      buffer = [];
      activeFence = null;
      continue;
    }

    buffer.push(line);
  }

  if (buffer.length > 0) {
    segments.push({ isCode: Boolean(activeFence), text: buffer.join('\n') });
  }

  return segments;
}

/**
 * Masks inline code spans (single and multi-backtick) and escaped characters with spaces
 * so regex scanners ignore markdown-like tokens inside code.
 *
 * @param {string} text
 * @returns {string}
 */
function maskInlineCodeAndEscapes(text) {
  let out = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '\\' && i + 1 < text.length) {
      out += '  ';
      i += 2;
      continue;
    }

    if (text[i] === '`') {
      let tickLen = 0;
      while (i + tickLen < text.length && text[i + tickLen] === '`') {
        tickLen += 1;
      }
      const closeIdx = findClosingBackticks(text, i + tickLen, tickLen);
      if (closeIdx !== -1) {
        const spanLen = closeIdx + tickLen - i;
        out += ' '.repeat(spanLen);
        i += spanLen;
        continue;
      }
      out += ' '.repeat(tickLen);
      i += tickLen;
      continue;
    }

    out += text[i];
    i += 1;
  }

  return out;
}

/**
 * Removes the last unmatched `**` outside inline code spans so partial streaming
 * bold markers are never displayed literally to the user.
 *
 * @param {string} text
 * @returns {string}
 */
function stripTrailingUnclosedBold(text) {
  const lines = text.split('\n');
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (DIVIDER_RE.test(line)) continue;

    const masked = maskInlineCodeAndEscapes(line);
    const matches = [...masked.matchAll(/\*\*/g)];

    if (matches.length % 2 === 1) {
      const lastMatch = matches[matches.length - 1];
      const idx = lastMatch.index;
      lines[i] = (line.slice(0, idx) + line.slice(idx + 2)).replace(/[ \t]+$/, '');
      break;
    }
  }

  return lines.join('\n');
}

/**
 * Normalizes a non-code prose/markdown segment for mobile parsing while preserving
 * ATX heading levels, indentation, blockquotes, and tables.
 *
 * @param {string} segment
 * @returns {string}
 */
function normalizeProseSegment(segment) {
  const lines = segment.replace(/[\u200B\u00A0]/g, ' ').split('\n');
  const normalizedLines = lines.map((line) => {
    const trimmedRight = line.replace(/[ \t]+$/, '');
    // Do not split `•` on pipe-table rows or inside inline code spans.
    if (trimmedRight.includes('|') || !trimmedRight.includes('•')) {
      return trimmedRight;
    }
    const masked = maskInlineCodeAndEscapes(trimmedRight);
    let out = '';
    let lastIdx = 0;
    for (const match of masked.matchAll(/(?<=[^\n])[ \t]+•[ \t]+/g)) {
      out += trimmedRight.slice(lastIdx, match.index) + '\n• ';
      lastIdx = match.index + match[0].length;
    }
    out += trimmedRight.slice(lastIdx);
    return out;
  });

  return (
    normalizedLines
      .join('\n')
      // Join orphaned list markers (`•\nItem`, `1.\nItem`) onto one line.
      .replace(
        /^([ \t]*)([•›\-*+]|\d+\.)[ \t]*\n+(?=\S)(?![ \t]*(?:[•›\-*+]|\d+\.)(?:[ \t]|$))/gm,
        '$1$2 '
      )
      .replace(/\n{3,}/g, '\n\n')
  );
}

/**
 * Normalizes raw assistant text for mobile rendering and block parsing.
 * Preserves whitespace and blank lines inside fenced code blocks.
 *
 * @param {string} raw
 * @param {boolean} [isStreaming=false]
 * @returns {string}
 */
export function normalizeMobileText(raw, isStreaming = false) {
  if (typeof raw !== 'string' || raw.length === 0) return '';

  const text = raw
    .replace(/\r\n?/g, '\n')
    .replace(/^[ \t]*INITIATING SYSTEM\.\.\.[ \t]*/i, '');

  const segments = splitFencedSegments(text);
  let joined = segments
    .map((segment) => (segment.isCode ? segment.text : normalizeProseSegment(segment.text)))
    .join('\n');

  if (isStreaming) {
    const postSegments = splitFencedSegments(joined);
    const lastSegment = postSegments[postSegments.length - 1];
    if (lastSegment && !lastSegment.isCode) {
      // Strip dangling empty markers (`1.`, `•`, `-`, `*`, `**`) at the very end.
      lastSegment.text = lastSegment.text.replace(
        /(?:^|\n)[ \t]*(?:\d+\.|[•›\-*+]|\*\*)[ \t]*$/,
        ''
      );
      lastSegment.text = stripTrailingUnclosedBold(lastSegment.text);
      joined = postSegments.map((s) => s.text).join('\n');
    }
  }

  return joined.trim();
}

/**
 * Strips outer matching `**...**` ONLY if the opening `**` at index 0 closes at the
 * very end of the string (so `**API** & **DB**` is NOT stripped).
 *
 * @param {string} text
 * @returns {string}
 */
function stripOuterBoldSafe(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith('**') || !trimmed.endsWith('**') || trimmed.length <= 4) {
    return trimmed;
  }

  const closeIdx = findClosingDelimiter(trimmed, 2, '**');
  if (closeIdx === trimmed.length - 2) {
    return trimmed.slice(2, -2).trim();
  }
  return trimmed;
}

/**
 * Strips wrapping `**...**`, `__...__`, and `` `...` `` around short tags like tech/skill pills.
 *
 * @param {string} text
 * @returns {string}
 */
function stripWrappingFormatting(text) {
  let current = text.trim();
  let changed = true;

  while (changed && current.length >= 2) {
    changed = false;
    if (current.startsWith('`') && current.endsWith('`') && !current.slice(1, -1).includes('`')) {
      current = current.slice(1, -1).trim();
      changed = true;
      continue;
    }
    if (current.startsWith('**') && current.endsWith('**') && current.length > 4) {
      const stripped = stripOuterBoldSafe(current);
      if (stripped !== current) {
        current = stripped;
        changed = true;
        continue;
      }
    }
    if (current.startsWith('__') && current.endsWith('__') && current.length > 4) {
      const closeIdx = findClosingDelimiter(current, 2, '__');
      if (closeIdx === current.length - 2) {
        current = current.slice(2, -2).trim();
        changed = true;
      }
    }
  }

  return current;
}

/**
 * Cleans an ATX heading's text: strips optional closing `#` sequence, outer matching `**`,
 * and trailing `:` without breaking inner bold like `### **API** & **DB**`.
 *
 * @param {string} rawHeading
 * @returns {string}
 */
function cleanHeadingText(rawHeading) {
  let cleaned = rawHeading.trim();
  // CommonMark optional closing hashes preceded by whitespace (preserves `C#` / `F#`).
  cleaned = cleaned.replace(/[ \t]+#+[ \t]*$/, '').trim();

  // Strip trailing colon outside outer bold (`**Title**:`) or inside (`**Title:**`).
  if (cleaned.endsWith(':')) {
    cleaned = cleaned.slice(0, -1).trim();
  }
  cleaned = stripOuterBoldSafe(cleaned);
  if (cleaned.endsWith(':')) {
    cleaned = cleaned.slice(0, -1).trim();
    cleaned = stripOuterBoldSafe(cleaned);
  }

  return cleaned;
}

/**
 * Determines whether a standalone `**Title**` line should be promoted to a heading.
 * Only concise section headers (<= 6 words, no ending `.`, `?`, `!`) are promoted;
 * full bold sentences like `**Yes, he can build it!**` remain paragraphs.
 *
 * @param {string} line
 * @returns {string | null}
 */
function parseStandaloneBoldHeading(line) {
  const trimmed = line.trim();
  let candidate = trimmed;

  // Allow `**Title**:` or `**Title:**`
  let hadTrailingColon = false;
  if (candidate.endsWith(':')) {
    candidate = candidate.slice(0, -1).trim();
    hadTrailingColon = true;
  }

  if (!candidate.startsWith('**') || !candidate.endsWith('**') || candidate.length <= 4) {
    return null;
  }

  const inner = stripOuterBoldSafe(candidate);
  if (inner === candidate) return null;

  let title = inner.trim();
  if (title.endsWith(':')) {
    title = title.slice(0, -1).trim();
    hadTrailingColon = true;
  }

  if (!title) return null;
  if (/[.!?]$/.test(title) && !hadTrailingColon) return null;

  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 6) return null;

  return title;
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
    .map((item) => stripWrappingFormatting(item))
    .filter(Boolean);
}

/**
 * Infers label and kind for a URL inside a project's `Links:` line.
 *
 * @param {string} url
 * @param {string} [explicitLabel]
 * @returns {{ label: string, kind: 'github'|'live'|'link', url: string }}
 */
function buildProjectLink(url, explicitLabel = '') {
  const cleanLabel = stripWrappingFormatting(explicitLabel).trim();
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

  if (domainLabel === 'WhatsApp' || domainLabel === 'LinkedIn' || domainLabel === 'Email' || domainLabel === 'Call') {
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
 * Supports balanced parentheses in URLs, `mailto:`, `tel:`, and ignores partial streaming URLs.
 *
 * @param {string} rawLinks
 * @param {{ isStreaming?: boolean, isEndOfMessage?: boolean }} [options]
 * @returns {Array<{ label: string, kind: 'github'|'live'|'link', url: string }>}
 */
function parseProjectLinks(rawLinks, { isStreaming = false, isEndOfMessage = false } = {}) {
  if (!rawLinks || /none\s+listed\s+on\s+portfolio/i.test(rawLinks)) {
    return [];
  }

  const results = [];
  const seenUrls = new Set();

  const addLink = (url, explicitLabel = '', isAtLineEnd = false) => {
    const { url: cleanUrl } = trimTrailingUrlPunctuation(url.trim());
    if (!cleanUrl || !SAFE_HREF_RE.test(cleanUrl)) return;
    if (isStreaming && isEndOfMessage && isAtLineEnd) return;
    if (!isCompleteLinkUrl(cleanUrl)) return;
    if (seenUrls.has(cleanUrl)) return;

    seenUrls.add(cleanUrl);
    results.push(buildProjectLink(cleanUrl, explicitLabel));
  };

  const segments = rawLinks
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  for (let segIdx = 0; segIdx < segments.length; segIdx += 1) {
    const segment = segments[segIdx];
    const isLastSegment = segIdx === segments.length - 1;
    if (/^(?:none|n\/a|-)$/i.test(segment)) continue;

    // 1. Extract markdown links `[Label](url)` including balanced parentheses.
    let remainder = '';
    let idx = 0;
    while (idx < segment.length) {
      if (segment[idx] === '[') {
        const mdLink = matchMarkdownLink(segment, idx);
        if (mdLink) {
          addLink(mdLink.url, mdLink.label, false);
          remainder += ' ';
          idx = mdLink.endIndex;
          continue;
        }
      }
      remainder += segment[idx];
      idx += 1;
    }

    remainder = remainder.trim();
    if (!remainder) continue;

    // 2. Match `Label: url` (supports https://, http://, mailto:, tel:).
    const labeledMatch = remainder.match(
      /^(?:\*\*([A-Za-z][A-Za-z0-9 &_-]{0,30}):\*\*|\*\*([A-Za-z][A-Za-z0-9 &_-]{0,30})\*\*\s*:|([A-Za-z][A-Za-z0-9 &_-]{0,30})\s*:)\s*((?:https?:\/\/|mailto:|tel:)\S+)$/i
    );
    if (labeledMatch) {
      addLink(
        labeledMatch[4],
        labeledMatch[1] ?? labeledMatch[2] ?? labeledMatch[3],
        isLastSegment
      );
      continue;
    }

    // 3. Extract any remaining bare URLs (`https://`, `mailto:`, `tel:`) in the segment.
    const urlRe = /(?:https?:\/\/[^\s<>]+|mailto:[^\s<>()]+|tel:\+?[\d\-()]{6,20})/gi;
    for (const match of remainder.matchAll(urlRe)) {
      const atEnd = isLastSegment && match.index + match[0].length === remainder.length;
      addLink(match[0], '', atEnd);
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
  const withoutBullet = line.replace(/^[•›\-*+]\s+/, '').trim();
  const match = withoutBullet.match(
    /^(?:\*\*([^:\n*]{2,40}?):\*\*|\*\*([^:\n*]{2,40}?)\*\*\s*:|([^:\n*]{2,40}?)\s*:)\s*(.+)$/
  );
  if (!match) return null;

  const category = stripWrappingFormatting(match[1] ?? match[2] ?? match[3]);
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
    .map((item) => stripWrappingFormatting(item))
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

  const index = Number(numMatch[2]);
  const rawTitle = numMatch[3].trim();
  const boldWithTailMatch = rawTitle.match(/^\*\*([^*\n]+)\*\*\s*(?:[-–—:]\s*(.+))?$/);

  const title = boldWithTailMatch
    ? boldWithTailMatch[1].trim()
    : stripWrappingFormatting(rawTitle);
  let summary =
    boldWithTailMatch && boldWithTailMatch[2] ? boldWithTailMatch[2].trim() : '';

  let tech = [];
  const links = [];
  const seenLinkUrls = new Set();
  let hasMetadata = false;
  let candidateSummary = '';
  let lastConsumedIndex = startIndex;
  let inspectedNonEmpty = 0;

  const appendParsedLinks = (rawLinkText, lineIdx) => {
    const hasLaterNonEmpty = lines.slice(lineIdx + 1).some((l) => l.trim().length > 0);
    const parsed = parseProjectLinks(rawLinkText, {
      isStreaming,
      isEndOfMessage: !hasLaterNonEmpty,
    });
    for (const linkObj of parsed) {
      if (!seenLinkUrls.has(linkObj.url)) {
        seenLinkUrls.add(linkObj.url);
        links.push(linkObj);
      }
    }
  };

  for (let i = startIndex + 1; i < lines.length && inspectedNonEmpty < 6; i += 1) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Stop lookahead if we hit a new block boundary.
    if (
      parseFenceOpen(rawLine) ||
      DIVIDER_RE.test(trimmed) ||
      NUMBERED_LINE_RE.test(trimmed) ||
      ATX_HEADING_RE.test(rawLine) ||
      BLOCKQUOTE_LINE_RE.test(rawLine) ||
      parseStandaloneBoldHeading(trimmed) !== null
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
      appendParsedLinks(linksMatch[1], i);
      hasMetadata = true;
      lastConsumedIndex = i;
      continue;
    }

    if (PROJECT_DIRECT_LINKS_RE.test(trimmed)) {
      appendParsedLinks(trimmed, i);
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

  // Only convert to ProjectCard when project metadata exists, OR when a prior project
  // was already parsed and this item includes a description/summary line.
  const hasDescription = Boolean(summary || candidateSummary);
  if (!hasMetadata && !(hasPriorProject && hasDescription)) {
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
 * Generates a short context suffix for differentiating multiple contact links of the same kind.
 *
 * @param {string} href
 * @param {string} kind
 * @returns {string}
 */
function getLinkContextTag(href, kind) {
  try {
    if (kind === 'email') {
      return href.replace(/^mailto:/i, '');
    }
    if (kind === 'phone') {
      return href.replace(/^tel:/i, '');
    }
    const parsed = new URL(href);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (kind === 'github') {
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
      if (parts.length === 1) return `@${parts[0]}`;
    }
    if (kind === 'linkedin') {
      if (parts.length >= 2 && (parts[0] === 'in' || parts[0] === 'company')) {
        return parts[1];
      }
      if (parts.length >= 1) return parts[parts.length - 1];
    }
    if (parts.length >= 1) {
      return parts.join('/');
    }
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

/**
 * Extracts deduplicated contact/hiring actions from non-project, non-code lines.
 * Ignores inline `code` spans so example emails/URLs in code do not become buttons.
 *
 * @param {string[]} lines
 * @param {boolean} isStreaming
 * @returns {Array<{ label: string, kind: 'email'|'phone'|'whatsapp'|'github'|'linkedin'|'link', href: string }>}
 */
function extractContactActions(lines, isStreaming) {
  const rawText = lines.join('\n').trim();
  if (!rawText) return [];

  // Ignore inline code spans so example addresses/URLs inside backticks aren't extracted.
  const text = maskInlineCodeAndEscapes(rawText);

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
  const urlRe =
    /(?:https?:\/\/)?(?:www\.)?(?:wa\.me\/[^\s<>]+|github\.com\/[^\s<>]+|linkedin\.com\/[^\s<>]+)/gi;

  for (const match of text.matchAll(urlRe)) {
    const rawMatch = match[0];
    const matchStart = match.index;
    const matchEnd = matchStart + rawMatch.length;

    if (matchStart > 0 && /[A-Za-z0-9@._-]/.test(text[matchStart - 1])) {
      continue;
    }
    if (isStreaming && matchEnd === text.length) {
      continue;
    }

    // Strip markdown link `](` or trailing `)` cleanly while keeping balanced parens.
    const preTrim = rawMatch.replace(/\)\s*$/, (tail) => {
      const openCount = (rawMatch.match(/\(/g) || []).length;
      const closeCount = (rawMatch.match(/\)/g) || []).length;
      return closeCount > openCount ? '' : tail;
    });
    const { url: trimmed } = trimTrailingUrlPunctuation(preTrim);
    if (!trimmed) continue;

    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const normalizedForKey = withProto
      .replace(/^(https?:\/\/)www\./i, '$1')
      .toLowerCase()
      .replace(/\/+$/, '');

    if (normalizedForKey.includes('wa.me/')) {
      addAction({ label: 'WhatsApp', kind: 'whatsapp', href: withProto }, `url:${normalizedForKey}`);
    } else if (normalizedForKey.includes('github.com/')) {
      addAction({ label: 'GitHub', kind: 'github', href: withProto }, `url:${normalizedForKey}`);
    } else if (normalizedForKey.includes('linkedin.com/')) {
      addAction({ label: 'LinkedIn', kind: 'linkedin', href: withProto }, `url:${normalizedForKey}`);
    }
  }

  // 3. International / E.164 phone numbers (skip URLs so `wa.me/947...` isn't matched).
  const textWithoutUrls = text.replace(/https?:\/\/[^\s<>]+/gi, ' ');
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

  // Differentiate labels if there are multiple links of the same kind.
  const kindCounts = new Map();
  for (const action of actions) {
    kindCounts.set(action.kind, (kindCounts.get(action.kind) || 0) + 1);
  }

  return actions.map((action) => {
    if ((kindCounts.get(action.kind) || 0) <= 1) return action;
    const context = getLinkContextTag(action.href, action.kind);
    if (!context) return action;
    const truncated = context.length > 26 ? `${context.slice(0, 25)}…` : context;
    return { ...action, label: `${action.label} · ${truncated}` };
  });
}

/**
 * Splits a GFM table row into trimmed cell strings, respecting `\|` escapes and `` `...` `` spans.
 *
 * @param {string} line
 * @returns {string[]}
 */
function splitTableRow(line) {
  const cells = [];
  let current = '';
  let i = 0;

  while (i < line.length) {
    const ch = line[i];
    if (ch === '\\' && i + 1 < line.length && line[i + 1] === '|') {
      current += '|';
      i += 2;
      continue;
    }
    if (ch === '`') {
      let tickLen = 0;
      while (i + tickLen < line.length && line[i + tickLen] === '`') tickLen += 1;
      const closeIdx = findClosingBackticks(line, i + tickLen, tickLen);
      if (closeIdx !== -1) {
        current += line.slice(i, closeIdx + tickLen);
        i = closeIdx + tickLen;
        continue;
      }
      current += line.slice(i, i + tickLen);
      i += tickLen;
      continue;
    }
    if (ch === '|') {
      cells.push(current);
      current = '';
      i += 1;
      continue;
    }
    current += ch;
    i += 1;
  }
  cells.push(current);

  if (cells.length > 0 && cells[0].trim() === '') cells.shift();
  if (cells.length > 0 && cells[cells.length - 1].trim() === '') cells.pop();

  return cells.map((cell) => cell.trim());
}

/**
 * Attempts to parse a GFM table starting at `startIndex`.
 *
 * @param {string[]} lines
 * @param {number} startIndex
 * @returns {{ block: object, nextIndex: number } | null}
 */
function tryParseTable(lines, startIndex) {
  if (startIndex + 1 >= lines.length) return null;

  const headerLine = lines[startIndex].trim();
  const sepLine = lines[startIndex + 1].trim();
  if (!headerLine.includes('|') || !sepLine.includes('|')) return null;

  const sepCells = splitTableRow(sepLine);
  if (sepCells.length === 0 || !sepCells.every((cell) => TABLE_SEP_CELL_RE.test(cell))) {
    return null;
  }

  const headers = splitTableRow(headerLine);
  if (headers.length === 0 || headers.length !== sepCells.length) {
    return null;
  }

  const alignments = sepCells.map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });

  const rows = [];
  let i = startIndex + 2;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || !trimmed.includes('|')) break;
    if (parseFenceOpen(raw) || DIVIDER_RE.test(trimmed) || BLOCKQUOTE_LINE_RE.test(raw)) {
      break;
    }

    const rowCells = splitTableRow(trimmed);
    const normalizedRow = Array.from({ length: headers.length }, (_, colIdx) =>
      rowCells[colIdx] !== undefined ? rowCells[colIdx] : ''
    );
    rows.push(normalizedRow);
    i += 1;
  }

  return {
    block: {
      type: 'table',
      headers,
      alignments,
      rows,
    },
    nextIndex: i,
  };
}

/**
 * Measures leading indentation in spaces (tabs expanded to 2 spaces).
 *
 * @param {string} leadingWhitespace
 * @returns {number}
 */
function measureIndent(leadingWhitespace) {
  let count = 0;
  for (const ch of leadingWhitespace) {
    count += ch === '\t' ? 2 : 1;
  }
  return count;
}

/**
 * Parses a list item marker at the start of a line.
 *
 * @param {string} line
 * @returns {{ indent: number, ordered: boolean, number?: number, content: string, checked?: boolean } | null}
 */
function matchListLine(line) {
  const bulletMatch = line.match(BULLET_LINE_RE);
  if (bulletMatch) {
    const indent = measureIndent(bulletMatch[1]);
    let content = bulletMatch[3].trim();
    const taskMatch = content.match(TASK_ITEM_RE);
    if (taskMatch) {
      return {
        indent,
        ordered: false,
        checked: taskMatch[1].toLowerCase() === 'x',
        content: taskMatch[2].trim(),
      };
    }
    return { indent, ordered: false, content };
  }

  const numMatch = line.match(NUMBERED_LINE_RE);
  if (numMatch) {
    const indent = measureIndent(numMatch[1]);
    const number = Number(numMatch[2]);
    let content = numMatch[3].trim();
    const taskMatch = content.match(TASK_ITEM_RE);
    if (taskMatch) {
      return {
        indent,
        ordered: true,
        number,
        checked: taskMatch[1].toLowerCase() === 'x',
        content: taskMatch[2].trim(),
      };
    }
    return { indent, ordered: true, number, content };
  }

  return null;
}

/**
 * Checks whether a line starts a new non-list block that should interrupt list continuation.
 *
 * @param {string} rawLine
 * @param {string[]} lines
 * @param {number} index
 * @returns {boolean}
 */
function isBlockBoundaryLine(rawLine, lines, index) {
  const trimmed = rawLine.trim();
  if (!trimmed) return true;
  if (parseFenceOpen(rawLine)) return true;
  if (DIVIDER_RE.test(trimmed)) return true;
  if (ATX_HEADING_RE.test(rawLine)) return true;
  if (BLOCKQUOTE_LINE_RE.test(rawLine)) return true;
  if (tryParseTable(lines, index)) return true;
  if (parseStandaloneBoldHeading(trimmed) !== null) return true;
  if (STANDALONE_LABEL_RE.test(trimmed)) return true;
  if (tryParseInlineSkillGroup(trimmed)) return true;
  if (KNOWN_SKILL_CATEGORIES.has(stripWrappingFormatting(trimmed.replace(/:$/, '')).toLowerCase())) {
    return true;
  }
  return false;
}

/**
 * Parses a potentially nested bullet/ordered/task list starting at `startIndex`.
 *
 * @param {string[]} lines
 * @param {number} startIndex
 * @param {number} baseIndent
 * @param {boolean} expectedOrdered
 * @param {string[]} nonProjectLines
 * @returns {{ block: object, nextIndex: number }}
 */
function parseListBlock(lines, startIndex, baseIndent, expectedOrdered, nonProjectLines) {
  const items = [];
  let startNumber = 1;
  let i = startIndex;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      // Peek past blank lines: continue only if another matching item at baseIndent follows.
      let peek = i + 1;
      while (peek < lines.length && !lines[peek].trim()) peek += 1;
      if (peek >= lines.length) break;

      const peekMarker = matchListLine(lines[peek]);
      if (
        peekMarker &&
        peekMarker.indent === baseIndent &&
        peekMarker.ordered === expectedOrdered
      ) {
        i = peek;
        continue;
      }
      break;
    }

    if (DIVIDER_RE.test(trimmed)) break;

    const marker = matchListLine(rawLine);
    if (marker) {
      if (marker.indent < baseIndent) break;

      if (marker.indent > baseIndent) {
        // Nested sub-list attached to previous item.
        if (items.length === 0) break;
        const subResult = parseListBlock(
          lines,
          i,
          marker.indent,
          marker.ordered,
          nonProjectLines
        );
        const currentItem = items[items.length - 1];
        currentItem.children.push(subResult.block);
        i = subResult.nextIndex;
        continue;
      }

      // Same indent: break if list type switches (e.g. ordered -> bullet).
      if (marker.ordered !== expectedOrdered) break;

      if (items.length === 0 && expectedOrdered && marker.number !== undefined) {
        startNumber = marker.number;
      }

      nonProjectLines.push(trimmed);
      items.push({
        text: marker.content,
        ...(marker.checked !== undefined ? { checked: marker.checked } : {}),
        ...(marker.number !== undefined ? { number: marker.number } : {}),
        children: [],
      });
      i += 1;
      continue;
    }

    // Continuation line for the current list item.
    if (items.length === 0 || isBlockBoundaryLine(rawLine, lines, i)) {
      break;
    }

    const currentItem = items[items.length - 1];
    currentItem.text = currentItem.text ? `${currentItem.text}\n${trimmed}` : trimmed;
    nonProjectLines.push(trimmed);
    i += 1;
  }

  return {
    block: {
      type: 'list',
      ordered: expectedOrdered,
      ...(expectedOrdered ? { start: startNumber } : {}),
      items,
    },
    nextIndex: i,
  };
}

/**
 * Parses an assistant message into semantic block objects tailored for mobile UI rendering.
 *
 * @param {string} text
 * @param {{ isStreaming?: boolean, includeContactActions?: boolean }} [options]
 * @returns {Array<object>}
 */
export function parseMobileBlocks(
  text,
  { isStreaming = false, includeContactActions = true } = {}
) {
  const normalized = normalizeMobileText(text, isStreaming);
  if (!normalized) return [];

  const lines = normalized.split('\n');
  const blocks = [];
  const nonProjectLines = [];
  let hasPriorProject = false;

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // 1. Fenced code block (supports ``` and ~~~, 3+ chars, info strings, unclosed while streaming)
    const fence = parseFenceOpen(rawLine);
    if (fence) {
      const codeLines = [];
      i += 1;
      let closed = false;
      while (i < lines.length) {
        if (isFenceClose(lines[i], fence)) {
          closed = true;
          i += 1;
          break;
        }
        codeLines.push(lines[i]);
        i += 1;
      }

      blocks.push({
        type: 'code_block',
        language: fence.language,
        ...(fence.meta ? { meta: fence.meta } : {}),
        code: codeLines.join('\n'),
        ...(isStreaming && !closed ? { isStreaming: true } : {}),
      });
      continue;
    }

    // 2. Horizontal rule (`---`, `***`, `___`, `- - -`, etc.)
    if (DIVIDER_RE.test(trimmed)) {
      blocks.push({ type: 'divider' });
      hasPriorProject = false;
      i += 1;
      continue;
    }

    // 3. ATX Heading (`#`..`######`, including `##Heading`)
    const atxMatch = rawLine.match(ATX_HEADING_RE);
    if (atxMatch) {
      const level = atxMatch[1].length;
      const headingText = cleanHeadingText(atxMatch[2] ?? atxMatch[3] ?? '');
      if (headingText) {
        blocks.push({ type: 'heading', level, text: headingText });
        nonProjectLines.push(trimmed);
        hasPriorProject = false;
      }
      i += 1;
      continue;
    }

    // 4. Blockquote (`> ...`, multi-line grouped)
    const quoteMatch = rawLine.match(BLOCKQUOTE_LINE_RE);
    if (quoteMatch) {
      const quoteLines = [];
      while (i < lines.length) {
        const qm = lines[i].match(BLOCKQUOTE_LINE_RE);
        if (!qm) break;
        const innerLine = (qm[1] ?? '').trimEnd();
        quoteLines.push(innerLine);
        if (innerLine.trim()) {
          nonProjectLines.push(innerLine);
        }
        i += 1;
      }
      blocks.push({
        type: 'blockquote',
        lines: quoteLines,
        text: quoteLines.join('\n').trim(),
      });
      continue;
    }

    // 5. GFM Table
    const tableResult = tryParseTable(lines, i);
    if (tableResult) {
      blocks.push(tableResult.block);
      nonProjectLines.push(
        ...tableResult.block.headers,
        ...tableResult.block.rows.flat()
      );
      i = tableResult.nextIndex;
      continue;
    }

    // 6. Inline skill group (`- Languages: PYTHON, JAVA, C#` or `Languages: PYTHON, JAVA`)
    const inlineSkill = tryParseInlineSkillGroup(trimmed);
    if (inlineSkill) {
      blocks.push(inlineSkill);
      nonProjectLines.push(trimmed);
      i += 1;
      continue;
    }

    // 7. Known skill heading followed by short skill bullets
    const headingCandidate = stripWrappingFormatting(trimmed.replace(/:$/, ''));
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
          let peek = lookahead + 1;
          while (peek < lines.length && !lines[peek].trim()) peek += 1;
          if (peek >= lines.length || !BULLET_LINE_RE.test(lines[peek].trim())) {
            break;
          }
          lookahead += 1;
          continue;
        }

        const bMatch = nextTrimmed.match(BULLET_LINE_RE);
        if (!bMatch || !isShortSkillBullet(bMatch[3].trim())) {
          break;
        }

        skillItems.push(stripWrappingFormatting(bMatch[3].trim()));
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

    // 8. Standalone concise bold heading (`**Title**`)
    const boldHeadingTitle = parseStandaloneBoldHeading(trimmed);
    if (boldHeadingTitle) {
      blocks.push({ type: 'heading', level: 2, text: boldHeadingTitle });
      nonProjectLines.push(trimmed);
      hasPriorProject = false;
      i += 1;
      continue;
    }

    // 9. Numbered project card or ordered/nested/task list
    const listMarker = matchListLine(rawLine);
    if (listMarker) {
      if (listMarker.ordered && listMarker.indent === 0) {
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
      }

      const listResult = parseListBlock(
        lines,
        i,
        listMarker.indent,
        listMarker.ordered,
        nonProjectLines
      );
      blocks.push(listResult.block);
      i = listResult.nextIndex;
      continue;
    }

    // 10. Standalone `Tech:` / `Links:` / `Link:` label fallback
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

    // 11. Paragraph (group consecutive plain prose lines until blank line or structural marker)
    const paragraphLines = [trimmed];
    nonProjectLines.push(trimmed);
    i += 1;

    while (i < lines.length) {
      const nextRaw = lines[i];
      const nextTrimmed = nextRaw.trim();
      if (!nextTrimmed) break;
      if (
        parseFenceOpen(nextRaw) ||
        DIVIDER_RE.test(nextTrimmed) ||
        ATX_HEADING_RE.test(nextRaw) ||
        BLOCKQUOTE_LINE_RE.test(nextRaw) ||
        matchListLine(nextRaw) ||
        STANDALONE_LABEL_RE.test(nextTrimmed) ||
        parseStandaloneBoldHeading(nextTrimmed) !== null ||
        tryParseTable(lines, i) ||
        tryParseInlineSkillGroup(nextTrimmed) ||
        KNOWN_SKILL_CATEGORIES.has(
          stripWrappingFormatting(nextTrimmed.replace(/:$/, '')).toLowerCase()
        )
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

  if (includeContactActions) {
    const contactActions = extractContactActions(nonProjectLines, isStreaming);
    if (contactActions.length > 0) {
      blocks.push({ type: 'contact_actions', actions: contactActions });
    }
  }

  return blocks;
}

/**
 * Finds the closing run of exact `tickLen` backticks starting from `fromIndex`.
 *
 * @param {string} text
 * @param {number} fromIndex
 * @param {number} tickLen
 * @returns {number}
 */
function findClosingBackticks(text, fromIndex, tickLen) {
  let i = fromIndex;
  while (i < text.length) {
    if (text[i] === '`') {
      let run = 0;
      while (i + run < text.length && text[i + run] === '`') run += 1;
      if (run === tickLen) return i;
      i += run;
      continue;
    }
    i += 1;
  }
  return -1;
}

/**
 * Matches a markdown link `[label](url)` starting at `startIndex`, supporting nested
 * formatting/brackets in label, balanced parentheses in URL, and `<url>` or optional title.
 *
 * @param {string} text
 * @param {number} startIndex
 * @returns {{ label: string, url: string, endIndex: number } | null}
 */
function matchMarkdownLink(text, startIndex) {
  if (text[startIndex] !== '[') return null;

  let i = startIndex + 1;
  let bracketDepth = 1;

  while (i < text.length && bracketDepth > 0) {
    const ch = text[i];
    if (ch === '\\' && i + 1 < text.length) {
      i += 2;
      continue;
    }
    if (ch === '`') {
      let tickLen = 0;
      while (i + tickLen < text.length && text[i + tickLen] === '`') tickLen += 1;
      const closeTick = findClosingBackticks(text, i + tickLen, tickLen);
      if (closeTick !== -1) {
        i = closeTick + tickLen;
        continue;
      }
      i += tickLen;
      continue;
    }
    if (ch === '[') bracketDepth += 1;
    else if (ch === ']') bracketDepth -= 1;
    else if (ch === '\n' && text[i + 1] === '\n') return null;

    if (bracketDepth === 0) break;
    i += 1;
  }

  if (bracketDepth !== 0 || text[i + 1] !== '(') return null;

  const label = text.slice(startIndex + 1, i);
  if (!label) return null;

  let j = i + 2;
  let parenDepth = 1;
  let inQuote = null;

  while (j < text.length && parenDepth > 0) {
    const ch = text[j];
    if (ch === '\\' && j + 1 < text.length) {
      j += 2;
      continue;
    }
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
      j += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      j += 1;
      continue;
    }
    if (ch === '(') parenDepth += 1;
    else if (ch === ')') parenDepth -= 1;
    else if (ch === '\n' && text[j + 1] === '\n') return null;

    if (parenDepth === 0) break;
    j += 1;
  }

  if (parenDepth !== 0) return null;

  let rawTarget = text.slice(i + 2, j).trim();
  if (!rawTarget) return null;

  if (rawTarget.startsWith('<')) {
    const gtIdx = rawTarget.indexOf('>');
    if (gtIdx > 1) {
      rawTarget = rawTarget.slice(1, gtIdx).trim();
    }
  } else {
    // Strip optional link title `url "title"` or `url 'title'`.
    rawTarget = rawTarget.replace(/\s+(?:"[^"]*"|'[^']*')\s*$/, '').trim();
  }

  if (!rawTarget || /\s/.test(rawTarget) || !SAFE_HREF_RE.test(rawTarget)) {
    return null;
  }

  return { label, url: rawTarget, endIndex: j + 1 };
}

/**
 * Finds a matching closing delimiter (`**`, `__`, `~~`, `***`, `*`, `_`) while skipping
 * backslash escapes, code spans, markdown links, and balanced inner spans.
 *
 * @param {string} text
 * @param {number} fromIndex
 * @param {string} delimiter
 * @returns {number}
 */
function findClosingDelimiter(text, fromIndex, delimiter) {
  let i = fromIndex;
  const dLen = delimiter.length;

  while (i <= text.length - dLen) {
    const ch = text[i];

    if (ch === '\\' && i + 1 < text.length) {
      i += 2;
      continue;
    }

    if (ch === '`') {
      let tickLen = 0;
      while (i + tickLen < text.length && text[i + tickLen] === '`') tickLen += 1;
      const closeTick = findClosingBackticks(text, i + tickLen, tickLen);
      if (closeTick !== -1) {
        i = closeTick + tickLen;
        continue;
      }
      i += tickLen;
      continue;
    }

    if (ch === '[') {
      const mdLink = matchMarkdownLink(text, i);
      if (mdLink) {
        i = mdLink.endIndex;
        continue;
      }
    }

    // For `**`, skip balanced single `*...*` inside so `**bold *italic***` matches final `**`.
    if (
      delimiter === '**' &&
      ch === '*' &&
      text[i + 1] !== '*' &&
      i > fromIndex &&
      !/\s/.test(text[i + 1] || '')
    ) {
      const innerStarClose = findClosingDelimiter(text, i + 1, '*');
      if (innerStarClose !== -1) {
        i = innerStarClose + 1;
        continue;
      }
    }

    // For `*`, skip balanced `**...**` inside so `*italic **bold***` matches final `*`.
    if (
      delimiter === '*' &&
      text.startsWith('**', i) &&
      text[i + 2] !== '*' &&
      !/\s/.test(text[i + 2] || '')
    ) {
      const innerDoubleClose = findClosingDelimiter(text, i + 2, '**');
      if (innerDoubleClose !== -1) {
        i = innerDoubleClose + 2;
        continue;
      }
    }

    if (text.startsWith(delimiter, i)) {
      const prevChar = i > 0 ? text[i - 1] : '';
      if (!prevChar || !/\s/.test(prevChar)) {
        if (delimiter === '_' || delimiter === '__') {
          const nextChar = text[i + dLen] || '';
          if (!/[A-Za-z0-9_]/.test(nextChar)) {
            return i;
          }
        } else if (delimiter === '*' && text[i + 1] === '*' && text[i + 2] !== '*') {
          // Don't treat an inner `**` opener as a single `*` closer unless it's `***`.
          const afterDouble = findClosingDelimiter(text, i + 2, '**');
          if (afterDouble !== -1) {
            i = afterDouble + 2;
            continue;
          }
          return i;
        } else {
          return i;
        }
      }
    }

    i += 1;
  }

  return -1;
}

/**
 * Tokenizes inline markdown, links, emails, and E.164 phone numbers for mobile rendering
 * with recursive support for nested inline spans.
 *
 * @param {string} text
 * @param {{ isStreaming?: boolean, depth?: number, inLink?: boolean }} [options]
 * @returns {Array<
 *   | { type: 'text', value: string }
 *   | { type: 'bold', value: string, children?: Array<object> }
 *   | { type: 'italic', value: string, children?: Array<object> }
 *   | { type: 'strikethrough', value: string, children?: Array<object> }
 *   | { type: 'code', value: string }
 *   | { type: 'link', label: string, labelTokens?: Array<object>, url: string }
 *   | { type: 'email', value: string }
 *   | { type: 'phone', display: string, href: string }
 * >}
 */
export function parseInlineTokens(
  text,
  { isStreaming = false, depth = 0, inLink = false } = {}
) {
  if (typeof text !== 'string' || text.length === 0) return [];
  if (depth >= 6) return [{ type: 'text', value: text }];

  let input = text;
  if (isStreaming && depth === 0) {
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

  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];

    // 1. Backslash escapes (`\*`, `` \` ``, `\[`, etc.)
    if (ch === '\\' && i + 1 < len && ESCAPABLE_CHAR_RE.test(input[i + 1])) {
      pushText(input[i + 1]);
      i += 2;
      continue;
    }

    // 2. Inline code spans (single and multi-backtick)
    if (ch === '`') {
      let tickLen = 0;
      while (i + tickLen < len && input[i + tickLen] === '`') tickLen += 1;
      const closeIdx = findClosingBackticks(input, i + tickLen, tickLen);
      if (closeIdx !== -1) {
        let codeValue = input.slice(i + tickLen, closeIdx).replace(/\n/g, ' ');
        if (
          codeValue.length >= 2 &&
          codeValue.startsWith(' ') &&
          codeValue.endsWith(' ') &&
          /[^ ]/.test(codeValue)
        ) {
          codeValue = codeValue.slice(1, -1);
        }
        tokens.push({ type: 'code', value: codeValue });
        i = closeIdx + tickLen;
        continue;
      }
      pushText(input.slice(i, i + tickLen));
      i += tickLen;
      continue;
    }

    // 3. Autolinks (`<https://...>`, `<mailto:...>`, `<tel:...>`)
    if (!inLink && ch === '<') {
      const autoMatch = input
        .slice(i)
        .match(/^<((?:https?:\/\/|mailto:|tel:)[^\s<>]+)>/i);
      if (autoMatch) {
        const rawHref = autoMatch[1];
        if (/^mailto:/i.test(rawHref)) {
          tokens.push({ type: 'email', value: rawHref.replace(/^mailto:/i, '') });
          i += autoMatch[0].length;
          continue;
        }
        if (/^tel:/i.test(rawHref)) {
          const display = rawHref.replace(/^tel:/i, '');
          tokens.push({ type: 'phone', display, href: rawHref });
          i += autoMatch[0].length;
          continue;
        }
        if (isCompleteLinkUrl(rawHref)) {
          tokens.push({
            type: 'link',
            label: formatBareUrlLabel(rawHref),
            url: rawHref,
          });
          i += autoMatch[0].length;
          continue;
        }
      }
    }

    // 4. Markdown links `[label](url)`
    if (!inLink && ch === '[') {
      const mdLink = matchMarkdownLink(input, i);
      if (mdLink) {
        const labelTokens = parseInlineTokens(mdLink.label, {
          isStreaming,
          depth: depth + 1,
          inLink: true,
        });
        tokens.push({
          type: 'link',
          label: mdLink.label,
          labelTokens,
          url: mdLink.url,
        });
        i = mdLink.endIndex;
        continue;
      }
    }

    // 5. Bare URLs (`https://...` / `http://...`)
    if (
      !inLink &&
      (ch === 'h' || ch === 'H') &&
      (i === 0 || !/[A-Za-z0-9]/.test(input[i - 1]))
    ) {
      const urlMatch = input.slice(i).match(/^https?:\/\/[^\s<>]+/i);
      if (urlMatch) {
        const rawUrl = urlMatch[0];
        const endPos = i + rawUrl.length;
        if (isStreaming && endPos === len) {
          pushText(rawUrl);
          i = endPos;
          continue;
        }
        const { url, trailing } = trimTrailingUrlPunctuation(rawUrl);
        if (url && isCompleteLinkUrl(url)) {
          tokens.push({ type: 'link', label: formatBareUrlLabel(url), url });
          if (trailing) pushText(trailing);
          i = endPos;
          continue;
        }
      }
    }

    // 6. Bare emails
    if (!inLink && (i === 0 || !/[A-Za-z0-9._%+-]/.test(input[i - 1]))) {
      const emailMatch = input
        .slice(i)
        .match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
      if (emailMatch) {
        const endPos = i + emailMatch[0].length;
        if (isStreaming && endPos === len) {
          pushText(emailMatch[0]);
        } else {
          tokens.push({ type: 'email', value: emailMatch[0] });
        }
        i = endPos;
        continue;
      }
    }

    // 7. E.164 phone numbers
    if (!inLink && ch === '+' && (i === 0 || !/[\w+]/.test(input[i - 1]))) {
      const phoneMatch = input.slice(i).match(/^\+\d[\d\s\-()]{6,18}\d(?![\w])/);
      if (phoneMatch) {
        const rawPhone = phoneMatch[0];
        const digits = rawPhone.replace(/\D/g, '');
        const endPos = i + rawPhone.length;
        if (digits.length >= 7 && digits.length <= 15 && !(isStreaming && endPos === len)) {
          let display = rawPhone;
          let trailing = '';
          if (display.endsWith(')') && !display.includes('(')) {
            display = display.slice(0, -1);
            trailing = ')';
          }
          tokens.push({ type: 'phone', display: display.trim(), href: `tel:+${digits}` });
          if (trailing) pushText(trailing);
          i = endPos;
          continue;
        }
      }
    }

    // 8. Strikethrough `~~...~~`
    if (input.startsWith('~~', i) && input[i + 2] && !/\s/.test(input[i + 2])) {
      const closeIdx = findClosingDelimiter(input, i + 2, '~~');
      if (closeIdx !== -1 && closeIdx > i + 2) {
        const inner = input.slice(i + 2, closeIdx);
        tokens.push({
          type: 'strikethrough',
          value: inner,
          children: parseInlineTokens(inner, { isStreaming, depth: depth + 1, inLink }),
        });
        i = closeIdx + 2;
        continue;
      }
    }

    // 9. Bold + Italic `***...***` or `___...___`
    if (
      (input.startsWith('***', i) && input[i + 3] !== '*') ||
      (input.startsWith('___', i) &&
        input[i + 3] !== '_' &&
        (i === 0 || !/[A-Za-z0-9_]/.test(input[i - 1])))
    ) {
      const triple = input.slice(i, i + 3);
      if (input[i + 3] && !/\s/.test(input[i + 3])) {
        const closeTriple = findClosingDelimiter(input, i + 3, triple);
        if (closeTriple !== -1 && closeTriple > i + 3) {
          const inner = input.slice(i + 3, closeTriple);
          tokens.push({
            type: 'bold',
            value: inner,
            children: [
              {
                type: 'italic',
                value: inner,
                children: parseInlineTokens(inner, { isStreaming, depth: depth + 1, inLink }),
              },
            ],
          });
          i = closeTriple + 3;
          continue;
        }
      }
    }

    // 10. Bold `**...**`
    if (input.startsWith('**', i) && input[i + 2] && !/\s/.test(input[i + 2])) {
      const closeIdx = findClosingDelimiter(input, i + 2, '**');
      if (closeIdx !== -1 && closeIdx > i + 2) {
        const inner = input.slice(i + 2, closeIdx).trimEnd();
        tokens.push({
          type: 'bold',
          value: inner,
          children: parseInlineTokens(inner, { isStreaming, depth: depth + 1, inLink }),
        });
        i = closeIdx + 2;
        continue;
      }
    }

    // 11. Bold `__...__`
    if (
      input.startsWith('__', i) &&
      (i === 0 || !/[A-Za-z0-9_]/.test(input[i - 1])) &&
      input[i + 2] &&
      !/\s/.test(input[i + 2])
    ) {
      const closeIdx = findClosingDelimiter(input, i + 2, '__');
      if (closeIdx !== -1 && closeIdx > i + 2) {
        const inner = input.slice(i + 2, closeIdx).trimEnd();
        tokens.push({
          type: 'bold',
          value: inner,
          children: parseInlineTokens(inner, { isStreaming, depth: depth + 1, inLink }),
        });
        i = closeIdx + 2;
        continue;
      }
    }

    // 12. Italic `*...*`
    if (ch === '*' && input[i + 1] !== '*' && input[i + 1] && !/\s/.test(input[i + 1])) {
      const closeIdx = findClosingDelimiter(input, i + 1, '*');
      if (closeIdx !== -1 && closeIdx > i + 1) {
        const inner = input.slice(i + 1, closeIdx);
        tokens.push({
          type: 'italic',
          value: inner,
          children: parseInlineTokens(inner, { isStreaming, depth: depth + 1, inLink }),
        });
        i = closeIdx + 1;
        continue;
      }
    }

    // 13. Italic `_..._`
    if (
      ch === '_' &&
      input[i + 1] !== '_' &&
      (i === 0 || !/[A-Za-z0-9_]/.test(input[i - 1])) &&
      input[i + 1] &&
      !/\s/.test(input[i + 1])
    ) {
      const closeIdx = findClosingDelimiter(input, i + 1, '_');
      if (closeIdx !== -1 && closeIdx > i + 1) {
        const inner = input.slice(i + 1, closeIdx);
        tokens.push({
          type: 'italic',
          value: inner,
          children: parseInlineTokens(inner, { isStreaming, depth: depth + 1, inLink }),
        });
        i = closeIdx + 1;
        continue;
      }
    }

    pushText(ch);
    i += 1;
  }

  return tokens;
}
