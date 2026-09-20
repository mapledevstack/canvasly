import {
  Server,
  routePartykitRequest,
  type Connection,
  type WSMessage,
} from "partyserver"

import {
  CanvasInitMessageSchema,
  CanvasUpdateMessageSchema,
  type Elements,
} from "../app/types"

export class CanvasServer extends Server {
  elements: Elements = []

  private storage: DurableObjectStorage

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.storage = ctx.storage
  }

  async onStart() {
    this.elements = (await this.storage.get<Elements>("elements")) ?? []
  }

  onConnect(connection: Connection) {
    console.log(`Client ${connection.id} connected to room ${this.name}`)

    const message = CanvasInitMessageSchema.parse({
      type: "canvas:init",
      elements: this.elements,
    })

    connection.send(JSON.stringify(message))
  }

  async onMessage(connection: Connection, message: WSMessage) {
    if (typeof message !== "string") {
      return
    }

    let data: unknown

    try {
      data = JSON.parse(message)
    } catch {
      return
    }

    const parsed = CanvasUpdateMessageSchema.safeParse(data)

    if (!parsed.success) {
      return
    }

    this.elements = parsed.data.elements

    await this.storage.put("elements", this.elements)

    this.broadcast(JSON.stringify(parsed.data), [connection.id])
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routePartykitRequest(request, env)) ??
      new Response("Not Found", { status: 404 })
    )
  },
}
