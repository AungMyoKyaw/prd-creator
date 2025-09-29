import { ApiError, GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type {
  RefineSectionResponse,
  ApiResponse,
  PRDInput
} from '../../../types';

// Validation schema
const refineSectionSchema = z.object({
  sectionTitle: z.string().min(1, 'Section title is required'),
  feedback: z.string().min(1, 'Feedback is required'),
  currentInputs: z.object({
    productName: z.string(),
    targetAudience: z.string(),
    problemStatement: z.string(),
    proposedSolution: z.string(),
    coreFeatures: z.string(),
    businessGoals: z.string(),
    futureFeatures: z.string(),
    techStack: z.string(),
    constraints: z.string()
  })
});

// Map section titles to the fields they affect
const sectionFieldMapping: Record<string, (keyof PRDInput)[]> = {
  '1. Core Product Idea': [
    'productName',
    'problemStatement',
    'proposedSolution'
  ],
  '2. Audience & Market': ['targetAudience', 'businessGoals'],
  '3. Features & Scope': ['coreFeatures', 'futureFeatures'],
  '4. Technical Details (Optional)': ['techStack', 'constraints']
};

const refinementResultSchema = z.record(z.string(), z.string());

export async function POST(request: NextRequest) {
  try {
    const providedKey = request.headers.get('x-gemini-key')?.trim();
    const apiKey = providedKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing Gemini API key. Add your key in the app before refining sections.'
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = refineSectionSchema.safeParse(body);

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

    const { sectionTitle, feedback, currentInputs } = validationResult.data;

    // Get the fields that this section affects
    const fieldsToRefine = sectionFieldMapping[sectionTitle];
    if (!fieldsToRefine) {
      return NextResponse.json(
        { success: false, error: `Invalid section title: ${sectionTitle}` },
        { status: 400 }
      );
    }

    // Extract current values for the section
    const currentSectionData: Partial<PRDInput> = {};
    fieldsToRefine.forEach((key) => {
      currentSectionData[key] = currentInputs[key];
    });

    const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

    // Configure the AI model
    const genAI = new GoogleGenAI({ apiKey });
    const currentDateTime = new Date().toISOString();

    const prompt = `You are an expert product management assistant. A user wants to refine a specific section of their Product Requirements Document based on their feedback.

Current date and time (UTC): ${currentDateTime}

Current document state (for context only):
${JSON.stringify(currentInputs, null, 2)}

Section to Refine: "${sectionTitle}"
Current values in this section:
${JSON.stringify(currentSectionData, null, 2)}

User's Feedback for refinement: "${feedback}"

Your task is to update the values for the fields in the "${sectionTitle}" section based on the user's feedback. Maintain the existing tone and style while incorporating the requested changes.

Return ONLY a JSON object containing the updated key-value pairs for the fields in this section. The keys must be: ${fieldsToRefine.join(', ')}. Do not include any other text or explanations.

Example response format:
{
  "field1": "updated value",
  "field2": "updated value"
}`;

    const dynamicResponseSchema: Schema = {
      type: Type.OBJECT,
      required: fieldsToRefine,
      properties: fieldsToRefine.reduce<Record<string, Schema>>(
        (acc, field) => {
          acc[field] = { type: Type.STRING };
          return acc;
        },
        {}
      )
    };

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseSchema: dynamicResponseSchema
      }
    });

    const text = response.text ?? '';

    // Parse the JSON response
    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(text);
    } catch {
      console.error('Failed to parse AI response as JSON:', text);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate valid refinements. Please try again.'
        },
        { status: 500 }
      );
    }

    // Validate that we got the expected fields
    const parsedResult = refinementResultSchema.safeParse(parsedResponse);

    if (!parsedResult.success) {
      console.error('Structured refine response validation failed:', {
        issues: parsedResult.error.issues,
        raw: parsedResponse
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate valid refinements. Please try again.'
        },
        { status: 500 }
      );
    }

    const validatedResult: Partial<PRDInput> = {};
    for (const key of fieldsToRefine) {
      if (Object.prototype.hasOwnProperty.call(parsedResult.data, key)) {
        validatedResult[key] = parsedResult.data[key];
      } else {
        // If a field is missing, keep the original value
        validatedResult[key] = currentInputs[key];
      }
    }

    const apiResponse: ApiResponse<RefineSectionResponse> = {
      success: true,
      data: { updatedInput: validatedResult }
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('Error in refine-section API:', error);

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
              'Content was filtered by safety guidelines. Please modify your feedback and try again.'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'An unexpected error occurred while refining the section. Please try again.'
      },
      { status: 500 }
    );
  }
}
