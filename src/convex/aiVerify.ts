"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const GEMINI_API_KEY = process.env.VITE_GOOGLE_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const verifyComplaint = action({
  args: {
    title: v.string(),
    description: v.string(),
    pollutionType: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const prompt = `You are an environmental pollution analyst for VayuNetra, an air quality monitoring platform for the Indore-Pithampur corridor in Madhya Pradesh, India.

Analyze this pollution complaint and provide verification:

Title: ${args.title}
Description: ${args.description}
${args.pollutionType ? `Claimed pollution type: ${args.pollutionType}` : ""}
${args.imageUrl ? `Image URL: ${args.imageUrl}` : ""}

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "pollutionType": "one of: Crop Burning, Industrial Smoke, Vehicle Emissions, Construction Dust, Waste Burning, Other",
  "confidence": 0.0 to 1.0,
  "severity": "one of: low, moderate, high, critical",
  "notes": "brief explanation of your assessment",
  "isLikely": true or false
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from Gemini");
    }

    try {
      const parsed = JSON.parse(text);
      return {
        pollutionType: parsed.pollutionType || "Other",
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
        severity: parsed.severity || "moderate",
        notes: parsed.notes || "",
        isLikely: parsed.isLikely !== false,
      };
    } catch {
      return {
        pollutionType: args.pollutionType || "Other",
        confidence: 0.5,
        severity: "moderate",
        notes: text.substring(0, 200),
        isLikely: true,
      };
    }
  },
});
