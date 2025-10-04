# PRD Creator - Software Design Document (SDD)

## 1. Introduction

### 1.1 Purpose

The purpose of this Software Design Document (SDD) is to describe the design of the PRD Creator application. This document outlines the software architecture, system components, interfaces, data flow, and design decisions that guide the implementation of the application.

### 1.2 Scope

This document covers the design for the PRD Creator web application, which uses AI to generate Product Requirements Documents from user-provided information. The application is built with Next.js and deployed as a Progressive Web App.

### 1.3 Definitions, Acronyms, and Abbreviations

- **PRD:** Product Requirements Document
- **AI:** Artificial Intelligence
- **PWA:** Progressive Web Application
- **UI:** User Interface
- **API:** Application Programming Interface
- **MVC:** Model-View-Controller
- **SSR:** Server-Side Rendering
- **CSR:** Client-Side Rendering

### 1.4 References

- Next.js 15.5.4 Documentation
- TypeScript 5.9.2 Specification
- React 19.1.1 Documentation
- Tailwind CSS 4 Documentation
- Google Gemini API Documentation

### 1.5 Overview

This document is organized as follows:

- System Overview: Describes the overall architecture and components
- System Architecture: Details the architectural patterns and structure
- Component Design: Details individual components and their responsibilities
- Database Design: Details data storage and management
- Interface Design: Details user interfaces and API interfaces
- Design Rationale: Explains key design decisions

---

## 2. System Overview

### 2.1 Product Perspective

PRD Creator is a client-side web application built with Next.js that integrates with the Google Gemini API for AI-powered PRD generation. The application follows a modern single-page application (SPA) architecture with server-side API routes to handle API communication.

### 2.2 Product Functions

The application provides the following core functions:

- Collection of product idea information through structured forms
- AI-powered generation of comprehensive PRDs
- Real-time preview of PRD content
- Export of generated PRDs in Markdown format
- Configuration of AI model preferences
- Refinement of specific PRD sections based on user feedback

### 2.3 User Classes

- Product managers and technical leads
- Startup founders and entrepreneurs
- UX designers and product designers
- Developers requiring detailed specifications

### 2.4 Operating Environment

The application runs in modern web browsers and is optimized for:

- Desktop environments (Windows, macOS, Linux)
- Mobile devices (iOS Safari, Android Chrome)
- Tablet devices
- All devices supporting PWA installation

---

## 3. System Architecture

### 3.1 Architectural Overview

The PRD Creator application follows a client-server architecture pattern where:

- The frontend is built with Next.js and React for the user interface
- API routes are implemented in the Next.js application for server-side processing
- AI processing is handled by the Google Gemini API
- Data storage is managed through browser local storage

### 3.2 Architectural Style

The application follows:

- **Next.js App Router Pattern**: Uses the modern App Router for routing and rendering
- **Component-Based Architecture**: React components for UI modularity with TypeScript interfaces
- **Client-Server Architecture**: Separation between client-side UI and server-side API routes
- **API-First Design**: API routes handle communication with external services
- **Progressive Web App**: PWA capabilities with service workers and offline support
- **State Management**: React hooks for local state, localStorage for persistence

### 3.3 Design Rationale

- Next.js was chosen for its excellent support for server-side rendering and static generation
- Client-side storage was chosen to avoid server-side storage of sensitive API keys
- Component-based architecture allows for reusable UI elements
- API routes provide server-side processing without external server requirements

### 3.4 System Components

The system consists of the following major components:

```
┌─────────────────────────────────────┐
│            Client-Side              │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  │
│  │   Header    │  │    Footer    │  │
│  └─────────────┘  └──────────────┘  │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │              Main               │ │
│  │  ┌──────────┐  ┌──────────────┐ │ │
│  │  │   Form   │  │   Display    │ │ │
│  │  │Component │  │   Content    │ │ │
│  │  └──────────┘  └──────────────┘ │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │    Modals (Settings, Refine)    │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   API Routes        │
         │ (Generate, Prefill, │
         │  Models, Refine)    │
         └─────────────────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │   Google Gemini API     │
        └─────────────────────────┘
```

---

## 4. Component Design

### 4.1 UI Components

#### 4.1.1 Page Component (src/app/page.tsx)

**Responsibilities:**

- Main application container
- State management for the entire application
- API communication orchestration
- UI layout and component composition

**Dependencies:**

- PrdInput state from lib/prd.ts
- Various UI components from src/components/
- API routes for data processing

**Properties:**

- Manages all application state including form inputs, API key, selected model, etc.
- Handles API calls to backend endpoints
- Coordinates communication between components

#### 4.1.2 PRDForm Component (src/components/prd-form.tsx)

**Responsibilities:**

- Displays the structured form for PRD information
- Handles user input changes
- Provides form submission functionality
- Integrates with refine functionality

**Dependencies:**

- InputField and TextareaField components
- Section component for organization
- PrdInput type definition

**Properties:**

- Receives form data as props and updates parent state
- Organized into logical sections (Core Product Idea, Audience & Market, etc.)
- Provides validation and user feedback

#### 4.1.3 PRDDisplay Component (src/components/prd-display.tsx)

**Responsibilities:**

- Renders the generated or preview PRD content
- Provides export functionality (download, copy)
- Formats content as Markdown

**Dependencies:**

- Markdown rendering libraries
- Export functionality utilities

#### 4.1.4 Section Component (src/components/section.tsx)

**Responsibilities:**

- Organizes form fields into logical sections
- Provides collapsible functionality if needed
- Adds refine buttons to sections

**Dependencies:**

- UI styling libraries

#### 4.1.5 InputField and TextareaField Components (src/components/input-field.tsx, textarea-field.tsx)

**Responsibilities:**

- Provide styled input elements
- Handle change events
- Display labels and descriptions

#### 4.1.6 SavedDraftsModal Component (src/components/saved-drafts-modal.tsx)

**Responsibilities:**

- Display list of saved PRDs from IndexedDB in a modal interface
- Provide UI controls for managing saved PRDs (view, delete)
- Handle user interactions with saved PRDs including loading drafts back into form
- Apply compact Neo-Brutalism design to management interface
- Coordinate with drafts manager for data operations
- Show draft metadata including creation date, model used, and content preview

**Dependencies:**

- Drafts manager from src/lib/drafts.ts
- Radix UI Dialog primitives for modal functionality
- UI styling libraries for compact Neo-Brutalism design
- Lucide React icons for interface elements

#### 4.1.7 PWAInstallPrompt Component (src/components/pwa-install-prompt.tsx)

**Responsibilities:**

- Detect PWA installation eligibility
- Display install prompt to users
- Handle PWA installation process
- Store installation preference

**Dependencies:**

- PWA installation APIs
- Local storage for preferences

#### 4.1.8 FullPagePRDViewer Component (src/components/full-page-prd-viewer.tsx)

**Responsibilities:**

- Display generated PRD in full-screen modal
- Provide enhanced reading experience
- Offer export and sharing options
- Maintain Neo-Brutalism styling

**Dependencies:**

- Markdown rendering libraries
- Radix UI Dialog primitives
- Export functionality utilities

#### 4.1.9 RefineModal Component (src/components/refine-modal.tsx)

**Responsibilities:**

- Provide interface for section refinement
- Handle user feedback input
- Coordinate with refine API endpoint
- Display refined results

**Dependencies:**

- API client for refine operations
- Radix UI Dialog primitives
- Form handling components

### 4.2 API Routes Architecture

The application implements server-side API routes using Next.js App Router pattern:

#### 4.2.1 Generate Route (src/app/api/generate/route.ts)

**Responsibilities:**

- Handle PRD generation requests
- Validate input data
- Communicate with Google Gemini API
- Format and return generated content

#### 4.2.2 Models Route (src/app/api/models/route.ts)

**Responsibilities:**

- Fetch available Gemini models
- Cache model information
- Provide model selection data

#### 4.2.3 Prefill Route (src/app/api/prefill/route.ts)

**Responsibilities:**

- Process product idea descriptions
- Generate structured form data
- Auto-populate PRD input fields

#### 4.2.4 Refine Route (src/app/api/refine/route.ts)

**Responsibilities:**

- Handle section refinement requests
- Process user feedback
- Generate improved content sections

### 4.3 Library Modules Architecture

#### 4.3.1 PRD Library (src/lib/prd.ts)

**Responsibilities:**

- Define TypeScript interfaces for PRD data
- Provide default values and validation
- Generate preview content
- Map form fields to sections

#### 4.3.2 Drafts Library (src/lib/drafts.ts)

**Responsibilities:**

- Manage IndexedDB operations
- Handle draft storage and retrieval
- Provide CRUD operations for saved PRDs
- Implement localStorage fallback

#### 4.3.3 Models Library (src/lib/models.ts)

**Responsibilities:**

- Interface with Gemini model API
- Cache model information
- Handle model selection logic

#### 4.3.4 Download Library (src/lib/download.ts)

**Responsibilities:**

- Handle file download operations
- Generate appropriate filenames
- Support multiple export formats

#### 4.3.5 Ingest Library (src/lib/ingest.ts)

**Responsibilities:**

- Process Git repository data
- Analyze repository structure
- Extract relevant insights

#### 4.3.6 Prompt Library (src/lib/prompt.ts)

**Responsibilities:**

- Generate AI prompts
- Format request data
- Handle response processing

---

## 5. Data Design

### 5.1 Data Structures

#### 5.1.1 PrdInput Interface

```typescript
interface PrdInput {
  productName: string;
  targetAudience: string;
  problemStatement: string;
  proposedSolution: string;
  coreFeatures: string;
  keyFeatures: string;
  businessGoals: string;
  successMetrics: string;
  futureFeatures: string;
  techStack: string;
  constraints: string;
}
```

#### 5.1.2 StoredDraft Interface

```typescript
interface StoredDraft {
  id: string;
  inputs: PrdInput;
  markdown: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Data Flow

1. **Input Collection**: User inputs form data into PrdInput structure
2. **API Processing**: Data sent to /api/generate with model selection
3. **Content Generation**: Gemini API returns structured PRD content
4. **Local Storage**: Generated PRD stored in IndexedDB with metadata
5. **Export**: Content formatted for download in various formats

### 5.3 Storage Architecture

- **Configuration**: localStorage for API keys and model preferences
- **Draft Storage**: IndexedDB for PRD documents with full metadata
- **Fallback Storage**: localStorage when IndexedDB unavailable
- **Caching**: Service worker caches for offline functionality

---

## 6. Interface Design

### 6.1 User Interface

The application implements a compact Neo-Brutalism design system with:

- **Typography**: Big Shoulders Display (headings), Inter (body text)
- **Color Palette**: Primary yellow (#FFEB3B), secondary blue (#2196F3), accent pink (#E91E63)
- **Borders**: 2px black borders (3px for emphasis)
- **Shadows**: Offset shadows (2px 2px 0px #000 standard, 4px 4px 0px #000 for emphasis)
- **Layout**: Responsive grid system optimized for content density

### 6.2 API Interface Design

All API routes follow RESTful conventions:

- **POST /api/generate**: Generate PRD from input data
- **GET /api/models**: Retrieve available AI models
- **POST /api/prefill**: Generate structured form data from ideas
- **POST /api/refine**: Refine specific PRD sections

### 6.3 Component Interface Design

Components accept props following TypeScript best practices:

- **Required Props**: Essential data for component functionality
- **Optional Props**: Enhanced features and customization
- **Event Handlers**: Standardized callback patterns
- **Styling Props**: Consistent design system integration

---

## 7. Implementation Notes

### 7.1 PWA Configuration

The application uses @ducanh2912/next-pwa with the following configuration:

- **Service Worker**: Enabled for production builds
- **Caching Strategy**: NetworkFirst for API routes, CacheFirst for static assets
- **Offline Support**: Fallback page for offline navigation
- **Install Prompt**: Custom install prompt with Neo-Brutalism styling

### 7.2 Performance Optimizations

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component usage
- **Bundle Analysis**: Webpack Bundle Analyzer integration
- **Caching**: Service worker caching for static assets

### 7.3 Development Workflow

- **Type Safety**: Full TypeScript implementation
- **Code Quality**: ESLint and Prettier configuration
- **Testing**: Component testing setup (ready for implementation)
- **Build Process**: Next.js optimization and minification
