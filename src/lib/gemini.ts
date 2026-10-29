import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerationConfig } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Override with GEMINI_MODEL if Google retires a model. `gemini-2.0-flash` was
 * removed from the API, so the default is pinned to a currently supported model.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

export function getModel(generationConfig?: GenerationConfig) {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    ...(generationConfig ? { generationConfig } : {}),
  });
}

export async function generateContent(prompt: string) {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}
