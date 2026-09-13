"use client"

import { api } from "@/convex/_generated/api"
import { useApiMutation } from "@/hooks/useApiMutation"
import { LucidePlus } from "lucide-react"
import { toast } from "../ui/toast"
import { useRouter } from "next/navigation"

const AddCanvas = () => {
  const { mutate: createCanvas, pending } = useApiMutation(api.canvas.create)

  const router = useRouter()

  const handleClick = () => {
    createCanvas({})
      .then((canvasId) => {
        toast.add({
          type: "success",
          description: "Canvas created",
        })

        router.push(`/canvas/${canvasId}`)
      })
      .catch(() => {
        toast.add({
          type: "error",
          description: "Failed to create Canvas",
        })
      })
  }

  return (
    <button
      className="flex aspect-4/3 flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-yellow-500"
      onClick={() => handleClick()}
      disabled={pending}
    >
      <LucidePlus size={28} />
      <span className="text-sm font-medium">New canvas</span>
    </button>
  )
}

export default AddCanvas
