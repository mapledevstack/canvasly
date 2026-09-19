import { v } from "convex/values"

import { mutation, query } from "./_generated/server"

export const createCanvas = mutation({
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
      updatedAt: Date.now(),
    })

    return canvasId
  },
})

export const updateCanvasImage = mutation({
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
      updatedAt: Date.now(),
    })
  },
})

export const deleteCanvas = mutation({
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

export const toggleCanvasFavorite = mutation({
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

export const getCanvas = query({
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
      return null
    }

    const orgId =
      typeof identity.org_id === "string" ? identity.org_id : undefined

    // Personal canvas
    if (!canvas.orgId) {
      return canvas.userId === identity.subject ? canvas : null
    }

    // Organization canvas
    if (canvas.orgId === orgId) {
      return canvas
    }

    return null
  },
})
