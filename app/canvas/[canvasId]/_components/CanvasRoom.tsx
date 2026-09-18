"use client"

import { useQuery } from "convex/react"
import { RoomProvider } from "@liveblocks/react"

import LiveblocksProviderWrapper from "@/providers/liveblocks-provider"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import Loading from "@/components/ui/loading"

import CanvasEditor from "./CanvasEditor"

type Props = {
  canvasId: string
}

const CanvasRoom = ({ canvasId }: Props) => {
  const canvas = useQuery(api.canvas.getCanvas, {
    id: canvasId as Id<"canvases">,
  })

  if (canvas === undefined) {
    return <Loading />
  }

  if (canvas === null) {
    return (
      <div className="grid h-full place-items-center text-2xl">
        Canvas not found
      </div>
    )
  }

  return (
    <LiveblocksProviderWrapper>
      <RoomProvider id={canvasId}>
        <CanvasEditor canvasId={canvasId} elements={canvas.elements} />
      </RoomProvider>
    </LiveblocksProviderWrapper>
  )
}

export default CanvasRoom
