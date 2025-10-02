export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-[#FFEB3B] border-[3px] border-black shadow-[8px_8px_0px_#000]">
      <svg
        className="animate-spin h-16 w-16 text-black stroke-[4]"
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
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p
        className="mt-6 text-2xl font-black text-black uppercase tracking-wide"
        style={{
          fontFamily:
            "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
        }}
      >
        Generating your PRD...
      </p>
      <p className="text-base font-bold text-black mt-2">
        The AI is thinking. This may take a moment.
      </p>
    </div>
  );
}
