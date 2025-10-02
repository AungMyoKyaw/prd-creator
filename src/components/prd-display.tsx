'use client';

import { useEffect, useState } from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import { saveDraft, StoredDraft } from '@/lib/drafts';
import { PrdInput } from '@/lib/prd';

interface PRDDisplayProps {
  content: string;
  isLivePreview?: boolean;
  productName?: string;
  prdInputs?: PrdInput;
  model?: string;
  onSaved?: () => void;
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

function SaveIcon({ className }: { className?: string }) {
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
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    </svg>
  );
}

export function PRDDisplay({
  content,
  isLivePreview = false,
  productName = 'PRD',
  prdInputs,
  model = 'gemini-2.5-flash',
  onSaved
}: PRDDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  useEffect(() => {
    if (!isSaved) return;
    const timer = window.setTimeout(() => setIsSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isSaved]);

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
    // Create a sanitized filename
    const sanitizedName = productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
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

  const handleSave = async () => {
    if (!prdInputs) {
      console.warn('Cannot save: PRD inputs are not available');
      return;
    }

    setIsSaving(true);
    try {
      const draft: StoredDraft = {
        id: crypto.randomUUID(),
        title: productName || 'Untitled PRD',
        createdAt: new Date().toISOString(),
        model: model,
        inputs: prdInputs,
        markdown: content
      };

      await saveDraft(draft);
      setIsSaved(true);
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000]">
      <div className="flex justify-between items-center p-6 border-b-[3px] border-black">
        <h2
          className="text-2xl font-black text-black uppercase tracking-wide"
          style={{
            fontFamily:
              "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
          }}
        >
          {isLivePreview ? '📋 LIVE PREVIEW' : '✅ GENERATED PRD'}
        </h2>
        {!isLivePreview && (
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !prdInputs}
              className="flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide bg-[#FFEB3B] text-black border-[3px] border-black shadow-[4px_4px_0px_#000] transition-all duration-150 hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save to browser storage"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : isSaved ? (
                <span className="flex items-center">
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Saved!
                </span>
              ) : (
                <span className="flex items-center">
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save
                </span>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide bg-[#4CAF50] text-white border-[3px] border-black shadow-[4px_4px_0px_#000] transition-all duration-150 hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] focus:outline-none"
              title="Download as Markdown"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide bg-[#2196F3] text-white border-[3px] border-black shadow-[4px_4px_0px_#000] transition-all duration-150 hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] focus:outline-none"
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
          </div>
        )}
      </div>
      <div className="p-6 bg-[#FAFAFA]">
        <div className="markdown-content text-black font-medium leading-relaxed">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}
