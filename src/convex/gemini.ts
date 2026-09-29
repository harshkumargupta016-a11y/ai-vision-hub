"use node";

const GEMINI_API_KEY =
  process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;

/**
 * Model fallback chain (newest first).
 * - Retired models (404) are skipped automatically.
 * - "High demand" 503 / quota 429 errors are retried once per model, then the
 *   next model is tried. Flash-lite variants are included because they stay
 *   available when the flagship flash models are overloaded.
 */
export const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

export interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

export interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function getGeminiKey(): string {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Add GOOGLE_API_KEY in the Keys tab (Convex environment)."
    );
  }
  return GEMINI_API_KEY;
}

/**
 * Call Gemini generateContent with automatic model fallback and retries.
 * Returns the response text, or throws an Error with a helpful message.
 */
export async function geminiGenerate(opts: {
  contents: GeminiContent[];
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}): Promise<string> {
  const key = getGeminiKey();

  const body: Record<string, unknown> = {
    contents: opts.contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxOutputTokens ?? 2048,
      ...(opts.responseMimeType
        ? { responseMimeType: opts.responseMimeType }
        : {}),
    },
  };
  if (opts.systemPrompt) {
    body.systemInstruction = { parts: [{ text: opts.systemPrompt }] };
  }
  const bodyStr = JSON.stringify(body);

  let lastError = "";

  for (const model of GEMINI_MODELS) {
    // Up to 2 attempts per model — 503 "high demand" spikes are usually transient
    for (let attempt = 1; attempt <= 2; attempt++) {
      let response: Response;
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyStr,
          }
        );
      } catch (fetchErr) {
        lastError = `Network error contacting Gemini: ${
          fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
        }`;
        console.error(`Gemini network error (${model}, attempt ${attempt}):`, lastError);
        await sleep(600);
        continue;
      }

      if (response.ok) {
        const data = await response.json();
        const text: string | undefined =
          data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        // Empty response (safety block or truncation) — try the next model
        lastError =
          "Gemini returned an empty response (possible content filter or overload)";
        console.error(`Gemini empty response (${model})`);
        break;
      }

      const errorText = await response.text();
      let detail = errorText.substring(0, 200);
      try {
        detail = JSON.parse(errorText)?.error?.message || detail;
      } catch {
        // keep raw text
      }
      lastError = `Gemini API error ${response.status}: ${detail}`;
      console.error(
        `Gemini API error (${model}, attempt ${attempt}):`,
        response.status,
        detail
      );

      if (response.status === 503 || response.status === 429) {
        if (attempt === 1) {
          await sleep(900);
          continue; // retry the same model once
        }
        break; // move on to the next model
      }
      if (response.status === 404) {
        break; // model retired/unavailable for this key — next model
      }
      // 401/403 (bad key) or 400 (bad request) — no point trying other models
      throw new Error(lastError);
    }
  }

  throw new Error(
    lastError ||
      "All Gemini models are busy right now (high demand). Please try again in a few seconds."
  );
}
