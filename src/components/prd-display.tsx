"use client";

import { useEffect, useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";

interface PRDDisplayProps {
  content: string;
  isLivePreview?: boolean;
  productName?: string;
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className || "w-6 h-6"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className || "w-6 h-6"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className || "w-6 h-6"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

export function PRDDisplay({
  content,
  isLivePreview = false,
  productName = 'PRD'
}: PRDDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  const handleCopy = async () => {
    const plainText = content
      .replace(/###\s/g, "")
      .replace(/##\s/g, "")
      .replace(/#\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/---\s/g, "\n")
      .replace(/-\s/g, "");

    try {
      await navigator.clipboard.writeText(plainText);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  const handleDownload = () => {
    // Create a sanitized filename
    const sanitizedName = productName
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    const fileName = `${sanitizedName}_prd_${new Date().toISOString().split('T')[0]}.md`;
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center p-4 border-b border-slate-600">
        <h2 className="text-xl font-semibold text-white">
          {isLivePreview ? "Live Preview" : "Generated PRD"}
        </h2>
        {!isLivePreview && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
              title="Download as Markdown"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
              title="Copy to clipboard"
            >
              {isCopied ? (
                <span className="flex items-center">
                  <CheckIcon className="w-4 h-4 mr-2 text-green-400" />
                  Copied!
                </span>
              ) : (
                <span className="flex items-center">
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Copy
                </span>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="markdown-content text-slate-300">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}
