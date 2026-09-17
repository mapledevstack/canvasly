import CanvasSelection from "./_components/CanvasSelection"
import Filters from "./_components/Filters"

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
