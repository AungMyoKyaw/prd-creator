import { ReactNode } from "react";

function applyInlineFormatting(text: string): ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let currentList: ReactNode[] = [];

  const flushList = () => {
    if (currentList.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-6">
        {currentList}
      </ul>
    );
    currentList = [];
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const isListItem =
      trimmedLine.startsWith("* ") || trimmedLine.startsWith("- ");

    if (!isListItem) {
      flushList();
    }

    if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h1 key={index}>{applyInlineFormatting(line.substring(2))}</h1>
      );
      return;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2 key={index}>{applyInlineFormatting(line.substring(3))}</h2>
      );
      return;
    }

    if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <h3 key={index}>{applyInlineFormatting(line.substring(4))}</h3>
      );
      return;
    }

    if (/^---\s*$/.test(line)) {
      flushList();
      blocks.push(<hr key={index} />);
      return;
    }

    if (isListItem) {
      currentList.push(
        <li key={index}>{applyInlineFormatting(trimmedLine.substring(2))}</li>
      );
      return;
    }

    if (trimmedLine !== "") {
      blocks.push(<p key={index}>{applyInlineFormatting(line)}</p>);
    }
  });

  flushList();

  return <>{blocks}</>;
}
