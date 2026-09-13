import { cn } from "cn"
import { LucideNotebookTabs, LucideStar } from "lucide-react"
import Link from "next/link"

type FiltersProps = {
  filter?: string
}

const Filters = ({ filter }: FiltersProps) => {
  return (
    <div className="flex items-center gap-4 p-4">
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-2 rounded-md bg-gray-200 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300",
          !filter && "bg-yellow-300 hover:bg-yellow-400"
        )}
      >
        <LucideNotebookTabs size={16} />
        All
      </Link>

      <Link
        href="/dashboard?filter=starred"
        className={cn(
          "flex items-center gap-2 rounded-md bg-gray-200 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300",
          filter === "starred" && "bg-yellow-300 hover:bg-yellow-400"
        )}
      >
        <LucideStar size={16} />
        Starred
      </Link>
    </div>
  )
}

export default Filters
