import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get active alerts
export const active = query({
  handler: async (ctx) => {
    const now = Date.now();
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return alerts.filter((a) => a.expiresAt > now);
  },
});

// Get all alerts (admin)
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_created")
      .order("desc")
      .take(50);
  },
});

// Create an alert (admin)
export const create = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("danger"),
      v.literal("critical")
    ),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    radius: v.optional(v.number()),
    createdBy: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("alerts", {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});

// Deactivate an alert (admin)
export const deactivate = mutation({
  args: { alertId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId as any, { active: false });
  },
});

// Delete an alert (admin)
export const remove = mutation({
  args: { alertId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.alertId as any);
  },
});
