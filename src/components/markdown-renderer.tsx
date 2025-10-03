import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1
            className="text-4xl font-black text-black mb-6 mt-8 uppercase tracking-tight border-b-[3px] border-black pb-3"
            style={{
              fontFamily:
                "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
            }}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            className="text-3xl font-extrabold text-black mb-4 mt-6 uppercase tracking-tight"
            style={{
              fontFamily:
                "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
            }}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            className="text-2xl font-bold text-black mb-3 mt-4 uppercase tracking-wide"
            style={{
              fontFamily:
                "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
            }}
          >
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-black leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-8 mb-6 space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-8 mb-6 space-y-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="mb-2 text-black font-medium">{children}</li>
        ),
        hr: () => <hr className="my-8 border-t-[3px] border-black" />,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-black pl-4 italic my-4">
            {children}
          </blockquote>
        ),
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          return isInline ? (
            <code
              className="bg-gray-100 px-1 py-0.5 text-sm font-mono rounded"
              {...props}
            >
              {children}
            </code>
          ) : (
            <code
              className="block bg-gray-100 p-4 text-sm font-mono rounded overflow-x-auto"
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-4">
            {children}
          </pre>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border-collapse border border-black">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-black px-4 py-2 bg-gray-200 font-bold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-black px-4 py-2">{children}</td>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-600 underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
