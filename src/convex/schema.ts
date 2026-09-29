import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Pollution complaints / reports
    complaints: defineTable({
      userId: v.string(),
      userName: v.optional(v.string()),
      title: v.string(),
      description: v.string(),
      pollutionType: v.optional(v.string()), // e.g., "Crop Burning", "Industrial Smoke", "Vehicle Emissions"
      latitude: v.number(),
      longitude: v.number(),
      locationName: v.optional(v.string()),
      imageDataUrl: v.optional(v.string()),
      aqi: v.optional(v.number()),
      status: v.union(
        v.literal("pending"),
        v.literal("ai_verified"),
        v.literal("admin_verified"),
        v.literal("auto_verified"),
        v.literal("rejected")
      ),
      aiVerification: v.optional(
        v.object({
          pollutionType: v.string(),
          confidence: v.number(),
          severity: v.string(),
          notes: v.optional(v.string()),
        })
      ),
      adminId: v.optional(v.string()),
      adminNotes: v.optional(v.string()),
      createdAt: v.number(),
      verifiedAt: v.optional(v.number()),
      expiresAt: v.number(), // auto-verify after 2 hours
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_created", ["createdAt"])
      .index("by_expires", ["expiresAt"]),

    // Alerts / warnings
    alerts: defineTable({
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
      radius: v.optional(v.number()), // in km
      active: v.boolean(),
      createdBy: v.string(),
      createdAt: v.number(),
      expiresAt: v.number(),
    })
      .index("by_active", ["active"])
      .index("by_severity", ["severity"])
      .index("by_created", ["createdAt"]),

    // Comments on complaints
    comments: defineTable({
      complaintId: v.string(),
      userId: v.string(),
      userName: v.optional(v.string()),
      content: v.string(),
      createdAt: v.number(),
    })
      .index("by_complaint", ["complaintId"])
      .index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
