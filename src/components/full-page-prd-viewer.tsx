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
      className={className || 'h-6 w-6'}
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
      className={className || 'h-6 w-6'}
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
      className={className || 'h-6 w-6'}
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
    <div className="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-black p-0">
      <div className="flex h-full w-full flex-col bg-white">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b-[4px] border-black bg-white p-6">
          <div className="flex items-center gap-4">
            <h1
              className="text-3xl font-black tracking-wide text-black uppercase"
              style={{
                fontFamily:
                  "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
              }}
            >
              {productName} - PRD
            </h1>
            <span className="border-[2px] border-black bg-[#FFEB3B] px-3 py-1 text-sm font-bold tracking-wide text-black uppercase">
              {model}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center border-[2px] border-black bg-[#2196F3] px-4 py-2 text-sm font-bold tracking-wide text-white uppercase shadow-[2px_2px_0px_#000] transition-all duration-150 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] focus:outline-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
              title="Copy to clipboard"
            >
              {isCopied ? (
                <span className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Copied!
                </span>
              ) : (
                <span className="flex items-center">
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy
                </span>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center border-[2px] border-black bg-[#4CAF50] px-4 py-2 text-sm font-bold tracking-wide text-white uppercase shadow-[2px_2px_0px_#000] transition-all duration-150 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] focus:outline-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
              title="Download as Markdown"
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download
            </button>

            <button
              onClick={onClose}
              className="flex items-center border-[2px] border-black bg-[#F44336] px-4 py-2 text-sm font-bold tracking-wide text-white uppercase shadow-[2px_2px_0px_#000] transition-all duration-150 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] focus:outline-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
              title="Close (Esc)"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="neo-full-page-content flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl p-8">
            {content && content.trim().length > 0 ? (
              <div className="markdown-content leading-relaxed font-medium text-black">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-lg text-gray-500">
                  No PRD content to display.
                </p>
                <p className="mt-2 text-gray-400">
                  Please generate a PRD first.
                </p>
                <p className="mt-1 text-sm text-gray-300">
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
