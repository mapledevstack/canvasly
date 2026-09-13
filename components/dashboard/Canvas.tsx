import { LucideShare2, LucideStar, LucideTrash2 } from "lucide-react"

import { Doc } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"

import { useApiMutation } from "@/hooks/useApiMutation"

import { toast } from "../ui/toast"

import { getTimeAgo } from "@/lib/utils"

type Props = {
  canvas: Doc<"canvases">
  isFavorited: boolean | undefined
}

const Canvas = ({ canvas, isFavorited }: Props) => {
  const { mutate: deleteCanvas, pending: deletePending } = useApiMutation(
    api.canvas.remove
  )

  const { mutate: toggleFav, pending: favPending } = useApiMutation(
    api.canvas.toggleFav
  )

  const handleDelete = () => {
    deleteCanvas({ id: canvas._id })
      .then(() =>
        toast.add({
          type: "success",
          description: "Successfully deleted!",
        })
      )
      .catch(() => {
        toast.add({
          type: "error",
          description: "Unable to delete Canvas",
        })
      })
  }

  const handleFav = () => {
    toggleFav({ canvasId: canvas._id }).catch(() => {
      toast.add({
        type: "error",
        description: "Unable to update favourite",
      })
    })
  }

  return (
    <div className="group relative flex aspect-4/3 flex-1 items-start justify-center overflow-hidden rounded-lg border border-gray-200 bg-white pb-1 font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        className="absolute top-2 left-2 rounded-md p-1.5 text-yellow-500 transition hover:bg-yellow-50 hover:text-yellow-500"
        aria-label="Favourite canvas"
        onClick={handleFav}
        disabled={favPending}
      >
        <LucideStar size={16} fill={isFavorited ? "currentColor" : "none"} />
      </button>

      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          aria-label="Share canvas"
        >
          <LucideShare2 size={16} />
        </button>

        <button
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-red-100 hover:text-red-500"
          aria-label="Delete canvas"
          onClick={handleDelete}
          disabled={deletePending}
        >
          <LucideTrash2 size={16} />
        </button>
      </div>

      <div className="flex h-full flex-col items-center justify-between py-3">
        <div>{canvas.name}</div>

        <div className="text-xs font-normal text-gray-400">
          Updated {getTimeAgo(canvas.updatedAt)}
        </div>
      </div>
    </div>
  )
}

export default Canvas
