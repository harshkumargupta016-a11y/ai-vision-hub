import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get comments for a complaint
export const forComplaint = query({
  args: { complaintId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_complaint", (q) =>
        q.eq("complaintId", args.complaintId)
      )
      .order("asc")
      .take(100);
  },
});

// Add a comment
export const add = mutation({
  args: {
    complaintId: v.string(),
    userId: v.string(),
    userName: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Delete a comment (owner or admin)
export const remove = mutation({
  args: { commentId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.commentId as any);
  },
});
