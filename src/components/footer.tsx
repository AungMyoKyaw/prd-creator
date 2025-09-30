export function Footer() {
  return (
    <footer className="py-6 text-center">
      <div className="mb-4">
        <a 
          href="http://buymeacoffee.com/aungmyokyaw" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block"
        >
          <img 
            src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" 
            alt="Buy Me A Coffee" 
          />
        </a>
      </div>
      <p className="text-sm text-slate-500">
        Powered by Gemini API. Built for modern product teams.
      </p>
    </footer>
  );
}
