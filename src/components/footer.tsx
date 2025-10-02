export function Footer() {
  return (
    <footer className="py-8 border-t-[4px] border-black bg-white shadow-[0_-4px_0px_#000]">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <a
            href="http://buymeacoffee.com/aungmyokyaw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            <img
              src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black"
              alt="Buy Me A Coffee"
              className="border-[3px] border-black shadow-[4px_4px_0px_#000]"
            />
          </a>
        </div>
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Powered by Gemini API • Built for modern product teams
        </p>
      </div>
    </footer>
  );
}
