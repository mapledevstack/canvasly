import { api } from "@/convex/_generated/api"
import { env } from "@/lib/env"
import { auth, currentUser } from "@clerk/nextjs/server"
import { Liveblocks } from "@liveblocks/node"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL)
const liveblocks = new Liveblocks({
  secret: env.LIVEBLOCKS_SECRET_KEY,
})

export const POST = async (request: Request) => {
  const { userId, getToken } = await auth()

  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const token = await getToken({ template: "convex" })

  if (!token) {
    return new Response("Unauthorized", { status: 403 })
  }

  convex.setAuth(token)

  const { room } = await request.json()

  const canvas = await convex.query(api.canvas.getCanvas, {
    id: room,
  })

  if (!canvas) {
    return new Response("Canvas not found", { status: 404 })
  }

  const user = await currentUser()
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: user?.fullName ?? user?.firstName ?? "User",
      avatar: user?.imageUrl,
    },
  })

  session.allow(room, ["*:write"])

  const { body, status } = await session.authorize()

  return new Response(body, { status })
}
