"use client"

import { useConvexAuth, useQuery } from "convex/react"
import AddCanvas from "./AddCanvas"
import CanvasPreview from "./CanvasPreview"
import { api } from "@/convex/_generated/api"
import CanvasPreviewSkeleton from "./CanvasPreviewSkeleton"

type Props = {
  filter?: string
}

const CanvasSelection = ({ filter }: Props) => {
  const { isAuthenticated } = useConvexAuth()
  const allCanvases = useQuery(
    api.canvases.getAllCanvases,
    isAuthenticated ? {} : "skip"
  )

  const canvasesToDisplay =
    allCanvases === undefined
      ? undefined
      : filter === "starred"
        ? allCanvases.filter((canvas) => canvas.isFavorited)
        : allCanvases
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      <AddCanvas />
      {canvasesToDisplay === undefined
        ? Array.from({ length: 5 }, (_, index) => (
            <CanvasPreviewSkeleton key={index} />
          ))
        : canvasesToDisplay.map((canvas) => (
            <CanvasPreview
              key={canvas._id}
              canvas={canvas}
              isFavorited={canvas.isFavorited}
            />
          ))}
    </div>
  )
}

export default CanvasSelection
