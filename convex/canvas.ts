import { v } from "convex/values"
import { mutation } from "./_generated/server"

export const create = mutation({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthorized")
    }

    const orgId =
      typeof identity.org_id === "string" ? identity.org_id : undefined

    const canvasId = await ctx.db.insert("canvases", {
      name: "Untitled",
      orgId,
      userId: identity.subject,
      userName: identity.name ?? "Unknown",
      elements: [],
      updatedAt: Date.now(),
    })

    return canvasId
  },
})

export const updateElements = mutation({
  args: {
    id: v.id("canvases"),
    elements: v.any(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthorized")
    }

    const canvas = await ctx.db.get(args.id)

    if (!canvas) {
      throw new Error("Canvas not found")
    }

    await ctx.db.patch(args.id, {
      elements: args.elements,
    })
  },
})

export const updateImageUrl = mutation({
  args: {
    id: v.id("canvases"),
    imageUrl: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthorized")
    }

    const canvas = await ctx.db.get(args.id)

    if (!canvas) {
      throw new Error("Canvas not found")
    }

    await ctx.db.patch(args.id, {
      imageUrl: args.imageUrl,
    })
  },
})

export const remove = mutation({
  args: {
    id: v.id("canvases"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthorized")
    }

    const canvas = await ctx.db.get(args.id)

    if (!canvas) {
      throw new Error("Canvas not found")
    }

    await ctx.db.delete(args.id)
  },
})

export const toggleFav = mutation({
  args: {
    canvasId: v.id("canvases"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthorized")
    }

    const existing = await ctx.db
      .query("userCanvasFavorites")
      .withIndex("by_user_canvas", (q) =>
        q.eq("userId", identity.subject).eq("canvasId", args.canvasId)
      )
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
      return
    }

    await ctx.db.insert("userCanvasFavorites", {
      userId: identity.subject,
      canvasId: args.canvasId,
    })
  },
})
