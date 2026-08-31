"use node";

import { action } from "./_generated/server";

/** Diagnostic: check which env vars are available to Convex actions. */
export const checkEnv = action({
  args: {},
  handler: async () => {
    return {
      GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
      VITE_GOOGLE_API_KEY: !!process.env.VITE_GOOGLE_API_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      CONVEX_SITE_URL: !!process.env.CONVEX_SITE_URL,
      allKeys: Object.keys(process.env).filter(
        (k) =>
          k.includes("GOOGLE") ||
          k.includes("GEMINI") ||
          k.includes("RESEND") ||
          k.includes("VITE")
      ),
    };
  },
});
