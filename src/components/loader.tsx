export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center border-[3px] border-black bg-[#FFEB3B] p-12 shadow-[8px_8px_0px_#000]">
      <svg
        className="h-16 w-16 animate-spin stroke-[4] text-black"
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
        className="mt-6 text-2xl font-black tracking-wide text-black uppercase"
        style={{
          fontFamily:
            "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
        }}
      >
        Generating your PRD...
      </p>
      <p className="mt-2 text-base font-bold text-black">
        The AI is thinking. This may take a moment.
      </p>
    </div>
  );
}
