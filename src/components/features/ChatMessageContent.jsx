const splitCommaList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const renderInline = (text, keyPrefix = '') => {
  const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s<]+)/g).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} className="font-bold text-red">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red underline underline-offset-2 break-all hover:text-light"
        >
          {part}
        </a>
      );
    }

    return <span key={key}>{part}</span>;
  });
};

const normalizeMessage = (text) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/([^\n])\s+•\s+/g, '$1\n• ')
    .replace(/\s*\*\*([^*]+)\*\*\s*/g, '\n**$1**\n')
    .replace(/\n{3,}/g, '\n\n');

const parseBlocks = (text) => {
  const lines = normalizeMessage(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks = [];
  let currentList = null;

  const flushList = () => {
    if (!currentList) return;
    blocks.push(currentList);
    currentList = null;
  };

  for (const line of lines) {
    const headingMatch = line.match(/^\*\*([^*]+)\*\*$/);
    const bulletMatch = line.match(/^[•\-*]\s+(.+)$/);
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    const labelMatch = line.match(/^(Tech|Links):\s*(.*)$/i);

    if (headingMatch) {
      flushList();
      blocks.push({ type: 'heading', text: headingMatch[1] });
      continue;
    }

    if (bulletMatch) {
      const content = bulletMatch[1];
      const inlineHeading = content.match(/^\*\*([^*]+)\*\*$/);

      if (inlineHeading) {
        flushList();
        blocks.push({ type: 'heading', text: inlineHeading[1] });
        continue;
      }

      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }

      if (content.includes(',') && !content.includes('http')) {
        currentList.items.push(...splitCommaList(content));
      } else {
        currentList.items.push(content);
      }
      continue;
    }

    if (numberedMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberedMatch[2]);
      continue;
    }

    if (labelMatch) {
      flushList();
      blocks.push({
        type: 'label',
        label: labelMatch[1],
        text: labelMatch[2],
      });
      continue;
    }

    flushList();

    if (line.includes(',') && line.length < 120 && !line.includes('http') && line.split(',').length > 2) {
      blocks.push({ type: 'tags', items: splitCommaList(line) });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
  }

  flushList();
  return blocks;
};

export default function ChatMessageContent({ text }) {
  const blocks = parseBlocks(text);

  if (!blocks.length) {
    return <p className="leading-relaxed whitespace-pre-wrap break-words">{text}</p>;
  }

  return (
    <div className="space-y-3 leading-relaxed break-words">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <p
              key={index}
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-red border-b border-red/20 pb-1"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={index} className="text-light/90">
              {renderInline(block.text, `p-${index}`)}
            </p>
          );
        }

        if (block.type === 'label') {
          return (
            <p key={index} className="text-[11px] text-muted">
              <span className="font-bold uppercase tracking-wider text-light/80">{block.label}:</span>{' '}
              <span className="text-light/90">{renderInline(block.text, `label-${index}`)}</span>
            </p>
          );
        }

        if (block.type === 'tags') {
          return (
            <div key={index} className="flex flex-wrap gap-1.5">
              {block.items.map((item, itemIndex) => (
                <span
                  key={itemIndex}
                  className="inline-flex items-center border border-border-strong bg-primary/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-light/90"
                >
                  {item}
                </span>
              ))}
            </div>
          );
        }

        const ListTag = block.type === 'ol' ? 'ol' : 'ul';

        return (
          <ListTag
            key={index}
            className={`space-y-1.5 ${block.type === 'ol' ? 'list-decimal pl-4' : 'pl-0'}`}
          >
            {block.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className={`text-light/90 ${block.type === 'ul' ? 'flex gap-2' : ''}`}
              >
                {block.type === 'ul' && (
                  <span className="mt-[3px] text-red font-bold leading-none">›</span>
                )}
                <span>{renderInline(item, `item-${index}-${itemIndex}`)}</span>
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
