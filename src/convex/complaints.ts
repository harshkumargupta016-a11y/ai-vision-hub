import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all complaints (for browsing/searching)
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("ai_verified"),
        v.literal("admin_verified"),
        v.literal("auto_verified"),
        v.literal("rejected")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("complaints").withIndex("by_created");
    if (args.status) {
      q = ctx.db.query("complaints").withIndex("by_status", (q) =>
        q.eq("status", args.status!)
      );
    }
    return await q.order("desc").take(args.limit ?? 50);
  },
});

// Get a single complaint by ID
export const get = query({
  args: { id: v.id("complaints") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get complaints by user
export const byUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complaints")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

// Get pending complaints for admin review
export const pending = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("complaints")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(100);
  },
});

// Get AI-verified complaints awaiting admin review
export const awaitingAdmin = query({
  handler: async (ctx) => {
    const aiVerified = await ctx.db
      .query("complaints")
      .withIndex("by_status", (q) => q.eq("status", "ai_verified"))
      .order("desc")
      .take(100);
    return aiVerified;
  },
});

// Get hotspots - complaints grouped by proximity
export const hotspots = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("complaints").collect();
    return all.filter(
      (c) =>
        c.status === "ai_verified" ||
        c.status === "admin_verified" ||
        c.status === "auto_verified"
    );
  },
});

// Submit a new complaint
export const create = mutation({
  args: {
    userId: v.string(),
    userName: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    pollutionType: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    locationName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    aqi: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    return await ctx.db.insert("complaints", {
      ...args,
      status: "pending",
      createdAt: now,
      expiresAt: now + twoHours,
    });
  },
});

// Admin verify a complaint
export const adminVerify = mutation({
  args: {
    complaintId: v.string(),
    adminId: v.string(),
    adminNotes: v.optional(v.string()),
    pollutionType: v.optional(v.string()),
    status: v.union(
      v.literal("admin_verified"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.complaintId as any, {
      status: args.status,
      adminId: args.adminId,
      adminNotes: args.adminNotes,
      pollutionType: args.pollutionType,
      verifiedAt: Date.now(),
    });
  },
});

// Update AI verification result
export const setAiVerification = mutation({
  args: {
    complaintId: v.string(),
    aiVerification: v.object({
      pollutionType: v.string(),
      confidence: v.number(),
      severity: v.string(),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.complaintId as any, {
      status: "ai_verified",
      aiVerification: args.aiVerification,
      pollutionType: args.aiVerification.pollutionType,
    });
  },
});

// Auto-verify expired complaints (run periodically)
export const autoVerifyExpired = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("complaints")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    let count = 0;
    for (const complaint of expired) {
      if (complaint.expiresAt <= now) {
        await ctx.db.patch(complaint._id, {
          status: "auto_verified",
          verifiedAt: now,
        });
        count++;
      }
    }
    return { autoVerified: count };
  },
});

// Get stats for dashboard
export const stats = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("complaints").collect();
    const total = all.length;
    const pending = all.filter((c) => c.status === "pending").length;
    const verified = all.filter(
      (c) =>
        c.status === "admin_verified" ||
        c.status === "ai_verified" ||
        c.status === "auto_verified"
    ).length;
    const rejected = all.filter((c) => c.status === "rejected").length;

    return { total, pending, verified, rejected };
  },
});
