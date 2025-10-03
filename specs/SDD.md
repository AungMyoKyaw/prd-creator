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
- **Component-Based Architecture**: React components for UI modularity
- **Client-Server Architecture**: Separation between client-side UI and server-side API routes
- **API-First Design**: API routes handle communication with external services

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

- Detect PWA installation eligibility and display install prompt
- Handle PWA installation flow and user choice tracking
- Manage install prompt dismissal and localStorage persistence
- Provide install instructions and benefits communication
- Apply compact Neo-Brutalism styling to install prompt

**Dependencies:**

- Browser PWA APIs (beforeinstallprompt, appinstalled events)
- Lucide React icons for interface elements
- LocalStorage for dismissal tracking

### 4.2 API Components

#### 4.2.1 Generate API Route (src/app/api/generate/route.ts)

**Responsibilities:**

- Validate input data
- Communicate with Google Gemini API
- Format and return generated PRD content

**Dependencies:**

- Google Gemini SDK
- PRD utilities from src/lib/prd.ts
- Date/time context helper

#### 4.2.2 Prefill API Route (src/app/api/prefill/route.ts)

**Responsibilities:**

- Generate form data from a product idea description
- Communicate with Google Gemini API
- Return structured form data

#### 4.2.3 Refine API Route (src/app/api/refine/route.ts)

**Responsibilities:**

- Refine specific sections based on user feedback
- Update relevant portions of PRD data
- Communicate with Google Gemini API

#### 4.2.4 Models API Route (src/app/api/models/route.ts)

**Responsibilities:**

- Fetch available Gemini models
- Handle model list caching
- Return model information

### 4.3 Utility Components

#### 4.3.1 PRD Library (src/lib/prd.ts)

**Responsibilities:**

- Define PrdInput interface and default values
- Generate preview Markdown from inputs
- Build generation prompts for AI
- Provide section-to-field mappings

**Dependencies:**

- TypeScript type system

#### 4.3.2 Drafts Manager (src/lib/drafts.ts)

**Responsibilities:**

- Initialize and manage IndexedDB database connection using idb library
- Create and maintain database schema for PRD storage with metadata
- Implement CRUD operations for PRD records with 12-draft limit
- Handle database version upgrades and migration from localStorage
- Provide fallback to localStorage when IndexedDB is unavailable
- Implement proper error handling for database operations
- Sanitize ingestion data for storage to prevent storage quota issues

**Dependencies:**

- idb library v8.0.3 for IndexedDB operations
- TypeScript type system
- PRD interfaces for data validation
- Ingest interfaces for repository data handling

#### 4.3.3 Git Ingestion Analyzer (src/lib/ingest.ts)

**Responsibilities:**

- Analyze Git repository data in JSON format
- Detect programming languages from file extensions
- Extract repository metadata including name and last updated date
- Generate key insights about repository structure and composition
- Provide language statistics and module analysis
- Sanitize and prepare ingestion data for storage

**Dependencies:**

- TypeScript type system for data structure validation
- File extension mapping for language detection
- JSON parsing utilities for data extraction

#### 4.3.3 Date/Time Context Helper (src/app/api/\_lib/datetime.ts)

**Responsibilities:**

- Generate current date/time context for AI prompts
- Format date/time strings consistently

#### 4.3.5 Download Utilities (src/lib/download.ts)

**Responsibilities:**

- Generate sanitized filenames for downloaded PRDs
- Handle blob creation and download triggering
- Provide file naming conventions with date stamps

**Dependencies:**

- Browser File API for blob operations
- URL API for download handling

---

## 5. Data Design

### 5.1 Data Models

#### 5.1.1 PrdInput Interface

```typescript
interface PrdInput {
  productName: string;
  targetAudience: string;
  problemStatement: string;
  proposedSolution: string;
  coreFeatures: string;
  businessGoals: string;
  futureFeatures: string;
  techStack: string;
  constraints: string;
}
```

**Description:** Represents the structured input data for PRD generation.

#### 5.1.2 StoredDraft Interface

```typescript
interface StoredDraft {
  id: string;
  title: string;
  createdAt: string;
  model: string;
  inputs: PrdInput;
  markdown: string;
  ingest?: {
    insight: IngestInsight | null;
    fileName?: string;
    fileSize?: number;
  };
}
```

**Description:** Represents a stored PRD draft with metadata and optional ingestion data.

#### 5.1.3 IngestInsight Interface

```typescript
interface IngestInsight {
  rawText: string;
  json: UnknownRecord | UnknownRecord[] | null;
  fileCount: number;
  moduleNames: string[];
  languageStats: Array<{ language: string; count: number }>;
  keyInsights: string[];
  repoName?: string;
  lastUpdated?: string;
}
```

**Description:** Represents analysis results from Git repository ingestion.

#### 5.1.4 Form State Structure

The application maintains a structured state object containing:

- User input data (PrdInput object)
- UI state (loading indicators, error messages)
- Configuration (API key, selected model, model display name)
- Generated content (PRD text)
- Product idea for prefill functionality
- Refinement state (section being refined, feedback)
- Modal states (settings, saved drafts, refine)
- PWA installation state

### 5.2 Data Flow

#### 5.2.1 User Input Flow

1. User enters data in UI components
2. onChange events update the state in page.tsx
3. State changes trigger re-renders of preview components
4. Data is validated before submission to AI

#### 5.2.2 PRD Generation Flow

1. User submits form
2. Form data is validated
3. Client sends request to /api/generate
4. Server-side route processes request and calls Gemini API
5. Generated response is returned to client
6. UI updates to display generated PRD

#### 5.2.3 Data Persistence

- API key and model preferences stored in browser localStorage
- No server-side storage of user data
- Form data exists only in browser memory during session
- Generated PRDs stored in IndexedDB (max 12 drafts) with fallback to localStorage
- PRD metadata (product name, creation date, model used) stored alongside content
- IndexedDB implementation using idb library with proper error handling and transaction management
- Automatic migration from localStorage to IndexedDB on first load
- Git ingestion data stored alongside PRD drafts for context preservation
- PWA install prompt dismissal tracking in localStorage

---

## 6. Interface Design

### 6.1 User Interface

#### 6.1.1 Main Layout

The application follows a responsive Neo-Brutalism layout with:

- Header with settings and model indicator, styled with thick black borders and offset shadows
- Main content area split into form and preview, with clear visual separation using Neo-Brutalism design elements
- Footer with additional information, maintaining consistent styling with the Neo-Brutalism aesthetic
- Primary yellow (#FFEB3B), secondary blue (#2196F3), and accent pink (#E91E63) color accents as specified in the design guidelines
- Bold typography using Big Shoulders Display for headings and Inter for body text

#### 6.1.2 Form Interface

- Structured sections with expandable/collapsible behavior, styled with Neo-Brutalism design principles
- Input fields with thick 3px black borders, offset shadows, and appropriate labels and descriptions
- Real-time validation feedback with distinct error and success states following Neo-Brutalism patterns
- Section-specific refine buttons implemented with Neo-Brutalism styling
- All interactive elements have clear hover, focus, and active states with visual feedback

#### 6.1.3 Display Interface

- Markdown-formatted preview of PRD content with Neo-Brutalism styling applied
- Download and copy buttons implemented with primary yellow background and black borders
- Responsive formatting for all content types maintaining Neo-Brutalism design principles across devices
- High contrast readability meeting WCAG 2.1 Level AA standards

#### 6.1.4 Neo-Brutalism Component Specifications

All UI components must implement the following Neo-Brutalism design standards:

**Buttons:**

- Primary buttons: Background #FFEB3B, border 3px solid #000, shadow 4px 4px 0px #000
- Secondary buttons: Background #2196F3, border 3px solid #000, shadow 4px 4px 0px #000
- Hover state: Transform (-2px, -2px) with increased shadow
- Active state: Transform (2px, 2px) with reduced shadow
- Focus state: 4px solid accent color border

**Cards:**

- Background #FFF, border 3px solid #000, shadow 6px 6px 0px #000
- Hover state: Transform (-2px, -2px) with increased shadow
- Padding: 24px with consistent spacing

**Inputs:**

- Background #FFF, border 3px solid #000, shadow 4px 4px 0px #000
- Focus state: Border color #2196F3, shadow 4px 4px 0px #2196F3
- Padding: 12px 16px for text inputs
- Min height: 120px for textareas

### 6.2 API Interfaces

#### 6.2.1 Generate Endpoint

**URL:** POST /api/generate
**Request Body:**

```json
{
  "inputs": {
    "productName": "string",
    "targetAudience": "string",
    "problemStatement": "string",
    "proposedSolution": "string",
    "coreFeatures": "string",
    "businessGoals": "string",
    "futureFeatures": "string",
    "techStack": "string",
    "constraints": "string"
  },
  "apiKey": "string",
  "model": "string"
}
```

**Response:**

```json
{
  "data": "markdown formatted PRD content"
}
```

#### 6.2.2 Prefill Endpoint

**URL:** POST /api/prefill
**Request Body:**

```json
{
  "productIdea": "string",
  "apiKey": "string",
  "model": "string"
}
```

**Response:**

```json
{
  "data": {
    // PrdInput object
  }
}
```

#### 6.2.3 Refine Endpoint

**URL:** POST /api/refine
**Request Body:**

```json
{
  "currentInputs": {
    // PrdInput object
  },
  "sectionTitle": "string",
  "userFeedback": "string",
  "apiKey": "string",
  "model": "string"
}
```

**Response:**

```json
{
  "data": {
    // Updated PrdInput fields
  }
}
```

---

## 7. Design Rationale

### 7.1 Technology Choices

#### 7.1.1 Next.js Framework

Next.js was chosen for its:

- Excellent performance with server-side rendering and static generation
- Built-in API routes for server-side processing
- Strong TypeScript support
- Deployment ease through Vercel
- PWA capabilities with minimal configuration

#### 7.1.2 TypeScript

TypeScript was selected for:

- Early error detection during development
- Better code maintainability
- Improved IDE support and autocompletion
- Explicit API contracts between components

#### 7.1.3 Tailwind CSS

Tailwind CSS was chosen for:

- Rapid UI development
- Consistent design system
- Responsive design capabilities out of the box
- Customization for Neo-Brutalism design effects
- Implementation of design tokens for consistent Neo-Brutalism styling

#### 7.1.4 Google Gemini API

Google Gemini was selected for:

- Advanced AI capabilities for content generation
- Good documentation and SDK support
- Competitive pricing and performance
- Integration with Google's ecosystem

### 7.2 Architecture Decisions

#### 7.2.1 Client-Server Separation

The decision to keep sensitive data (API keys) on the client-side was made to:

- Maintain security with no server-side storage of credentials
- Eliminate the need for user accounts or authentication
- Provide a more straightforward deployment model

#### 7.2.2 Component-Based Architecture

The component-based approach was chosen to:

- Enable reusability of UI elements
- Improve maintainability through modular design
- Facilitate easier testing of individual components
- Support responsive design principles

### 7.3 Security Considerations

- API keys are stored in browser localStorage only
- All communication with Gemini API uses HTTPS
- No server-side logging of user data or API keys
- Client-side validation of all inputs before API calls

### 7.4 Neo-Brutalism Implementation Considerations

- Implementation of design tokens for consistent color, typography, and spacing
- Use of CSS variables for Neo-Brutalism styling elements (borders, shadows, colors)
- Component-based architecture to ensure consistent application of Neo-Brutalism principles
- Responsive design patterns that maintain Neo-Brutalism aesthetics across all device sizes
- Accessibility implementation meeting WCAG 2.1 Level AA standards with high contrast elements
- Animation and interaction patterns following Neo-Brutalism principles (bold, purposeful movements)

---

## 8. Implementation Plan

### 8.1 Development Phases

#### Phase 1: Core Functionality

- Implement basic form UI
- Create API routes for PRD generation
- Implement client-server communication
- Add basic styling and responsive design

#### Phase 2: Enhanced UX

- Implement real-time preview
- Add error handling and validation
- Implement settings modal for API configuration
- Add export functionality

#### Phase 2.5: Local Storage Implementation

- Design and implement IndexedDB schema for PRD storage
- Create IndexedDB manager utility for CRUD operations
- Implement fallback to localStorage when IndexedDB unavailable
- Create UI component for managing saved PRDs

#### Phase 3: Advanced Features

- Implement prefill functionality
- Add section refinement capabilities
- Implement model selection interface
- Add PWA functionality

#### Phase 4: Polish and Deployment

- Add comprehensive error handling
- Implement proper loading states
- Optimize performance
- Deploy to production environment

### 8.2 Testing Strategy

- Unit tests for utility functions
- Integration tests for API routes
- End-to-end tests for critical user flows
- Cross-browser compatibility testing
- Responsive design testing on multiple devices

---

## 9. Quality Assurance

### 9.1 Quality Attributes

- **Performance:** Fast load times and API response handling
- **Usability:** Intuitive interface with clear instructions
- **Reliability:** Graceful error handling and fallbacks
- **Security:** Safe handling of API keys and user data
- **Maintainability:** Clean, well-documented code

### 9.2 Verification and Validation

- Regular code reviews
- Automated testing of critical paths
- User acceptance testing before releases
- Performance monitoring in production

---

## Appendix A: Diagrams

### A.1 Component Architecture Diagram

[Component diagram showing relationships between major UI and API components]

### A.2 Data Flow Diagram

[Data flow diagram showing how information moves through the application]

### A.3 API Architecture Diagram

[API architecture diagram showing request flow between client and external services]
