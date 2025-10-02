import { NextRequest, NextResponse } from 'next/server';
import { buildGenerationPrompt, PrdInput } from '../../../lib/prd';
import { GoogleGenAI } from '@google/genai';
import { getContextHeader } from '../_lib/datetime';

function validateInputs(value: unknown): value is PrdInput {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const input = value as Record<keyof PrdInput, unknown>;
  const fields: Array<keyof PrdInput> = [
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
  return fields.every((field) => typeof input[field] === 'string');
}

export async function POST(request: NextRequest) {
  try {
    const { inputs, apiKey, model } = (await request.json()) as {
      inputs?: unknown;
      apiKey?: string;
      model?: string;
    };

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required.' },
        { status: 400 }
      );
    }

    if (!validateInputs(inputs)) {
      return NextResponse.json(
        { error: 'Invalid PRD inputs provided.' },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });
    const basePrompt = buildGenerationPrompt(inputs);

    // Add current date/time context to the prompt
    const promptWithContext = getContextHeader() + basePrompt;

    const response = await client.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: promptWithContext
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error(
        'Gemini returned an empty response while generating the PRD.'
      );
    }

    return NextResponse.json({ data: text });
  } catch (error) {
    console.error('Error generating PRD:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while generating the PRD.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
