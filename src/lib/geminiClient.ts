import { GoogleGenAI } from '@google/genai';
import type { PRDInput } from '../types';

export interface GenerateInputsResult {
  success: boolean;
  data?: { input: PRDInput };
  error?: string;
}

export interface GeneratePRDResult {
  success: boolean;
  data?: { prd: string };
  error?: string;
}

export interface RefineSectionResult {
  success: boolean;
  data?: { updatedInput: Partial<PRDInput> };
  error?: string;
}

/**
 * Retry configuration for API calls
 */
const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
};

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: Error | undefined;
  let delay = RETRY_CONFIG.initialDelay;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (
        lastError.message?.includes('API_KEY') ||
        lastError.message?.includes('quota') ||
        lastError.message?.includes('safety') ||
        lastError.message?.includes('404')
      ) {
        throw lastError;
      }

      if (attempt < RETRY_CONFIG.maxAttempts) {
        console.warn(
          `${operationName} failed (attempt ${attempt}/${RETRY_CONFIG.maxAttempts}). Retrying in ${delay}ms...`,
          lastError
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(
          delay * RETRY_CONFIG.backoffFactor,
          RETRY_CONFIG.maxDelay
        );
      }
    }
  }

  throw lastError;
}

/**
 * Generate PRD inputs from a product idea
 */
export async function generateInputsFromIdea(
  apiKey: string,
  idea: string
): Promise<GenerateInputsResult> {
  try {
    const genAI = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-2.0-flash-exp';

    const prompt = `You are a Senior Product Manager analyzing a product idea. Based on the following idea, generate structured inputs for a PRD.

Product Idea: ${idea}

Generate a JSON object with the following fields (all values must be strings):
- productName: A concise, marketable name (2-5 words)
- targetAudience: Who will use this product (1-2 sentences)
- problemStatement: The core problem being solved (2-3 sentences)
- proposedSolution: How the product solves it (2-3 sentences)
- coreFeatures: List 3-5 essential MVP features (bullet points)
- businessGoals: Key business objectives and KPIs (2-3 points)
- futureFeatures: 2-4 post-MVP feature ideas (bullet points)
- techStack: Suggested technologies (if applicable)
- constraints: Any obvious limitations or dependencies

Return ONLY valid JSON, no markdown formatting or code blocks.`;

    const response = await withRetry(async () => {
      return await genAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      });
    }, 'Generate inputs');

    const text = response.text?.trim() || '{}';
    let parsedInput: PRDInput;

    try {
      parsedInput = JSON.parse(text);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Ensure all fields are strings
    const input: PRDInput = {
      productName: String(parsedInput.productName || ''),
      targetAudience: String(parsedInput.targetAudience || ''),
      problemStatement: String(parsedInput.problemStatement || ''),
      proposedSolution: String(parsedInput.proposedSolution || ''),
      coreFeatures: String(parsedInput.coreFeatures || ''),
      businessGoals: String(parsedInput.businessGoals || ''),
      futureFeatures: String(parsedInput.futureFeatures || ''),
      techStack: String(parsedInput.techStack || ''),
      constraints: String(parsedInput.constraints || '')
    };

    return { success: true, data: { input } };
  } catch (error) {
    console.error('Error generating inputs:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to generate inputs'
    };
  }
}

/**
 * Generate PRD from inputs with streaming support
 */
export async function* generatePRDStream(
  apiKey: string,
  input: PRDInput
): AsyncGenerator<{
  type: 'chunk' | 'complete';
  text?: string;
  fullText?: string;
  wasComplete?: boolean;
  finishReason?: string;
}> {
  const genAI = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-2.0-flash-exp';
  const currentDateTime = new Date().toISOString();

  const prompt = `You are an expert Senior Product Manager at a leading tech company. Your task is to write a comprehensive Product Requirements Document (PRD) based on the following information. The PRD should be well-structured, clear, professional, and detailed, suitable for a development team to start working from. Format the output in clean Markdown.

Current date and time (UTC): ${currentDateTime}

**Product Name:** ${input.productName}

---

### 1. Introduction & Vision

**1.1. Problem Statement**
*The core problem this product solves is:*
${input.problemStatement}

**1.2. Proposed Solution**
*Our proposed solution is:*
${input.proposedSolution}

**1.3. Vision**
*Based on the problem and solution, generate a compelling long-term vision for this product.*

---

### 2. Target Audience & User Personas

**2.1. Primary Audience**
*The primary users for this product are:*
${input.targetAudience}

**2.2. User Personas**
*Based on the target audience, generate 2-3 brief but distinct user personas. For each persona, include their goals and frustrations related to the problem statement.*

---

### 3. Product Goals & Success Metrics

**3.1. Business Goals**
*The key business objectives for this product are:*
${input.businessGoals || 'Not specified. Generate reasonable business goals like user acquisition, engagement, and revenue generation.'}

**3.2. Success Metrics (KPIs)**
*We will measure success through the following Key Performance Indicators:*
*Based on the business goals, generate specific, measurable, achievable, relevant, and time-bound (SMART) KPIs.*

---

### 4. Features & Requirements

**4.1. Core Features (MVP)**
*The essential features for the Minimum Viable Product are:*
${input.coreFeatures}

**4.2. User Stories**
*For each core feature listed above, write 2-3 detailed user stories in the format: "As a [user type], I want to [action], so that I can [benefit]."*

**4.3. Future Features (Post-MVP)**
*Potential features for future releases include:*
${input.futureFeatures || 'Not specified. Brainstorm 2-4 logical feature enhancements for future consideration.'}

---

### 5. Technical Considerations & Constraints

**5.1. Technology Stack**
*The proposed or existing technology stack is:*
${input.techStack || 'Not specified.'}

**5.2. Constraints & Dependencies**
*Known limitations and dependencies are:*
${input.constraints || 'None specified.'}

---

### 6. Out of Scope

*To ensure focus for the initial release, the following items are explicitly out of scope for the MVP:*
*Based on the core features, define what will NOT be included in the initial release to manage expectations.*

---

### 7. Success Criteria & Definition of Done

*Define clear criteria for when this product will be considered successfully launched and what constitutes "done" for the MVP.*

Generate a comprehensive, professional PRD that a development team would be excited to work with.`;

  try {
    const responseStream = await withRetry(async () => {
      return await genAI.models.generateContentStream({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      });
    }, 'Generate PRD');

    let fullText = '';
    let finishReason = '';
    let wasComplete = true;

    for await (const chunk of responseStream) {
      const chunkText = chunk.text ?? '';
      fullText += chunkText;

      yield { type: 'chunk', text: chunkText };

      if (chunk.candidates && chunk.candidates.length > 0) {
        const candidate = chunk.candidates[0];
        if (candidate.finishReason) {
          finishReason = candidate.finishReason;
          wasComplete = finishReason !== 'MAX_TOKENS';
        }
      }
    }

    yield { type: 'complete', fullText, wasComplete, finishReason };
  } catch (error) {
    throw error;
  }
}

/**
 * Refine a section based on feedback
 */
export async function refineSection(
  apiKey: string,
  sectionTitle: string,
  feedback: string,
  currentInputs: PRDInput
): Promise<RefineSectionResult> {
  try {
    const genAI = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-2.0-flash-exp';

    const prompt = `You are a Senior Product Manager refining a section of a PRD based on user feedback.

**Section:** ${sectionTitle}

**Current Inputs:**
${JSON.stringify(currentInputs, null, 2)}

**User Feedback:**
${feedback}

Based on the feedback, generate updated values for the relevant fields. Return a JSON object with ONLY the fields that need to be updated (not all fields). Use the exact field names from the current inputs.

Return ONLY valid JSON, no markdown formatting or code blocks.`;

    const response = await withRetry(async () => {
      return await genAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      });
    }, 'Refine section');

    const text = response.text?.trim() || '{}';
    const updatedInput = JSON.parse(text) as Partial<PRDInput>;

    return { success: true, data: { updatedInput } };
  } catch (error) {
    console.error('Error refining section:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refine section'
    };
  }
}
