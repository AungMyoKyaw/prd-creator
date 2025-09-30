# 📝 AI PRD Creator

An intelligent Product Requirements Document (PRD) generator powered by Google's Gemini AI. Transform your product ideas into comprehensive, professional PRDs in minutes.

## ✨ Features

- **🚀 Quick Start with AI**: Describe your product idea in plain text and let AI auto-fill the entire form
- **📋 Structured Form Input**: Organized sections for all essential PRD components
- **👁️ Live Preview**: See your PRD preview as you type
- **🤖 AI-Powered Generation**: Generate complete, professional PRDs with Gemini 2.5 Flash
- **🔄 Section Refinement**: Refine specific sections with AI-powered feedback
- **🎨 Modern UI**: Beautiful, dark-themed interface with smooth interactions
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini API (@google/genai)
- **UI Components**: Radix UI primitives
- **Markdown**: react-markdown with remark-gfm

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prd-creator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your Gemini API key from: https://ai.google.dev/

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                       🚀 Quick Start Path                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────┐
              │  Enter Product Idea (1-2 lines)  │
              │  e.g., "A mobile app for         │
              │  finding local fitness classes"  │
              └──────────────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────┐
              │  Click "Auto-fill Form with AI"  │
              └──────────────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────┐
              │   AI Populates All Form Fields   │
              │   - Product Name                 │
              │   - Target Audience              │
              │   - Problem & Solution           │
              │   - Features                     │
              │   - Business Goals               │
              │   - Tech Stack                   │
              └──────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────┴────────────────────────────────┐
│                                                                  │
│  ┌──────────────────┐                    ┌──────────────────┐  │
│  │   Review & Edit   │ ◄──────────────► │   Live Preview   │  │
│  │   Form Fields     │                    │   Updates        │  │
│  └──────────────────┘                    └──────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────┐
              │   Click "Generate PRD" Button    │
              └──────────────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────┐
              │   AI Generates Complete PRD      │
              │   - Introduction & Vision        │
              │   - User Personas                │
              │   - Features with User Stories   │
              │   - Technical Requirements       │
              │   - Success Metrics              │
              │   - Out of Scope                 │
              └──────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
         ┌──────────────────┐     ┌──────────────────┐
         │  Copy to         │     │  Refine Sections │
         │  Clipboard       │     │  with Feedback   │
         └──────────────────┘     └──────────────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │  AI Updates     │
                                  │  Specific       │
                                  │  Sections       │
                                  └─────────────────┘
```

### Detailed Steps

#### 1. Quick Start (Recommended)
1. Enter a brief product idea description in the "Quick Start" section
2. Click "Auto-fill Form with AI ✨"
3. AI will intelligently populate all form fields based on your idea
4. Review and adjust the pre-filled content as needed

#### 2. Manual Input (Alternative)
Fill out the structured form with the following sections:
- **Core Product Idea**: Product name, problem statement, proposed solution
- **Audience & Market**: Target audience, business goals, success metrics
- **Features & Scope**: Core features (MVP), future features
- **Technical Details**: Technology stack, constraints, dependencies

#### 3. Live Preview
As you fill out the form, the right panel shows a live preview of your PRD structure.

#### 4. Generate Complete PRD
Click "Generate PRD" to have AI create a comprehensive, professionally formatted PRD based on your inputs.

#### 5. Refine Sections (Optional)
- Use the "Refine" buttons next to each section to make AI-powered adjustments
- Provide specific feedback for what you'd like to change
- AI will update that section while maintaining consistency with the rest of the document

## 📂 Project Structure

```
prd-creator/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── prefill/      # Auto-fill form endpoint
│   │   │   ├── generate/     # Generate PRD endpoint
│   │   │   ├── refine/       # Refine section endpoint
│   │   │   └── _lib/         # Shared API utilities
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main application page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── prd-form.tsx
│   │   ├── prd-display.tsx
│   │   ├── refine-modal.tsx
│   │   ├── section.tsx
│   │   ├── input-field.tsx
│   │   ├── textarea-field.tsx
│   │   ├── button.tsx
│   │   ├── loader.tsx
│   │   └── markdown-renderer.tsx
│   └── lib/                  # Utility functions
│       ├── prd.ts            # PRD types and generators
│       ├── prompt.ts         # AI prompt builders
│       ├── ingest.ts         # Repository analysis
│       ├── drafts.ts         # Draft management
│       ├── download.ts       # Export utilities
│       └── models.ts         # Gemini model configs
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## 🔌 API Endpoints

### POST `/api/prefill`
Auto-fills the PRD form based on a product idea.

**Request:**
```json
{
  "productIdea": "A mobile app for finding local fitness classes"
}
```

**Response:**
```json
{
  "data": {
    "productName": "FitFinder",
    "targetAudience": "Health-conscious millennials...",
    "problemStatement": "...",
    "proposedSolution": "...",
    "coreFeatures": "...",
    "businessGoals": "...",
    "futureFeatures": "...",
    "techStack": "...",
    "constraints": "..."
  }
}
```

### POST `/api/generate`
Generates a complete PRD from structured inputs.

**Request:**
```json
{
  "inputs": {
    "productName": "FitFinder",
    "targetAudience": "...",
    "problemStatement": "...",
    // ... other fields
  }
}
```

**Response:**
```json
{
  "data": "# FitFinder\n\n## 1. Introduction & Vision\n\n..."
}
```

### POST `/api/refine`
Refines a specific section based on user feedback.

**Request:**
```json
{
  "currentInputs": { /* current form state */ },
  "sectionTitle": "1. Core Product Idea",
  "userFeedback": "Make the tone more formal and add security considerations"
}
```

**Response:**
```json
{
  "data": {
    "productName": "...",
    "problemStatement": "...",
    "proposedSolution": "..."
  }
}
```

## 🎨 Component Architecture

### Main Page (`page.tsx`)
The primary application component that orchestrates the entire workflow:
- Manages state for product idea, form inputs, generated PRD, and refinement
- Handles API calls to prefill, generate, and refine
- Renders the two-column layout (form + preview/output)

### Form Components
- **PRDForm**: Main form with organized sections
- **Section**: Collapsible section wrapper with refine button
- **InputField**: Single-line text input
- **TextareaField**: Multi-line text input

### Display Components
- **PRDDisplay**: Renders markdown PRD with copy functionality
- **MarkdownRenderer**: Formats markdown with syntax highlighting
- **Loader**: Loading state indicator

### Modal Components
- **RefineModal**: Dialog for section-specific AI refinement

## 🚀 Building for Production

```bash
npm run build
npm start
```

## 🧪 Development

```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## 🌟 Key Features Explained

### 1. AI-Powered Auto-fill
The auto-fill feature uses Gemini to analyze a brief product idea and intelligently generate all PRD sections. It uses structured output (JSON schema) to ensure consistent formatting.

### 2. Live Preview
As you type in the form, the preview updates in real-time, showing you how your PRD will be structured before generation.

### 3. Section-Based Refinement
Instead of regenerating the entire PRD, you can refine specific sections with targeted feedback, making iterative improvements efficient.

### 4. Markdown Export
Generated PRDs are in Markdown format, making them easy to:
- Copy to documentation tools (Notion, Confluence, etc.)
- Export to other formats
- Version control with Git
- Collaborate with teams

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `GOOGLE_GEMINI_API_KEY` | Alternative name for Gemini API key | No |
| `API_KEY` | Fallback name for API key | No |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
