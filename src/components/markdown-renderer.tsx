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
            className="mt-8 mb-6 border-b-[3px] border-black pb-3 text-4xl font-black tracking-tight text-black uppercase"
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
            className="mt-6 mb-4 text-3xl font-extrabold tracking-tight text-black uppercase"
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
            className="mt-4 mb-3 text-2xl font-bold tracking-wide text-black uppercase"
            style={{
              fontFamily:
                "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
            }}
          >
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-black">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-6 list-disc space-y-2 pl-8">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-6 list-decimal space-y-2 pl-8">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="mb-2 font-medium text-black">{children}</li>
        ),
        hr: () => <hr className="my-8 border-t-[3px] border-black" />,
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-4 border-black pl-4 italic">
            {children}
          </blockquote>
        ),
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          return isInline ? (
            <code
              className="border-[2px] border-black bg-[#F5F5F5] px-2 py-1 font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          ) : (
            <div className="neo-overflow-x-auto neo-scrollbar mb-4">
              <code
                className="block border-[2px] border-black bg-[#F5F5F5] p-4 font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            </div>
          );
        },
        pre: ({ children }) => (
          <div className="neo-overflow-x-auto neo-scrollbar mb-4">
            <pre className="border-[2px] border-black bg-[#F5F5F5] p-4 font-mono">
              {children}
            </pre>
          </div>
        ),
        table: ({ children }) => (
          <div className="neo-overflow-x-auto neo-scrollbar mb-4">
            <table className="min-w-full border-collapse border-[2px] border-black bg-white">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-[2px] border-black bg-[#FFEB3B] px-4 py-3 font-bold text-black">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-[2px] border-black bg-white px-4 py-3">
            {children}
          </td>
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
