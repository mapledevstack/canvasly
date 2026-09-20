import { v } from "convex/values"
import { defineSchema, defineTable } from "convex/server"

export default defineSchema({
  canvases: defineTable({
    name: v.string(),

    userId: v.string(),
    orgId: v.optional(v.string()),

    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "updatedAt"])
    .index("by_org", ["orgId", "updatedAt"]),

  userCanvasFavorites: defineTable({
    userId: v.string(),
    canvasId: v.id("canvases"),
  })
    .index("by_user", ["userId"])
    .index("by_canvas", ["canvasId"])
    .index("by_user_canvas", ["userId", "canvasId"]),

  shares: defineTable({
    elements: v.any(),
    expiresAt: v.number(),
  }),
})
