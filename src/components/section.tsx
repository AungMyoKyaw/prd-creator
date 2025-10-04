import { ReactNode } from 'react';

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
      strokeWidth={2.5}
      stroke="currentColor"
      className={className || 'h-5 w-5'}
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
    <div className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_#000]">
      <div className="mb-4 flex items-center justify-between border-b-[2px] border-black pb-2">
        <h2
          className="text-xl font-extrabold tracking-tight text-black"
          style={{
            fontFamily:
              "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
          }}
        >
          {title}
        </h2>
        {onRefine ? (
          <button
            type="button"
            onClick={onRefine}
            className="flex items-center gap-2 border-[2px] border-black bg-[#E91E63] px-3 py-1 text-xs font-bold tracking-wide text-white uppercase shadow-[2px_2px_0px_#000] transition-all duration-150 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] focus:border-[#FFEB3B] focus:outline-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
            aria-label={`Refine ${title} section with AI`}
          >
            <SparklesIcon className="h-3 w-3" />
            Refine
          </button>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
