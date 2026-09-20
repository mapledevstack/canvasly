import { z } from "zod"

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"

export type Elements = readonly ExcalidrawElement[]

const ElementsSchema = z.array(z.unknown()) as unknown as z.ZodType<Elements>

export const CanvasInitMessageSchema = z.object({
  type: z.literal("canvas:init"),
  elements: ElementsSchema,
})

export type CanvasInitMessage = {
  type: "canvas:init"
  elements: Elements
}

export const CanvasUpdateMessageSchema = z.object({
  type: z.literal("canvas:update"),
  elements: ElementsSchema,
})

export type CanvasUpdateMessage = {
  type: "canvas:update"
  elements: Elements
}

export const CanvasMessageSchema = z.discriminatedUnion("type", [
  CanvasInitMessageSchema,
  CanvasUpdateMessageSchema,
])

export type CanvasMessage = CanvasInitMessage | CanvasUpdateMessage
