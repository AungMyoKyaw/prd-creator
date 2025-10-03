export interface PrdInput {
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

export const DEFAULT_PRD_INPUT: PrdInput = {
  productName: '',
  targetAudience: '',
  problemStatement: '',
  proposedSolution: '',
  coreFeatures: '',
  keyFeatures: '',
  businessGoals: '',
  successMetrics: '',
  futureFeatures: '',
  techStack: '',
  constraints: ''
};

export const SECTION_FIELD_MAPPING: Record<string, Array<keyof PrdInput>> = {
  '1. Core Product Idea': [
    'productName',
    'problemStatement',
    'proposedSolution'
  ],
  '2. Audience & Market': ['targetAudience', 'businessGoals'],
  '3. Features & Scope': ['coreFeatures', 'futureFeatures'],
  '4. Technical Details (Optional)': ['techStack', 'constraints']
};

export function generatePreviewMarkdown(inputs: PrdInput): string {
  return `
# ${inputs.productName || 'Product Name...'}

---

### 1. Introduction & Vision

**1.1. Problem Statement**
*The core problem this product solves is:*
${inputs.problemStatement || '...'}

**1.2. Proposed Solution**
*Our proposed solution is:*
${inputs.proposedSolution || '...'}

**1.3. Vision**
*[AI will generate a compelling long-term vision for this product based on the problem and solution.]*

---

### 2. Target Audience & User Personas

**2.1. Primary Audience**
*The primary users for this product are:*
${inputs.targetAudience || '...'}

**2.2. User Personas**
*[AI will generate 2-3 brief but distinct user personas based on the target audience.]*

---

### 3. Product Goals & Success Metrics

**3.1. Business Goals**
*The key business objectives for this product are:*
${inputs.businessGoals || '...'}

**3.2. Success Metrics (KPIs)**
*[AI will generate specific, measurable, achievable, relevant, and time-bound (SMART) KPIs based on the business goals.]*

---

### 4. Features & Requirements

**4.1. Core Features (MVP)**
*The essential features for the Minimum Viable Product are:*
${inputs.coreFeatures || '- ...'}

**4.2. User Stories**
*[AI will write 2-3 detailed user stories for each core feature.]*

**4.3. Future Features (Post-MVP)**
*Potential features for future releases include:*
${inputs.futureFeatures || '- ...'}

---

### 5. Technical Considerations & Constraints

**5.1. Technology Stack**
*The proposed or existing technology stack is:*
${inputs.techStack || '...'}

**5.2. Constraints & Dependencies**
*Known limitations and dependencies are:*
${inputs.constraints || '...'}

---

### 6. Out of Scope

*[AI will define what will NOT be included in the initial release to manage expectations.]*
  `;
}

export function buildGenerationPrompt(inputs: PrdInput): string {
  return `
You are an expert Senior Product Manager at a leading tech company. Your task is to write a comprehensive Product Requirements Document (PRD) based on the following information. The PRD should be well-structured, clear, professional, and detailed, suitable for a development team to start working from. Format the output in clean Markdown.

**Product Name:** ${inputs.productName}

---

### 1. Introduction & Vision

**1.1. Problem Statement**
*The core problem this product solves is:*
${inputs.problemStatement}

**1.2. Proposed Solution**
*Our proposed solution is:*
${inputs.proposedSolution}

**1.3. Vision**
*Based on the problem and solution, generate a compelling long-term vision for this product.*

---

### 2. Target Audience & User Personas

**2.1. Primary Audience**
*The primary users for this product are:*
${inputs.targetAudience}

**2.2. User Personas**
*Based on the target audience, generate 2-3 brief but distinct user personas. For each persona, include their goals and frustrations related to the problem statement.*

---

### 3. Product Goals & Success Metrics

**3.1. Business Goals**
*The key business objectives for this product are:*
${inputs.businessGoals || 'Not specified. Generate reasonable business goals like user acquisition, engagement, and revenue generation.'}

**3.2. Success Metrics (KPIs)**
*We will measure success through the following Key Performance Indicators:*
*Based on the business goals, generate specific, measurable, achievable, relevant, and time-bound (SMART) KPIs.*

---

### 4. Features & Requirements

**4.1. Core Features (MVP)**
*The essential features for the Minimum Viable Product are:*
${inputs.coreFeatures}

**4.2. User Stories**
*For each core feature listed above, write 2-3 detailed user stories in the format: "As a [user type], I want to [action], so that I can [benefit]."*

**4.3. Future Features (Post-MVP)**
*Potential features for future releases include:*
${inputs.futureFeatures || 'Not specified. Brainstorm 2-4 logical feature enhancements for future consideration.'}

---

### 5. Technical Considerations & Constraints

**5.1. Technology Stack**
*The proposed or existing technology stack is:*
${inputs.techStack || 'Not specified.'}

**5.2. Constraints & Dependencies**
*Known limitations and dependencies are:*
${inputs.constraints || 'None specified.'}

---

### 6. Out of Scope

*To ensure focus for the initial release, the following items are explicitly out of scope for the MVP:*
*Based on the core features, define what will NOT be included in the initial release to manage expectations.*
  `;
}
