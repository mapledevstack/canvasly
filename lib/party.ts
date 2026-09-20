import { CanvasSnapshotSchema } from "@/app/types"
import { env } from "./env"

export async function getCanvasElements(canvasId: string) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_PARTY_HOST}/parties/canvas-server/${canvasId}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch canvas elements")
  }

  const { elements } = CanvasSnapshotSchema.parse(await response.json())

  return elements
}
