import { LucideShare2, LucideTrash2 } from "lucide-react"
import { Doc } from "@/convex/_generated/dataModel"
import { useApiMutation } from "@/hooks/useApiMutation"
import { api } from "@/convex/_generated/api"
import { toast } from "../ui/toast"

type Props = {
  canvas: Doc<"canvases">
}

const Canvas = ({ canvas }: Props) => {
  const { mutate: deleteCanvas, pending } = useApiMutation(api.canvas.remove)

  const handleClick = () => {
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

  return (
    <div className="group relative flex aspect-4/3 h-46 w-64 items-end justify-center overflow-hidden rounded-lg border border-gray-200 bg-white pb-3 font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
          onClick={handleClick}
          disabled={pending}
        >
          <LucideTrash2 size={16} />
        </button>
      </div>
      {canvas.name}
    </div>
  )
}

export default Canvas
