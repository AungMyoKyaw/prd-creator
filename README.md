# PRD Creator

PRD Creator is an AI-assisted workspace for crafting Product Requirements Documents in minutes. Feed it a product idea, tune each section with targeted feedback, and export a polished narrative that takes teams from concept to build-ready.

## Highlights

- **Idea-to-outline in one click** – Send a rough concept to `/api/generate-inputs` and let Gemini expand it into structured PRD inputs.
- **Context-aware authoring** – Validate key fields locally, then call `/api/generate-prd` for a full Markdown PRD with personas, user stories, KPIs, and out-of-scope guardrails.
- **Interactive refinements** – Open any section in a modal, describe the tweak, and `/api/refine-section` rewrites only the relevant copy.
- **Secure key handling** – Store a Gemini API key encrypted per-browser using the Web Crypto API, or supply a server-side key via environment variables.
- **Live preview** – See rendered Markdown side-by-side while you edit so stakeholders can skim drafts instantly.

## How It Works

1. **Ignite** – Describe your product idea in the left panel, then click “Let AI structure my idea.” The app validates input length, calls Gemini with a JSON schema, and pre-fills the form.
2. **Shape** – Review core idea, market, features, and technical constraints. Required fields are tracked client-side and surfaced to the user.
3. **Publish** – When the form is complete, request generation. The server builds a detailed prompt, submits it to Gemini, and streams a Markdown-ready PRD back to the UI.
4. **Refine** – If a section needs iteration, open the refine modal, describe the desired changes, and the AI returns targeted updates without disturbing the rest of the document.

## Tech Stack

- [Next.js 15](https://nextjs.org/) with the App Router and Turbopack dev/build
- [React 19](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4 (postcss preset)](https://tailwindcss.com/) with `tailwind-merge`
- [@google/genai](https://www.npmjs.com/package/@google/genai) for Gemini access
- [`react-markdown`](https://github.com/remarkjs/react-markdown) with `remark-gfm` and `rehype-highlight`
- Framer Motion & Lucide icons for motion and illustration

## Getting Started

### Prerequisites

- Node.js 18.18+ (aligns with Next.js 15 requirements)
- npm 9+, pnpm, yarn, or bun
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

```bash
git clone https://github.com/AungMyoKyaw/prd-creator.git
cd prd-creator
npm install
```

### Configure Gemini Access

You can provide an API key in two ways:

1. **Store it in the browser (recommended for hosted deployments):**
   - Start the app.
   - Click “Add Gemini key” in the UI. The key is encrypted using `AES-GCM` with an origin-scoped secret before being written to `localStorage`.

2. **Set it on the server (useful for local development/testing):**
   ```bash
   cp .env.example .env.local # if you keep an example file
   echo "GEMINI_API_KEY=your-key" >> .env.local
   echo "GEMINI_MODEL=gemini-2.5-flash" >> .env.local # optional override
   ```
   When both a stored key and `GEMINI_API_KEY` are present, client requests prefer the key entered in the UI so each collaborator can use their own quota.

### Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and walk through the three-stage flow.

## Available Scripts

- `npm run dev` – start the development server with Turbopack
- `npm run build` – create a production build
- `npm run start` – run the production build
- `npm run lint` – lint the project with ESLint
- `npm run format` / `npm run format:check` – format or verify formatting with Prettier + Tailwind plugin

## Project Structure

```
src/
	app/
		api/
			generate-inputs/route.ts   # Prefills PRD inputs from a high-level idea
			generate-prd/route.ts      # Generates the full Markdown PRD
			refine-section/route.ts    # Applies targeted refinements to one section
		layout.tsx                   # App shell and global providers
		page.tsx                     # Entry point that renders the PRD creator UI
	components/                    # UI building blocks and Markdown renderer
	hooks/useGeminiKey.ts          # Browser-side encrypted key storage
	lib/                           # Utilities (encryption helpers, formatting)
	types/                         # Shared TypeScript contracts
```

## API Routes

| Route                       | Purpose                                                                                | Notes                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `POST /api/generate-inputs` | Converts a product idea into structured PRD inputs using Gemini JSON schema responses. | Validates payload length and enforces required fields.                       |
| `POST /api/generate-prd`    | Produces a full PRD in Markdown.                                                       | Requires core fields; handles quota/auth errors gracefully.                  |
| `POST /api/refine-section`  | Refines specific PRD sections based on user feedback.                                  | Builds a schema tailored to the chosen section so only relevant keys change. |

## Privacy & Security

- Gemini API keys saved in the browser are encrypted with an origin-derived secret before hitting `localStorage`.
- Keys are only attached to outbound requests triggered by the active session; nothing is persisted on the server.
- Inputs are validated and sanitized before being sent to Gemini, and AI responses are schema-checked to prevent malformed data.

## Deployment

Deploy to [Vercel](https://vercel.com/) or any Node-compatible platform. Ensure `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) are configured as environment variables, or instruct users to supply their own key through the UI on first load.

## Support

Enjoying PRD Creator? Consider [buying Aung Myo Kyaw a coffee](https://buymeacoffee.com/aungmyokyaw).

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
