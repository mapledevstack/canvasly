import { query } from "./_generated/server"

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Unauthorized")
    }

    const orgId =
      typeof identity.org_id === "string" ? identity.org_id : undefined

    if (orgId) {
      return await ctx.db
        .query("canvases")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect()
    }

    return await ctx.db
      .query("canvases")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect()
  },
})
