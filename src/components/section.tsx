import { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
  onRefine?: () => void;
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className || "w-5 h-5"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  );
}

export function Section({ title, children, onRefine }: SectionProps) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
      <div className="flex justify-between items-center border-b border-slate-600 pb-2 mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {onRefine ? (
          <button
            type="button"
            onClick={onRefine}
            className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-indigo-500"
            aria-label={`Refine ${title} section with AI`}
          >
            <SparklesIcon className="w-4 h-4" />
            Refine with AI
          </button>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
