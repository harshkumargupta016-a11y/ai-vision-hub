"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const GEMINI_API_KEY = process.env.VITE_GOOGLE_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("model")),
        content: v.string(),
      })
    ),
  },
  handler: async (_ctx, args) => {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured. Please add VITE_GOOGLE_API_KEY to your environment.");
    }

    const systemPrompt = `You are AirSentinel AI, an expert environmental assistant specializing in air quality monitoring, pollution analysis, and environmental protection for the Indore-Pithampur corridor in Madhya Pradesh, India.

Key knowledge areas:
- Air Quality Index (AQI) levels, pollutants (PM2.5, PM10, SO2, NO2, CO, O3)
- Industrial pollution sources in Pithampur industrial area
- Crop burning impacts in surrounding agricultural regions
- Environmental regulations and health advisories
- Satellite imagery interpretation for pollution hotspots
- Google technologies used: Gemini Vision, Gemini Nano, Vertex AI, Google Earth Engine, Google Maps Platform

Guidelines:
- Be helpful, concise, and data-driven
- When discussing AQI, always provide context about health impacts
- Reference the Indore-Pithampur corridor specifically when relevant
- Keep responses informative but accessible to general public
- Use bullet points for clarity when listing multiple items`;

    const geminiMessages: GeminiMessage[] = args.messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No response generated from Gemini");
    }

    return text;
  },
});
