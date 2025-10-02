interface HeaderProps {
  onSettingsClick: () => void;
  currentModel?: string;
  modelDisplayName?: string;
}

export function Header({
  onSettingsClick,
  currentModel,
  modelDisplayName
}: HeaderProps) {
  return (
    <header className="bg-white border-b-[4px] border-black shadow-[0_4px_0px_#000] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6 relative">
        <div className="text-center">
          <h1
            className="text-5xl md:text-6xl font-black text-black tracking-tight"
            style={{
              fontFamily:
                "'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif"
            }}
          >
            <span className="text-[#2196F3]">PRD</span> CREATOR 📝
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-gray-700 font-medium sm:text-lg">
            Turn your ideas into professional Product Requirements Documents
            instantly.
          </p>

          {/* Model Indicator */}
          {currentModel && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-[#FFEB3B] border-[3px] border-black shadow-[4px_4px_0px_#000]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-black uppercase">
                  Using:{' '}
                  <span className="text-[#2196F3]">
                    {modelDisplayName || currentModel}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="absolute top-4 right-4 p-3 bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000] transition-all duration-150 hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
          aria-label="Settings"
          title="Settings"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
