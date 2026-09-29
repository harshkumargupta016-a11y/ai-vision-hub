"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { geminiGenerate, type GeminiPart } from "./gemini";

export const verifyComplaint = action({
  args: {
    title: v.string(),
    description: v.string(),
    pollutionType: v.optional(v.string()),
    // Base64 data URL of the uploaded photo (e.g. "data:image/jpeg;base64,...")
    imageDataUrl: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
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

    const text = await geminiGenerate({
      contents: [{ role: "user", parts }],
      temperature: 0.3,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
    });

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
