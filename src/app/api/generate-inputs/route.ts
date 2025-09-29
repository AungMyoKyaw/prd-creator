import { ApiError, GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { GenerateInputsResponse, ApiResponse } from '../../../types';

// Validation schema
const generateInputsSchema = z.object({
  idea: z
    .string()
    .min(10, 'Product idea must be at least 10 characters long')
    .max(1000, 'Product idea must be less than 1000 characters')
});

const structuredResponseSchema = z.object({
  productName: z.string().min(1),
  targetAudience: z.string().min(1),
  problemStatement: z.string().min(1),
  proposedSolution: z.string().min(1),
  coreFeatures: z.array(z.string()).min(1),
  businessGoals: z.array(z.string()).min(1),
  futureFeatures: z.array(z.string()).optional(),
  techStack: z
    .array(
      z.object({
        category: z.string().min(1),
        technologies: z.array(z.string()).min(1)
      })
    )
    .min(1)
    .optional(),
  constraints: z.array(z.string()).optional()
});

type StructuredResponse = z.infer<typeof structuredResponseSchema>;

export async function POST(request: NextRequest) {
  try {
    const providedKey = request.headers.get('x-gemini-key')?.trim();
    const apiKey = providedKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing Gemini API key. Add your key in the app before generating suggestions.'
        },
        { status: 400 }
      );
    }

    const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

    const genAI = new GoogleGenAI({ apiKey });

    // Parse and validate request body
    const body = await request.json();
    const validationResult = generateInputsSchema.safeParse(body);

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

    const { idea } = validationResult.data;
    const currentDateTime = new Date().toISOString();

    // Configure the AI model
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: `You are a brilliant product strategist. A user has provided a high-level product idea: "${idea}".

Current date and time (UTC): ${currentDateTime}

Break the idea down into foundational Product Requirements Document components. Populate every field in the provided schema with concise, information-rich text. When filling list-based fields, prefer short bullet phrases.

Keep the tone professional and actionable.`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: [
            'productName',
            'targetAudience',
            'problemStatement',
            'proposedSolution',
            'coreFeatures',
            'businessGoals'
          ],
          properties: {
            productName: {
              type: Type.STRING,
              description: 'A creative and fitting product name.'
            },
            targetAudience: {
              type: Type.STRING,
              description: 'Primary user demographic or personas.'
            },
            problemStatement: {
              type: Type.STRING,
              description: 'The core problem the product solves.'
            },
            proposedSolution: {
              type: Type.STRING,
              description: 'How the product addresses the problem.'
            },
            coreFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Essential MVP capabilities.'
            },
            businessGoals: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key business outcomes and metrics.'
            },
            futureFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Potential enhancements for later phases.'
            },
            techStack: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['category', 'technologies'],
                properties: {
                  category: {
                    type: Type.STRING,
                    description: 'Grouping label for related technologies.'
                  },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Specific tools, frameworks, or services.'
                  }
                }
              },
              description: 'Recommended technologies grouped by category.'
            },
            constraints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Risks, dependencies, or considerations.'
            }
          }
        }
      }
    });

    const rawText = response.text ?? '';

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error('Failed to parse AI response as JSON:', rawText);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate valid PRD inputs. Please try again.'
        },
        { status: 500 }
      );
    }

    const structuredResult = structuredResponseSchema.safeParse(parsed);

    if (!structuredResult.success) {
      console.error('Structured response validation failed:', {
        issues: structuredResult.error.issues,
        raw: parsed
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Incomplete response from AI. Please try again.'
        },
        { status: 500 }
      );
    }

    const structured = structuredResult.data;

    const toBulletList = (value?: string[] | string): string => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return '';
      }

      if (Array.isArray(value)) {
        return value.map((item) => `- ${item.trim()}`).join('\n');
      }

      return value;
    };

    const formatTechStack = (
      value?: StructuredResponse['techStack']
    ): string => {
      if (!value || value.length === 0) {
        return '';
      }

      return value
        .map(({ category, technologies }) => {
          const trimmedCategory = category.trim();
          const techList = technologies.map((item) => item.trim()).join(', ');
          if (!trimmedCategory) {
            return `- ${techList}`;
          }
          return `- ${trimmedCategory}: ${techList}`;
        })
        .join('\n');
    };

    const prdInput = {
      productName: structured.productName,
      targetAudience: structured.targetAudience,
      problemStatement: structured.problemStatement,
      proposedSolution: structured.proposedSolution,
      coreFeatures: toBulletList(structured.coreFeatures),
      businessGoals: toBulletList(structured.businessGoals),
      futureFeatures: toBulletList(structured.futureFeatures ?? []),
      techStack: formatTechStack(structured.techStack),
      constraints: toBulletList(structured.constraints ?? [])
    };

    const apiResponse: ApiResponse<GenerateInputsResponse> = {
      success: true,
      data: { input: prdInput }
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('Error in generate-inputs API:', error);

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
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}
