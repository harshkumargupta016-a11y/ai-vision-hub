"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
];

export const verifyComplaint = action({
  args: {
    title: v.string(),
    description: v.string(),
    pollutionType: v.optional(v.string()),
    // Base64 data URL of the uploaded photo (e.g. "data:image/jpeg;base64,...")
    imageDataUrl: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const hasImage = !!args.imageDataUrl;

    const prompt = `You are an environmental pollution analyst for VayuNetra, an air quality monitoring platform for the Indore-Pithampur corridor in Madhya Pradesh, India.

Analyze this pollution complaint and provide verification.${hasImage ? "\n\nA photo is attached. Carefully examine it for visible signs of pollution: smoke color and density, dust clouds, burning vegetation, industrial activity. Use what you see in the image to inform your assessment." : ""}

Complaint details:

Title: ${args.title}
Description: ${args.description}
${args.pollutionType ? `Claimed pollution type: ${args.pollutionType}` : "Claimed type: not specified"}

Respond in this exact JSON format (no markdown fences, just raw JSON):
{
  "pollutionType": "one of: Crop Burning, Industrial Smoke, Vehicle Emissions, Construction Dust, Waste Burning, Other",
  "confidence": 0.0 to 1.0 (how likely this is a genuine pollution event),
  "severity": "one of: low, moderate, high, critical",
  "notes": "1-3 sentence assessment. If an image was provided, reference what is visible in it.",
  "isLikely": true or false
}`;

    // Build request parts — image first (inline_data), then the text prompt
    interface GeminiPart {
      text?: string;
      inline_data?: { mime_type: string; data: string };
    }
    const parts: GeminiPart[] = [];

    if (args.imageDataUrl) {
      const match = args.imageDataUrl.match(/^data:(.+?);base64,(.*)$/);
      if (match) {
        parts.push({
          inline_data: {
            mime_type: match[1],
            data: match[2],
          },
        });
      }
    }
    parts.push({ text: prompt });

    const body = JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
        responseMimeType: "application/json",
      },
    });

    // Try models in order — fall through on 404 (retired), 429 (quota), 503 (overloaded)
    let text: string | undefined;
    let lastError = "";

    for (const model of GEMINI_MODELS) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }
      );

      if (response.ok) {
        const data = await response.json();
        text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) break;
        lastError = "Gemini returned an empty response";
        continue;
      }

      const errorText = await response.text();
      console.error(`Gemini API error (${model}):`, response.status, errorText);
      let detail = "";
      try {
        const errJson = JSON.parse(errorText);
        detail = errJson?.error?.message || errorText.substring(0, 200);
      } catch {
        detail = errorText.substring(0, 200);
      }
      lastError = `Gemini API error ${response.status}: ${detail}`;

      if (response.status === 404 || response.status === 429 || response.status === 503) {
        continue;
      }
      throw new Error(lastError);
    }

    if (!text) throw new Error(lastError || "All Gemini models are unavailable right now.");

    try {
      const parsed = JSON.parse(text);
      return {
        pollutionType: parsed.pollutionType || args.pollutionType || "Other",
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
        severity: parsed.severity || "moderate",
        notes: parsed.notes || "",
        isLikely: parsed.isLikely !== false,
        analyzedImage: hasImage,
      };
    } catch {
      return {
        pollutionType: args.pollutionType || "Other",
        confidence: 0.5,
        severity: "moderate",
        notes: text.substring(0, 200),
        isLikely: true,
        analyzedImage: hasImage,
      };
    }
  },
});
