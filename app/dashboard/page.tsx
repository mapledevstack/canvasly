import CanvasSelection from "@/components/dashboard/CanvasSelection"
import Filters from "@/components/dashboard/Filters"

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) => {
  const { filter } = await searchParams

  return (
    <div>
      <Filters filter={filter} />
      <CanvasSelection filter={filter} />
    </div>
  )
}

export default DashboardPage
