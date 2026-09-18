"use client"

import { useEffect, useRef } from "react"

import LiveblocksProviderWrapper from "@/providers/liveblocks-provider"
import { RoomProvider } from "@liveblocks/react"

import dynamic from "next/dynamic"

import "@excalidraw/excalidraw/index.css"

import { useMutation, useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import Loading from "@/components/ui/loading"
import { useTheme } from "@teispace/next-themes"

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => <Loading />,
  }
)

type Props = {
  canvasId: string
}

const CanvasRoom = ({ canvasId }: Props) => {
  const canvas = useQuery(api.canvas.getCanvas, {
    id: canvasId as Id<"canvases">,
  })

  const updateCanvasElements = useMutation(api.canvas.updateCanvasElements)

  const elementsRef = useRef(canvas?.elements)

  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        event.stopPropagation()

        if (!elementsRef.current) return

        updateCanvasElements({
          id: canvasId as Id<"canvases">,
          elements: elementsRef.current,
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [canvasId, updateCanvasElements])

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
        <div className="h-full">
          <Excalidraw
            initialData={{
              elements: canvas.elements,
              appState: {
                theme: resolvedTheme === "dark" ? "dark" : "light",
              },
            }}
            onChange={(elements) => {
              elementsRef.current = elements
            }}
          />
        </div>
      </RoomProvider>
    </LiveblocksProviderWrapper>
  )
}

export default CanvasRoom
