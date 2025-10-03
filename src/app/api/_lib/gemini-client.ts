import { GoogleGenAI } from '@google/genai';

const API_KEY_ENV_VARS = ['GEMINI_API_KEY', 'GOOGLE_GEMINI_API_KEY', 'API_KEY'];

export const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';

export function getGeminiClient(): GoogleGenAI {
  const apiKey = API_KEY_ENV_VARS.map((key) => process.env[key]).find((value) =>
    Boolean(value)
  );

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable not set.');
  }

  return new GoogleGenAI({ apiKey });
}
