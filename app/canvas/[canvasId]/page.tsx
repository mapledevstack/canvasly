import CanvasRoom from "@/app/canvas/[canvasId]/_components/CanvasRoom"

type Props = {
  params: Promise<{ canvasId: string }>
}

const page = async ({ params }: Props) => {
  const { canvasId } = await params

  return <CanvasRoom canvasId={canvasId} />
}
export default page
