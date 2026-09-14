"use client"

import LiveblocksProviderWrapper from "@/providers/liveblocks-provider"
import { RoomProvider } from "@liveblocks/react"

type Props = {
  canvasId: string
}

const CanvasRoom = ({ canvasId }: Props) => {
  return (
    <LiveblocksProviderWrapper>
      <RoomProvider id={canvasId}>{canvasId}</RoomProvider>
    </LiveblocksProviderWrapper>
  )
}

export default CanvasRoom
