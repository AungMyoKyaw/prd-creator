# PRD Creator - UI/UX Design Guidelines

## 2025 Design System Update: Compact Neo-Brutalism

**Overview:** In 2025, the PRD Creator interface was optimized for a more compact, space-efficient design while maintaining the bold Neo-Brutalism aesthetic. These changes improve content density and user experience without sacrificing the distinctive visual style.

**Key Changes:**

- **Reduced vertical spacing** - Header height decreased by 50% for more content visibility
- **Compact component sizing** - Buttons, inputs, and cards use smaller padding and margins
- **Refined borders and shadows** - Standardized to 2px borders and smaller shadow offsets
- **Optimized typography** - Slightly smaller text sizes while maintaining readability
- **Tighter layout gaps** - Grid spacing reduced for efficient screen utilization

**Benefits:**

- More screen real estate for actual content
- Improved mobile experience with less scrolling
- Maintained visual impact while being more functional
- Better information density for complex forms

## 1. Design Philosophy

### 1.1. Neo-Brutalism Design System

PRD Creator adopts a **Neo-Brutalism** design aesthetic, drawing inspiration from the Neo-Brutalism UI Library (https://neo-brutalism-ui-library.vercel.app/). This design approach creates a bold, memorable, and highly functional user interface that stands out from traditional product planning tools.

**Core Philosophy:**

> "Transform the PRD creation experience with eye-catching, bold design elements that command attention while maintaining exceptional usability. Create a visually captivating interface that makes AI-powered product planning feel accessible and empowering."

### 1.2. Design Principles

1. **Bold & Confident:** Use strong visual elements that convey power and capability
2. **High Contrast:** Ensure excellent readability and visual hierarchy
3. **Brutally Honest:** Clear, direct communication with no hidden complexity
4. **Joyfully Functional:** Delightful interactions that serve a purpose
5. **Accessible by Design:** Bold aesthetics that enhance usability for everyone

## 2. Visual Design System

### 2.1. Color Palette

#### Primary Colors

```css
/* Primary - Energetic Yellow */
--primary-50: #fffde7;
--primary-100: #fff9c4;
--primary-200: #fff59d;
--primary-400: #ffee58;
--primary-500: #ffeb3b; /* Main primary */
--primary-600: #fdd835;
--primary-700: #fbc02d;
--primary-900: #f57f17;

/* Secondary - Bold Blue */
--secondary-50: #e3f2fd;
--secondary-100: #bbdefb;
--secondary-300: #64b5f6;
--secondary-500: #2196f3; /* Main secondary */
--secondary-700: #1976d2;
--secondary-900: #0d47a1;

/* Accent - Vibrant Pink */
--accent-100: #fce4ec;
--accent-300: #f06292;
--accent-500: #e91e63; /* Main accent */
--accent-700: #c2185b;
--accent-900: #880e4f;

/* Success - Bright Green */
--success-300: #81c784;
--success-500: #4caf50; /* Main success */
--success-700: #388e3c;

/* Warning - Bold Orange */
--warning-300: #ffb74d;
--warning-500: #ff9800; /* Main warning */
--warning-700: #f57c00;

/* Danger - Strong Red */
--danger-300: #e57373;
--danger-500: #f44336; /* Main danger */
--danger-700: #d32f2f;
```

#### Neutral Colors

```css
/* Neutrals */
--black: #000000; /* Borders and text */
--white: #ffffff; /* Backgrounds */
--gray-50: #fafafa;
--gray-100: #f5f5f5;
--gray-200: #eeeeee;
--gray-300: #e0e0e0;
--gray-400: #bdbdbd;
--gray-500: #9e9e9e;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;
```

#### Color Usage Guidelines

**Backgrounds:**

- Primary cards/sections: White (#FFFFFF) or Light Gray (#F5F5F5)
- Accent sections: Primary yellow (#FFEB3B), Secondary blue (#2196F3)
- Interactive hover states: Slightly darker variants (-100/-200)

**Text:**

- Primary text: Black (#000000)
- Secondary text: Gray-700 (#616161)
- On colored backgrounds: White (#FFFFFF)
- Links: Secondary blue (#2196F3)

**Borders:**

- All borders: Pure black (#000000)
- Border width: 2px (standard), 3px (emphasis), 4px (heavy emphasis)
- No rounded corners or minimal (2px max)
- **Updated (2025):** Standardized to 2px borders for most components to create a more compact, refined look while maintaining the neo-brutalism aesthetic

**Status Colors:**

- Excellent/Success: Green (#4CAF50)
- Good/Info: Blue (#2196F3)
- Warning/Fair: Orange (#FF9800)
- Error/Needs Work: Red (#F44336)

### 2.2. Typography

#### Font Families

```css
/* Primary Display Font */
--font-display: 'Big Shoulders Display', 'Impact', 'Arial Black', sans-serif;

/* Secondary Sans-Serif */
--font-sans: 'Inter', 'Helvetica Neue', 'Arial', sans-serif;

/* Monospace (Code) */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

#### Type Scale

```css
/* Headings - Bold and Commanding */
--text-6xl: 3.75rem; /* 60px - Hero titles */
--text-5xl: 3rem; /* 48px - Page titles */
--text-4xl: 2.25rem; /* 36px - Section headers */
--text-3xl: 1.875rem; /* 30px - Card titles */
--text-2xl: 1.5rem; /* 24px - Subsections */
--text-xl: 1.25rem; /* 20px - Large body */

/* Body Text */
--text-lg: 1.125rem; /* 18px - Lead text */
--text-base: 1rem; /* 16px - Body text */
--text-sm: 0.875rem; /* 14px - Small text */
--text-xs: 0.75rem; /* 12px - Captions */
```

#### Font Weights

```css
--font-black: 900; /* Display headings */
--font-extrabold: 800; /* Emphasis headings */
--font-bold: 700; /* Headings, buttons */
--font-semibold: 600; /* Subheadings, labels */
--font-medium: 500; /* Body emphasis */
--font-normal: 400; /* Body text */
```

#### Typography Guidelines

**Headings:**

- Use Big Shoulders Display for main headings (H1-H3)
- Font weight: 800-900 for primary headings
- Font weight: 700 for subheadings
- Line height: 1.1-1.2 for tight, impactful spacing
- Letter spacing: -0.02em for large headings
- Text transform: uppercase for emphasis (sparingly)

**Body Text:**

- Use Inter or system sans-serif for body content
- Font weight: 400 (normal), 500 (emphasis)
- Line height: 1.6 for optimal readability
- Paragraph spacing: 1em
- Max width: 65-75 characters per line

**Interactive Text:**

- Buttons: Bold (700), uppercase, letter-spacing: 0.05em
- Links: Semibold (600), underline on hover
- Labels: Semibold (600), small caps option

### 2.3. Spacing System

```css
/* Spacing Scale - 4px base unit */
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

#### Spacing Guidelines

**Component Padding:**

- Small buttons/inputs: 4px × 12px (space-1 × space-3)
- Medium buttons/inputs: 8px × 16px (space-2 × space-4)
- Large buttons/CTAs: 12px × 24px (space-3 × space-6)
- Cards: 16px (space-4) to 24px (space-6)
- Page sections: 24px (space-6) to 32px (space-8)
- **Updated (2025):** Reduced padding across all components for a more compact, space-efficient design

**Component Margins:**

- Between small elements: 4px (space-1)
- Between related elements: 8px (space-2) to 12px (space-3)
- Between sections: 16px (space-4) to 24px (space-6)
- Between major sections: 32px (space-8) to 48px (space-12)
- **Updated (2025):** Reduced margins for tighter, more efficient layout

**Grid Gaps:**

- Tight grids: 8px (space-2)
- Standard grids: 16px (space-4) to 24px (space-6)
- Loose grids: 32px (space-8)
- **Updated (2025):** Optimized grid gaps for compact layouts

### 2.4. Shadows and Depth

#### Shadow System

```css
/* Hard, Offset Shadows - Neo-Brutalism Style */
--shadow-sm: 1px 1px 0px #000; /* Minimal/active states */
--shadow-base: 2px 2px 0px #000; /* Standard components */
--shadow-emphasis: 4px 4px 0px #000; /* Emphasis elements */
/* **Updated (2025):** Standardized shadow offsets for compact neo-brutalism design */

/* Colored Shadows for Accent Elements */
--shadow-primary: 6px 6px 0px #fdd835;
--shadow-secondary: 6px 6px 0px #1976d2;
--shadow-accent: 6px 6px 0px #c2185b;
```

#### Shadow Usage

**Cards:**

- Default state: `shadow-base` (2px offset)
- Hover state: `shadow-emphasis` (4px offset) with slight transform
- Active state: `shadow-sm` (1px offset)

**Buttons:**

- Default: `shadow-base` (2px offset)
- Hover: Lift slightly with `shadow-emphasis` (4px offset)
- Active: `shadow-sm` (1px offset) to create "pressed" effect

**Floating Elements:**

- Modals: `shadow-emphasis` (4px offset) or colored shadow variants
- Tooltips: `shadow-base` (2px offset)
- Dropdowns: `shadow-emphasis` (4px offset)

**Colored Shadows:**

- Use for primary CTAs and featured content
- Matches or complements element background color
- Creates extra visual "pop"

### 2.5. Borders

```css
/* Border Widths */
--border-thin: 2px; /* Standard components */
--border-base: 3px; /* Emphasis elements */
--border-thick: 4px; /* Heavy emphasis (rare) */

/* Border Styles */
--border-solid: solid;
--border-dashed: dashed; /* For secondary/disabled states */

/* Border Radius - Minimal or None */
--radius-none: 0;
--radius-sm: 2px; /* Barely perceptible */
--radius-base: 4px; /* Maximum for neo-brutalism */
```

#### Border Guidelines

**Standard Components:**

- All cards, buttons, inputs: 2px solid black border (standard)
- Focus states: 3px solid with accent color (emphasis)
- Disabled states: 2px dashed gray border
- Featured elements: 3px solid black border (emphasis)

**Additional Emphasis:**

- Critical CTAs: 3px solid black border (emphasis)
- Separators: 2px solid black (standard)

**Border Radius:**

- Prefer sharp corners (0px radius)
- Use minimal radius (2-4px) only for inputs/buttons if needed
- Never exceed 4px radius for neo-brutalism authenticity

## 3. Component Design Patterns

### 3.1. Buttons

#### Primary Button

```css
.btn-primary {
  background: #ffeb3b;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px #000;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #000;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0px #000;
}

.btn-primary:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px #000;
}
/* **Updated (2025):** Compact button styling with standardized shadows */
```

#### Secondary Button

```css
.btn-secondary {
  background: #2196f3;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px #000;
  color: #fff;
  /* ... same padding, font properties as primary */
}
/* **Updated (2025):** Secondary button with compact styling */
```

#### Button States

- **Default:** Bold border, offset shadow
- **Hover:** Transform up-left, increase shadow
- **Active:** Transform down-right, reduce shadow
- **Disabled:** Dashed border, grayscale, no shadow
- **Focus:** Double border or colored border ring

#### Button Sizes

- **Small:** 4px × 12px padding, 0.75rem font
- **Medium:** 8px × 16px padding, 0.875rem font (default)
- **Large:** 12px × 24px padding, 1rem font
- **Updated (2025):** Reduced button sizes for compact interface

### 3.2. Cards

#### Standard Card

```css
.card {
  background: #fff;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px #000;
  padding: 16px;
  transition: all 0.2s ease;
}

.card:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0px #000;
}
/* **Updated (2025):** Compact card styling with standardized borders and shadows */
```

#### Card Variants

**Accent Card:**

- Background: Primary yellow or secondary blue
- Border: 3px solid black (emphasis)
- Text: Black (on light) or white (on dark)

**Info Card:**

- Background: Light gray (#F5F5F5)
- Colored left border: 5px solid accent color
- Shadow: Standard black

**Interactive Card:**

- Hover: Lift effect with increased shadow
- Click: Compress effect with reduced shadow
- Selected: Colored border or colored shadow

### 3.3. Forms and Inputs

#### Text Input

```css
.input {
  background: #fff;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px #000;
  padding: 8px 12px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.input:focus {
  outline: none;
  border: 3px solid #2196f3;
  box-shadow: 2px 2px 0px #2196f3;
  transform: translate(-1px, -1px);
}
/* **Updated (2025):** Compact input styling with standardized borders and shadows */
```

#### Textarea

- Same styling as text input
- Min height: 100px
- Resize: vertical only
- Compact padding: 12px
- **Updated (2025):** Reduced textarea dimensions for compact layout

#### Labels

```css
.label {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  color: #000;
}
```

#### Form States

- **Error:** Red border (3px), red shadow
- **Success:** Green border, green shadow
- **Disabled:** Dashed gray border, gray background
- **Required:** Bold label, asterisk in accent color

### 3.4. Navigation

#### Top Navigation Bar

```css
.navbar {
  background: #fff;
  border-bottom: 4px solid #000;
  padding: 16px 24px;
  box-shadow: 0 4px 0px #000;
}
```

#### Navigation Items

- Bold text (600-700 weight)
- Black borders separate items
- Hover: Background color change
- Active: Bold accent background

#### Settings Icon/Button

- Prominent position (top-right)
- Icon with thick strokes
- Clear click/tap target (44×44px minimum)

### 3.5. Modals and Dialogs

#### Modal Container

```css
.modal {
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;
  padding: 32px;
  max-width: 600px;
}
```

#### Modal Overlay

- Semi-transparent black: rgba(0, 0, 0, 0.7)
- Backdrop blur: 4px (optional)
- Center modal in viewport

#### Modal Header

- Large bold heading (text-3xl, weight 800)
- Close button: Bold X with thick strokes
- Bottom border: 2px solid black (standard)

### 3.6. Progress Indicators

#### Progress Bar

```css
.progress-bar {
  background: #e0e0e0;
  border: 2px solid #000;
  height: 24px;
  position: relative;
}

.progress-fill {
  background: #ffeb3b;
  border-right: 2px solid #000;
  height: 100%;
  transition: width 0.3s ease;
}
```

#### Progress States

- Use vibrant colors for fill
- Show percentage in bold text
- Animate with smooth transitions

#### Loading Spinner

- Thick borders (4-5px)
- Black and accent color rotation
- Minimal or no border radius
- Clear animation

### 3.7. Badges and Chips

#### Badge/Chip

```css
.badge {
  background: #e91e63;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px #000;
  padding: 4px 12px;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #fff;
  display: inline-block;
}
```

#### Badge Colors

- Use semantic colors for status
- High contrast text
- Small but readable

### 3.8. Tooltips

```css
.tooltip {
  background: #000;
  border: 3px solid #ffeb3b;
  box-shadow: 4px 4px 0px #ffeb3b;
  padding: 8px 12px;
  color: #fff;
  font-weight: 600;
  font-size: 0.875rem;
}
```

- Arrow/pointer with matching border
- Appears on hover with slight delay (300ms)
- Clear, concise text

### 3.9. Tables

```css
.table {
  border: 2px solid #000;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  background: #ffeb3b;
  border-bottom: 2px solid #000;
  font-weight: 700;
  text-transform: uppercase;
  padding: 12px;
}

.table td {
  border-bottom: 2px solid #e0e0e0;
  padding: 12px;
}
```

## 4. Layout and Structure

### 4.1. Grid System

```css
/* 12-column grid */
--grid-cols-12: repeat(12, minmax(0, 1fr));
--grid-gap: 24px;

/* Responsive breakpoints */
--breakpoint-sm: 640px; /* Mobile landscape */
--breakpoint-md: 768px; /* Tablet */
--breakpoint-lg: 1024px; /* Desktop */
--breakpoint-xl: 1280px; /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

#### Layout Patterns

**Two-Column Split (Desktop):**

- Left panel: 50% width (input area)
- Right panel: 50% width (results)
- Vertical separator: 4px solid black
- Stacked on mobile

**Card Grid:**

- 3-column on large screens
- 2-column on tablet
- 1-column on mobile
- Consistent gaps: 24px

**Section Spacing:**

- Page margins: 24px (mobile) to 48px (desktop)
- Section padding: 32px to 64px
- Max content width: 1440px
- Center content with auto margins

### 4.2. Responsive Design

#### Mobile-First Approach

1. Design for mobile (320px+)
2. Scale up to tablet (768px+)
3. Optimize for desktop (1024px+)
4. Enhance for large screens (1440px+)

#### Breakpoint Strategy

```css
/* Mobile (default) */
.container {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
  }
  .two-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

#### Touch Targets

- Minimum size: 44×44px
- Generous spacing: 8px minimum between targets
- Clear visual feedback on tap
- No hover-only interactions on mobile

### 4.3. Page Templates

#### Main Application Layout

```
┌─────────────────────────────────────────────┐
│  HEADER (Logo, Settings)                    │
├─────────────────────────────────────────────┤
│  ┌──────────────┐ │ ┌──────────────┐       │
│  │              │ │ │              │       │
│  │ INPUT PANEL  │ │ │ RESULTS      │       │
│  │              │ │ │ PANEL        │       │
│  │              │ │ │              │       │
│  └──────────────┘ │ └──────────────┘       │
└─────────────────────────────────────────────┘
```

#### Mobile Layout

```
┌─────────────┐
│  HEADER     │
├─────────────┤
│             │
│ INPUT AREA  │
│             │
├─────────────┤
│             │
│ RESULTS     │
│ (Scrollable)│
│             │
└─────────────┘
```

## 5. Interactive Design

### 5.1. Animation and Motion

#### Animation Principles

1. **Quick and Snappy:** 150-250ms for most transitions
2. **Purpose-Driven:** Every animation serves a function
3. **Consistent Easing:** ease-out for entrances, ease-in for exits
4. **Reduced Motion:** Respect user preferences

#### Common Animations

```css
/* Hover lift */
.element:hover {
  transform: translate(-2px, -2px);
  transition: transform 0.15s ease-out;
}

/* Button press */
.button:active {
  transform: translate(2px, 2px);
  transition: transform 0.1s ease-in;
}

/* Fade in */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Animation Do's and Don'ts

- ✅ Use for feedback and state changes
- ✅ Keep durations short (< 300ms)
- ✅ Provide reduced motion alternatives
- ❌ Don't overuse or make gratuitous
- ❌ Don't block user interaction
- ❌ Don't create motion sickness

### 5.2. Micro-interactions

#### Hover Effects

- Scale slightly (1.02-1.05)
- Lift with increased shadow
- Color brighten or darken
- Border color change

#### Click/Tap Effects

- Compress with reduced shadow
- Brief color flash
- Subtle scale down (0.95-0.98)
- Haptic feedback on mobile

#### Focus States

- Thick colored border or outline
- Increased shadow
- Background color shift
- Clear visual differentiation

#### Loading States

- Skeleton screens with pulsing animation
- Progress bars with smooth fills
- Spinner with rotating animation
- Optimistic UI updates

### 5.3. Feedback Mechanisms

#### Success Feedback

- Green checkmark icon
- Success color border/background
- Brief animation (scale/fade)
- Toast notification (3-5 seconds)

#### Error Feedback

- Red X icon or error symbol
- Red border and shadow
- Shake animation
- Error message with guidance

#### Info/Warning

- Orange/blue accent colors
- Icon with appropriate semantic meaning
- Persistent until dismissed
- Clear action buttons

## 6. Accessibility

### 6.1. WCAG 2.1 AA Compliance

#### Color Contrast

- Text on background: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum
- Test with tools: Stark, Contrast Checker

#### Keyboard Navigation

- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Skip navigation links
- Keyboard shortcuts documented

#### Screen Reader Support

- Semantic HTML structure
- ARIA labels for icons
- ARIA live regions for updates
- Alt text for images
- Form labels properly associated

#### Focus Management

- Focus visible: 3px outline or border
- Focus trap in modals
- Return focus on close
- Skip links for navigation

### 6.2. Inclusive Design

#### Text Accessibility

- Minimum font size: 16px (1rem)
- Line height: 1.5-1.6 for body
- Max line length: 65-75 characters
- Resizable text up to 200%
- No justified text

#### Motion and Animation

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Color Independence

- Never rely on color alone
- Use icons, text, patterns
- Multiple visual cues
- High contrast mode support

#### Touch and Click Targets

- Minimum 44×44px
- Adequate spacing (8px+)
- Clear clickable areas
- Visual feedback on all states

## 7. Content Guidelines

### 7.1. Voice and Tone

**Brand Voice:**

- Bold and confident
- Empowering and encouraging
- Clear and direct
- Technically precise yet accessible
- Slightly irreverent but professional

**Tone Variations:**

- **Success messages:** Enthusiastic and celebratory
- **Error messages:** Helpful and constructive
- **Instructions:** Clear and actionable
- **Technical content:** Precise but not intimidating

### 7.2. Writing Style

#### Headings

- Active, action-oriented
- Front-load important words
- Use sentence case
- Keep under 60 characters

#### Body Copy

- Short sentences (15-20 words)
- One idea per paragraph
- Active voice preferred
- Avoid jargon unless necessary
- Explain technical terms

#### Buttons and CTAs

- Start with verbs
- Be specific: "Optimize Prompt" vs "Submit"
- Use sentence case or uppercase consistently
- Keep under 3 words when possible

#### Error Messages

- Explain what happened
- Why it happened
- How to fix it
- Provide next steps

**Example:**
❌ "Error 403"
✅ "Unable to connect. Check your API key in settings and try again."

### 7.3. Microcopy

#### Empty States

"No saved prompts yet. Optimize your first prompt to get started!"

#### Loading States

"Optimizing your prompt..."
"Analyzing effectiveness..."
"Generating recommendations..."

#### Success Messages

"Prompt optimized! 🚀"
"Saved successfully!"
"Copied to clipboard!"

#### Helpful Hints

"Pro tip: Use Cmd+Enter to optimize quickly"
"Try including specific context for better results"

## 8. Implementation Guidelines

### 8.1. Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFFDE7',
          100: '#FFF9C4',
          500: '#FFEB3B',
          700: '#FBC02D',
          900: '#F57F17'
        }
        // ... more colors
      },
      fontFamily: {
        display: ['Big Shoulders Display', 'Impact', 'sans-serif'],
        sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #000',
        neo: '4px 4px 0px #000',
        'neo-md': '6px 6px 0px #000',
        'neo-lg': '8px 8px 0px #000',
        'neo-xl': '12px 12px 0px #000'
      },
      borderWidth: {
        3: '3px',
        5: '5px'
      }
    }
  },
  plugins: []
};
```

### 8.2. Component Architecture

#### Reusable Components

- Button (Primary, Secondary, Danger, Ghost)
- Card (Default, Accent, Interactive)
- Input (Text, Textarea, Select)
- Modal (Standard, Confirmation, Full-screen)
- Badge (Status, Category, Count)
- Tooltip
- Progress Bar
- Loading Spinner

#### Component Props Pattern

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}
```

### 8.3. Design Tokens

```css
:root {
  /* Colors */
  --color-primary: #ffeb3b;
  --color-secondary: #2196f3;
  --color-accent: #e91e63;
  --color-black: #000000;
  --color-white: #ffffff;

  /* Typography */
  --font-display: 'Big Shoulders Display', sans-serif;
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-unit: 4px;
  --space-xs: calc(var(--space-unit) * 2);
  --space-sm: calc(var(--space-unit) * 3);
  --space-md: calc(var(--space-unit) * 4);
  --space-lg: calc(var(--space-unit) * 6);
  --space-xl: calc(var(--space-unit) * 8);

  /* Borders */
  --border-width: 3px;
  --border-color: var(--color-black);
  --border-radius: 0px;

  /* Shadows */
  --shadow-sm: 2px 2px 0px var(--color-black);
  --shadow-base: 4px 4px 0px var(--color-black);
  --shadow-lg: 8px 8px 0px var(--color-black);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

### 8.4. Dark Mode Considerations

While Neo-Brutalism typically uses light backgrounds, a dark mode variation:

```css
[data-theme='dark'] {
  --color-background: #1a1a1a;
  --color-surface: #2d2d2d;
  --color-text: #ffffff;
  --border-color: #ffffff;

  /* Soften bright accent colors slightly */
  --color-primary: #ffd700;
  --color-secondary: #42a5f5;
}
```

**Dark Mode Guidelines:**

- Invert black/white for borders and text
- Slightly muted accent colors
- Maintain high contrast
- Keep bold aesthetic
- Test for accessibility

## 9. Performance Considerations

### 9.1. Visual Performance

- Use CSS transforms for animations (GPU-accelerated)
- Avoid animating width/height (use scale instead)
- Debounce hover effects on large lists
- Lazy load images below the fold
- Use font-display: swap for web fonts

### 9.2. Asset Optimization

- Optimize images (WebP format, appropriate sizes)
- Inline critical CSS
- Minimize font variants loaded
- Use system fonts as fallback
- Compress SVG icons

### 9.3. Perceived Performance

- Show skeleton screens while loading
- Optimistic UI updates
- Instant feedback on interactions
- Progressive enhancement
- Graceful degradation

## 10. Brand Application

### 10.1. Logo and Identity

**Logo Design:**

- Bold, geometric typography
- Thick black outline
- Primary yellow or secondary blue accent
- Works in monochrome (black on white)

**Logo Usage:**

- Minimum size: 120px width
- Clear space: Equal to logo height
- Do not stretch or distort
- Do not add effects or shadows

### 10.2. Iconography

**Icon Style:**

- Thick strokes (3px minimum)
- Geometric shapes
- Clear, simple forms
- Consistent line weight
- Black fill or outline

**Icon Set:**

- **Primary Icon Library (Application Code)**: Lucide React Icons - All icons in the application code must use Lucide React icons
- **Primary Icon Library (Documentation)**: Emojis - All icons in documentation files must use emojis
- Use consistent icon library (Lucide Icons for code, Emojis for docs)
- Or create custom icons matching style
- Size multiples of 8px (16, 24, 32, 48)

**Icon Usage Requirements:**

- **Application Code**: Use Lucide React icons throughout the application interface
- **Documentation**: Use emojis throughout documentation files
- Use semantic icons that match functionality (e.g., CheckCircle for success, XCircle for errors, AlertCircle for warnings in code; ✅, ❌, ⚠️ in docs)
- Maintain consistent sizing and styling with the Neo-Brutalism design system

### 10.3. Illustrations

**Illustration Style:**

- Flat, geometric shapes
- Bold outlines (3-5px)
- Limited color palette
- Abstract or simplified forms
- Playful but professional

## 11. Quality Checklist

### 11.1. Design Review Checklist

- [ ] Uses approved color palette
- [ ] Maintains consistent border width (3px)
- [ ] Includes proper shadows (offset, no blur)
- [ ] Typography follows scale and weights
- [ ] Adequate spacing and padding
- [ ] Meets contrast requirements (4.5:1)
- [ ] Interactive states defined (hover, focus, active)
- [ ] Responsive at all breakpoints
- [ ] Keyboard accessible
- [ ] Screen reader friendly

### 11.2. Development Checklist

- [ ] Uses design tokens/CSS variables
- [ ] Components are reusable
- [ ] Accessibility attributes present (ARIA)
- [ ] Focus states implemented
- [ ] Animations have reduced-motion alternatives
- [ ] Performance optimized
- [ ] Cross-browser tested
- [ ] Mobile tested on real devices
- [ ] Meets Lighthouse scores (90+ all categories)

## 12. Resources and Tools

### 12.1. Design Tools

- **Figma:** Component library, prototypes
- **Stark:** Accessibility checking
- **ColorBox:** Color palette generation
- **Type Scale:** Typography scale calculator

### 12.2. Development Tools

- **Tailwind CSS:** Utility framework
- **Headless UI:** Accessible components
- **Framer Motion:** Animation library
- **React Aria:** Accessibility primitives

### 12.3. Testing Tools

- **Lighthouse:** Performance and accessibility
- **axe DevTools:** Accessibility testing
- **WAVE:** Web accessibility evaluation
- **BrowserStack:** Cross-browser testing

### 12.4. References

- Neo-Brutalism UI Library: https://neo-brutalism-ui-library.vercel.app/
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Tailwind CSS: https://tailwindcss.com/docs
- React Aria: https://react-spectrum.adobe.com/react-aria/

---

**Document Version:** 1.0
**Last Updated:** 2025
**Maintained By:** PRD Creator Design Team
