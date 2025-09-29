import { ApiError, GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type {
  GeneratePRDResponse,
  ApiResponse,
  PRDInput
} from '../../../types';

// Validation schema
const generatePRDSchema = z.object({
  input: z.object({
    productName: z.string().min(1, 'Product name is required'),
    targetAudience: z.string().min(1, 'Target audience is required'),
    problemStatement: z.string().min(1, 'Problem statement is required'),
    proposedSolution: z.string().min(1, 'Proposed solution is required'),
    coreFeatures: z.string().min(1, 'Core features are required'),
    businessGoals: z.string().optional(),
    futureFeatures: z.string().optional(),
    techStack: z.string().optional(),
    constraints: z.string().optional()
  })
});

const generatePrompt = (inputs: PRDInput, currentDateTime: string): string => {
  return `You are an expert Senior Product Manager at a leading tech company. Your task is to write a comprehensive Product Requirements Document (PRD) based on the following information. The PRD should be well-structured, clear, professional, and detailed, suitable for a development team to start working from. Format the output in clean Markdown.

Current date and time (UTC): ${currentDateTime}

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

---

### 7. Success Criteria & Definition of Done

*Define clear criteria for when this product will be considered successfully launched and what constitutes "done" for the MVP.*

Generate a comprehensive, professional PRD that a development team would be excited to work with.`;
};

export async function POST(request: NextRequest) {
  try {
    const providedKey = request.headers.get('x-gemini-key')?.trim();
    const apiKey = providedKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing Gemini API key. Add your key in the app before generating a PRD.'
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = generatePRDSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues
            .map((issue) => issue.message)
            .join(', ')
        },
        { status: 400 }
      );
    }

    const { input: rawInput } = validationResult.data;

    // Ensure all fields are strings
    const input: PRDInput = {
      productName: rawInput.productName,
      targetAudience: rawInput.targetAudience,
      problemStatement: rawInput.problemStatement,
      proposedSolution: rawInput.proposedSolution,
      coreFeatures: rawInput.coreFeatures,
      businessGoals: rawInput.businessGoals || '',
      futureFeatures: rawInput.futureFeatures || '',
      techStack: rawInput.techStack || '',
      constraints: rawInput.constraints || ''
    };

    const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

    // Configure the AI model
    const genAI = new GoogleGenAI({ apiKey });
    const currentDateTime = new Date().toISOString();
    const prompt = generatePrompt(input, currentDateTime);

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096
      }
    });

    const prdText = response.text ?? '';

    if (!prdText || prdText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate PRD. Please try again.' },
        { status: 500 }
      );
    }

    const apiResponse: ApiResponse<GeneratePRDResponse> = {
      success: true,
      data: { prd: prdText }
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('Error in generate-prd API:', error);

    // Handle specific error types
    if (error instanceof ApiError) {
      if (error.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error:
              'The configured Gemini model is unavailable. Update GEMINI_MODEL or choose a supported model.'
          },
          { status: 500 }
        );
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Gemini could not authenticate your API key. Please verify and try again.'
          },
          { status: 500 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          {
            success: false,
            error: 'API quota exceeded. Please try again later.'
          },
          { status: 429 }
        );
      }
      if (error.message.includes('safety')) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Content was filtered by safety guidelines. Please modify your input and try again.'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'An unexpected error occurred while generating the PRD. Please try again.'
      },
      { status: 500 }
    );
  }
}
