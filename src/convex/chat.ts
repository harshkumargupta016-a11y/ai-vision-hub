"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
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
    try {
      if (!GEMINI_API_KEY) {
        throw new Error(
          "Gemini API key not configured. Add GOOGLE_API_KEY in your Convex dashboard → Settings → Environment Variables."
        );
      }

      const systemPrompt = `You are VayuNetra AI, an expert environmental assistant specializing in air quality monitoring, pollution analysis, and environmental protection for the Indore-Pithampur corridor in Madhya Pradesh, India.

Your name "VayuNetra" means "Eye on the Air" — you are the intelligent monitoring brain behind the VayuNetra platform.

Key knowledge areas:
- Air Quality Index (AQI) levels, pollutants (PM2.5, PM10, SO2, NO2, CO, O3)
- Industrial pollution sources in Pithampur industrial area
- Crop burning impacts in surrounding agricultural regions
- Environmental regulations and health advisories
- Satellite imagery interpretation for pollution hotspots
- Google technologies used: Gemini Vision, Gemini Nano, Vertex AI, Google Earth Engine, Google Maps Platform
- Pollution complaint verification and classification

Platform features you should know about:
- Users can submit pollution reports with photos and location data
- Your AI verification analyzes reports for pollution type, severity, and confidence
- Admin review provides human-in-the-loop verification
- Reports auto-verify after 2 hours if not reviewed
- Real-time AQI monitoring across the Indore-Pithampur corridor
- Hotspot mapping with 72-hour forecasting

Guidelines:
- Be helpful, concise, and data-driven
- When discussing AQI, always provide context about health impacts and specific recommendations
- Reference the Indore-Pithampur corridor specifically when relevant
- Keep responses informative but accessible to general public
- Use bullet points for clarity when listing multiple items
- If asked about reporting pollution, guide users to the Report page
- If asked about maps, guide users to the Hotspot Map page`;

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
        let detail = "";
        try {
          const errJson = JSON.parse(errorText);
          detail = errJson?.error?.message || errorText.substring(0, 300);
        } catch {
          detail = errorText.substring(0, 300);
        }
        throw new Error(`Gemini API error ${response.status}: ${detail}`);
      }

      const data = await response.json();

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.error("Gemini empty response:", JSON.stringify(data).substring(0, 500));
        throw new Error(
          "Gemini returned an empty response. This may indicate a content filter, safety block, or invalid request. Check your API key permissions."
        );
      }

      return text;
    } catch (err) {
      // Ensure the real error message is always returned to the client
      const message = err instanceof Error ? err.message : String(err);
      console.error("[VayuNetra Chat Error]", message);
      throw new Error(message);
    }
  },
});
