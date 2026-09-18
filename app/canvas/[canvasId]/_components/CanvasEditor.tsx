"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useMutation } from "convex/react"

import "@excalidraw/excalidraw/index.css"

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
  elements: any
}

const CanvasEditor = ({ canvasId, elements }: Props) => {
  const updateCanvasElements = useMutation(api.canvas.updateCanvasElements)

  const elementsRef = useRef(elements)

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

  return (
    <div className="h-full">
      <Excalidraw
        initialData={{
          elements,
          appState: {
            theme: resolvedTheme === "dark" ? "dark" : "light",
          },
        }}
        onChange={(elements) => {
          elementsRef.current = elements
        }}
      />
    </div>
  )
}

export default CanvasEditor
