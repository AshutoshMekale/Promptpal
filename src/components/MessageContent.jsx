import { useState } from "react";
import { copyToClipboard } from "../utils/clipboard";

function renderInline(text, keyPrefix) {
  const parts = [];
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={`${keyPrefix}-code-${idx++}`} className="inline-code">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-bold-${idx++}`}>
          {token.slice(2, -2)}
        </strong>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{language || "code"}</span>
        <button type="button" className="code-copy-btn" onClick={handleCopy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextSegment({ text, segmentKey }) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const HeadingTag = level === 1 ? "h3" : level === 2 ? "h4" : "h5";
      blocks.push(
        <HeadingTag key={`${segmentKey}-h-${i}`} className="msg-heading">
          {renderInline(content, `${segmentKey}-h-${i}`)}
        </HeadingTag>
      );
      i += 1;
      continue;
    }

    if (/^([-*•])\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^([-*•])\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^([-*•])\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ul key={`${segmentKey}-ul-${i}`} className="msg-list">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `${segmentKey}-ul-${i}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ol key={`${segmentKey}-ol-${i}`} className="msg-list">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `${segmentKey}-ol-${i}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    blocks.push(
      <p key={`${segmentKey}-p-${i}`}>
        {renderInline(line, `${segmentKey}-p-${i}`)}
      </p>
    );
    i += 1;
  }

  return <>{blocks}</>;
}

export default function MessageContent({ text }) {
  const segments = [];
  const fenceRegex = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = fenceRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
        key: `seg-${idx++}`,
      });
    }
    segments.push({
      type: "code",
      language: match[1] || "code",
      value: match[2].replace(/\n$/, ""),
      key: `seg-${idx++}`,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      value: text.slice(lastIndex),
      key: `seg-${idx}`,
    });
  }

  return (
    <div className="message-content">
      {segments.map((seg) =>
        seg.type === "code" ? (
          <CodeBlock key={seg.key} language={seg.language} code={seg.value} />
        ) : (
          <TextSegment key={seg.key} text={seg.value} segmentKey={seg.key} />
        )
      )}
    </div>
  );
}
