import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { oneWeekFromNow } from "../lib/utils"

export const getShare = query({
  args: {
    shareId: v.id("shares"),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db.get(args.shareId)

    if (!share || share.expiresAt < Date.now()) {
      return null
    }

    return share
  },
})

export const createShare = mutation({
  args: {
    elements: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("shares", {
      elements: args.elements,
      expiresAt: oneWeekFromNow(),
    })
  },
})
