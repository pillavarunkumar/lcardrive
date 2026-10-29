import type { DocType } from './document-schema';
import { getModel } from '@/lib/gemini';

export interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

export interface GenerateRequest {
  docType: DocType;
  prompt: string;
  image: { mimeType: string; base64: string };
}

/** Injectable so tests and the eval harness can run without calling Gemini. */
export type GeminiGenerator = (request: GenerateRequest) => Promise<string>;

export class TimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Gemini call timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

export const DEFAULT_TIMEOUT_MS = 25_000;
export const DEFAULT_RETRIES = 1;

export const geminiGenerator: GeminiGenerator = async ({ prompt, image }) => {
  // Force a bounded JSON response: without these limits newer Gemini models can
  // spend a long time "thinking" and exceed the route timeout.
  const model = getModel({
    responseMimeType: 'application/json',
    maxOutputTokens: 512,
    temperature: 0,
  });
  const result = await model.generateContent([
    { inlineData: { mimeType: image.mimeType, data: image.base64 } },
    { text: prompt },
  ]);
  return result.response.text();
};

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(timeoutMs)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
