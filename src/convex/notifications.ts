import { query } from "./_generated/server";
import { v } from "convex/values";

// Look up a user's email by their Convex user ID.
// Used internally by the email notification actions.
export const getUserEmail = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // The userId from complaints matches the Convex document _id in the users table.
    // We need to cast it to an Id<"users"> to look it up.
    try {
      const doc = await ctx.db.get(args.userId as any);
      if (!doc) return null;
      // Check if this is a users table document by checking for user-specific fields
      if ("email" in doc && "role" in doc) {
        return { email: (doc as any).email ?? null, name: (doc as any).name ?? null };
      }
      return null;
    } catch {
      return null;
    }
  },
});
