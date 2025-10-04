'use client';

import { useEffect, useState } from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import { X } from 'lucide-react';

interface FullPagePRDViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  productName: string;
  model: string;
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className || 'w-6 h-6'}
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
      strokeWidth={2.5}
      stroke="currentColor"
      className={className || 'w-6 h-6'}
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
      strokeWidth={2.5}
      stroke="currentColor"
      className={className || 'w-6 h-6'}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

export function FullPagePRDViewer({
  isOpen,
  onClose,
  content,
  productName,
  model
}: FullPagePRDViewerProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopy = async () => {
    const plainText = content
      .replace(/###\s/g, '')
      .replace(/##\s/g, '')
      .replace(/#\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/---\s/g, '\n')
      .replace(/-\s/g, '');

    try {
      await navigator.clipboard.writeText(plainText);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  const handleDownload = () => {
    const sanitizedName = productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${sanitizedName}_prd_${new Date().toISOString().split('T')[0]}.md`;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-0">
      <div className="w-full h-full bg-white flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-[4px] border-black bg-white flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1
              className="text-3xl font-black text-black uppercase tracking-wide"
              style={{
                fontFamily:
                  "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
              }}
            >
              {productName} - PRD
            </h1>
            <span className="px-3 py-1 bg-[#FFEB3B] text-black text-sm font-bold uppercase tracking-wide border-[2px] border-black">
              {model}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide bg-[#2196F3] text-white border-[2px] border-black shadow-[2px_2px_0px_#000] transition-all duration-150 hover:shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] focus:outline-none"
              title="Copy to clipboard"
            >
              {isCopied ? (
                <span className="flex items-center">
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Copied!
                </span>
              ) : (
                <span className="flex items-center">
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Copy
                </span>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide bg-[#4CAF50] text-white border-[2px] border-black shadow-[2px_2px_0px_#000] transition-all duration-150 hover:shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] focus:outline-none"
              title="Download as Markdown"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download
            </button>

            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide bg-[#F44336] text-white border-[2px] border-black shadow-[2px_2px_0px_#000] transition-all duration-150 hover:shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] focus:outline-none"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto neo-full-page-content">
          <div className="max-w-5xl mx-auto p-8">
            {content && content.trim().length > 0 ? (
              <div className="markdown-content text-black font-medium leading-relaxed">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  No PRD content to display.
                </p>
                <p className="text-gray-400 mt-2">
                  Please generate a PRD first.
                </p>
                <p className="text-gray-300 mt-1 text-sm">
                  Debug: Content length = {content?.length || 0}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
