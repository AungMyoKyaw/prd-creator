import { NextRequest, NextResponse } from 'next/server';
import { Type, GoogleGenAI } from '@google/genai';
import { PrdInput, SECTION_FIELD_MAPPING } from '../../../lib/prd';
import { getContextHeader } from '../_lib/datetime';

function isPrdInput(value: unknown): value is PrdInput {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const input = value as Record<keyof PrdInput, unknown>;
  const stringFields: Array<keyof PrdInput> = [
    'productName',
    'targetAudience',
    'problemStatement',
    'proposedSolution',
    'coreFeatures',
    'businessGoals',
    'futureFeatures',
    'techStack',
    'constraints'
  ];

  const arrayFields: Array<keyof PrdInput> = ['productIdeaImages'];

  const stringFieldsValid = stringFields.every(
    (field) => typeof input[field] === 'string'
  );

  const arrayFieldsValid = arrayFields.every(
    (field) => !input[field] || Array.isArray(input[field])
  );

  return stringFieldsValid && arrayFieldsValid;
}

export async function POST(request: NextRequest) {
  try {
    const { currentInputs, sectionTitle, userFeedback, apiKey, model } =
      (await request.json()) as {
        currentInputs?: unknown;
        sectionTitle?: string;
        userFeedback?: string;
        apiKey?: string;
        model?: string;
      };

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required.' },
        { status: 400 }
      );
    }

    if (!sectionTitle || !SECTION_FIELD_MAPPING[sectionTitle]) {
      return NextResponse.json(
        { error: 'Invalid section title provided.' },
        { status: 400 }
      );
    }

    if (!userFeedback || !userFeedback.trim()) {
      return NextResponse.json(
        { error: 'Feedback is required to refine a section.' },
        { status: 400 }
      );
    }

    if (!isPrdInput(currentInputs)) {
      return NextResponse.json(
        { error: 'Invalid PRD inputs provided.' },
        { status: 400 }
      );
    }

    const fieldsToRefine = SECTION_FIELD_MAPPING[sectionTitle];
    const currentSectionData: Record<string, unknown> = {};
    fieldsToRefine.forEach((key) => {
      currentSectionData[key] = currentInputs[key];
    });

    const basePrompt = `You are an expert product management assistant. A user wants to refine a specific section of their Product Requirements Document based on their feedback.

Current document state (for context only):
${JSON.stringify(currentInputs, null, 2)}

Section to Refine: "${sectionTitle}"
Current values in this section:
${JSON.stringify(currentSectionData, null, 2)}

User's Feedback for refinement: "${userFeedback}"

Your task is to update the values for the fields in the "${sectionTitle}" section based on the user's feedback. Maintain the existing tone and style. Return ONLY a JSON object containing the updated key-value pairs for the fields in this section. The keys must be: ${fieldsToRefine.join(', ')}. Do not include any other text or explanations.`;

    // Add current date/time context to the prompt
    const promptWithContext = getContextHeader() + basePrompt;

    const responseSchemaProperties: Record<string, { type: Type.STRING }> = {};
    fieldsToRefine.forEach((field) => {
      responseSchemaProperties[field] = { type: Type.STRING };
    });

    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: model || 'gemini-flash-latest',
      contents: promptWithContext,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: responseSchemaProperties
        }
      }
    });

    const jsonString = response.text?.trim();
    if (!jsonString) {
      throw new Error(
        'Gemini returned an empty response while refining the section.'
      );
    }

    const parsed = JSON.parse(jsonString);
    const validatedResult: Partial<PrdInput> = {};
    fieldsToRefine.forEach((field) => {
      if (
        Object.prototype.hasOwnProperty.call(parsed, field) &&
        typeof parsed[field] === 'string'
      ) {
        // Type assertion to satisfy TypeScript
        (validatedResult as any)[field] = parsed[field];
      }
    });

    return NextResponse.json({ data: validatedResult });
  } catch (error) {
    console.error('Error refining PRD section:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while refining the section.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
