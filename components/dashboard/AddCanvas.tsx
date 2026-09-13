import { LucidePlus } from "lucide-react"

type Props = {}

const AddCanvas = (props: Props) => {
  return (
    <button className="flex aspect-4/3 h-46 w-64 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-yellow-500">
      <LucidePlus size={28} />
      <span className="text-sm font-medium">New canvas</span>
    </button>
  )
}

export default AddCanvas
