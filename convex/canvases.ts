import { query } from "./_generated/server"

export const getAllCanvases = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthorized")
    }

    const orgId =
      typeof identity.org_id === "string" ? identity.org_id : undefined

    const favorites = await ctx.db
      .query("userCanvasFavorites")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect()

    const favoriteIds = new Set(favorites.map((favorite) => favorite.canvasId))

    const canvases = orgId
      ? await ctx.db
          .query("canvases")
          .withIndex("by_org", (q) => q.eq("orgId", orgId))
          .order("desc")
          .collect()
      : await ctx.db
          .query("canvases")
          .withIndex("by_user", (q) => q.eq("userId", identity.subject))
          .order("desc")
          .collect()

    return canvases.map((canvas) => ({
      ...canvas,
      isFavorited: favoriteIds.has(canvas._id),
    }))
  },
})
