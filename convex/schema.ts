import { v } from "convex/values"
import { defineSchema, defineTable } from "convex/server"

export default defineSchema({
  canvases: defineTable({
    name: v.string(),
    orgId: v.optional(v.string()),
    userId: v.string(),
    userName: v.string(),

    elements: v.any(),

    imageUrl: v.optional(v.string()),
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"]),
})
