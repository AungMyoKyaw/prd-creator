import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn, copyToClipboard } from '../../lib/utils';

interface MarkdownRendererProps {
  content: string;
  isLivePreview?: boolean;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isLivePreview = false,
  className
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-requirements-document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        'glass rounded-xl border border-slate-700 shadow-2xl overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h3 className="text-sm font-medium text-slate-300">
            {isLivePreview ? 'Live Preview' : 'Generated PRD'}
          </h3>
        </div>

        {!isLivePreview && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200 hover:-translate-y-[1px]"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200 hover:-translate-y-[1px]"
              title="Download as Markdown"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children, ...props }) => (
                <h1
                  className="text-3xl font-bold text-slate-50 mb-6 mt-8 first:mt-0 animate-fade-in"
                  {...props}
                >
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2
                  className="text-2xl font-semibold text-slate-100 mb-4 mt-6 pb-2 border-b border-slate-700 animate-fade-in"
                  {...props}
                >
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3
                  className="text-xl font-medium text-slate-200 mb-3 mt-5 animate-fade-in"
                  {...props}
                >
                  {children}
                </h3>
              ),
              p: ({ children, ...props }) => (
                <p className="text-slate-300 mb-4 leading-relaxed" {...props}>
                  {children}
                </p>
              ),
              ul: ({ children, ...props }) => (
                <ul
                  className="text-slate-300 mb-4 ml-6 space-y-2 list-disc"
                  {...props}
                >
                  {children}
                </ul>
              ),
              ol: ({ children, ...props }) => (
                <ol
                  className="text-slate-300 mb-4 ml-6 space-y-2 list-decimal"
                  {...props}
                >
                  {children}
                </ol>
              ),
              li: ({ children, ...props }) => (
                <li className="text-slate-300" {...props}>
                  {children}
                </li>
              ),
              strong: ({ children, ...props }) => (
                <strong className="font-semibold text-slate-50" {...props}>
                  {children}
                </strong>
              ),
              em: ({ children, ...props }) => (
                <em className="italic text-slate-200" {...props}>
                  {children}
                </em>
              ),
              code: ({ children, ...props }) => (
                <code
                  className="bg-slate-800 text-indigo-300 px-2 py-1 rounded font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              ),
              hr: ({ ...props }) => (
                <hr className="border-slate-700 my-8" {...props} />
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote
                  className="border-l-4 border-indigo-500 pl-4 py-2 bg-slate-800/50 rounded-r-lg my-4 text-slate-300 italic"
                  {...props}
                >
                  {children}
                </blockquote>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {isLivePreview && (
        <div className="px-6 py-3 bg-slate-800/30 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            This is a live preview. Fill out the form to see your PRD take
            shape.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;
