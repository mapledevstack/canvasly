import type * as Party from "partykit/server"

import {
  CanvasInitMessageSchema,
  CanvasUpdateMessageSchema,
  type Elements,
} from "../app/types"

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  elements: Elements = []

  async onStart() {
    this.elements = (await this.room.storage.get<Elements>("elements")) ?? []
  }

  onConnect(conn: Party.Connection) {
    console.log(`Client ${conn.id} connected to room ${this.room.id}`)

    const message = CanvasInitMessageSchema.parse({
      type: "canvas:init",
      elements: this.elements,
    })

    conn.send(JSON.stringify(message))
  }

  async onMessage(
    message: string | ArrayBuffer | ArrayBufferView,
    sender: Party.Connection
  ) {
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

    await this.room.storage.put("elements", this.elements)

    this.room.broadcast(JSON.stringify(parsed.data), [sender.id])
  }
}
