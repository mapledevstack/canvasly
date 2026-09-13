import { LucideShare2, LucideTrash2 } from "lucide-react"

type Props = {}

const Canvas = (props: Props) => {
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
        >
          <LucideTrash2 size={16} />
        </button>
      </div>
      Canvas name
    </div>
  )
}

export default Canvas
