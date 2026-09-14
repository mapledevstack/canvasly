import { api } from "@/convex/_generated/api"
import { auth } from "@clerk/nextjs/server"
import { Liveblocks } from "@liveblocks/node"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
})

export const POST = async (request: Request) => {
  const { userId, getToken } = await auth()

  if (!userId) {
    return new Response("Unauthorized", { status: 403 })
  }

  const token = await getToken({ template: "convex" })

  if (!token) {
    return new Response("Unauthorized", { status: 403 })
  }

  convex.setAuth(token)

  const { room } = await request.json()

  const canvas = await convex.query(api.canvas.getById, {
    id: room,
  })

  if (!canvas) {
    return new Response("Canvas not found", { status: 404 })
  }

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: "User",
    },
  })

  session.allow(room, ["*:write"])

  const { body, status } = await session.authorize()

  return new Response(body, { status })
}
