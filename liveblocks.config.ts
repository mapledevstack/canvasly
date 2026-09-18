import type { EnsureJson, LiveMap, LiveObject } from "@liveblocks/client"
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types"

type ExcalidrawElement = EnsureJson<OrderedExcalidrawElement>

declare global {
  interface Liveblocks {
    Presence: {
      pointer: {
        x: number
        y: number
        tool: "pointer" | "laser"
      } | null
      button: "up" | "down" | null
    }

    Storage: {
      elements: LiveMap<string, LiveObject<ExcalidrawElement>>
    }

    UserMeta: {
      id: string
      info: {
        name: string
        avatar?: string
      }
    }

    RoomEvent: {}
    ThreadMetadata: {}
    RoomInfo: {}
  }
}

export {}
