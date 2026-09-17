"use client"

import { useQuery } from "convex/react"
import AddCanvas from "./AddCanvas"
import CanvasPreview from "./CanvasPreview"
import { api } from "@/convex/_generated/api"
import CanvasPreviewSkeleton from "./CanvasPreviewSkeleton"

type Props = {
  filter?: string
}

const CanvasSelection = ({ filter }: Props) => {
  const canvases = useQuery(api.canvases.get)
  const favorites = useQuery(api.canvases.getFavorites)

  const isLoading = canvases === undefined || favorites === undefined

  const filteredCanvases =
    filter === "starred"
      ? canvases?.filter((canvas) =>
          favorites?.some((fav) => fav.canvasId === canvas._id)
        )
      : canvases

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      <AddCanvas />
      {isLoading
        ? Array.from({ length: 5 }, (_, index) => (
            <CanvasPreviewSkeleton key={index} />
          ))
        : filteredCanvases?.map((canvas) => (
            <CanvasPreview
              key={canvas._id}
              canvas={canvas}
              isFavorited={favorites?.some(
                (fav) => fav.canvasId === canvas._id
              )}
            />
          ))}
    </div>
  )
}
export default CanvasSelection
