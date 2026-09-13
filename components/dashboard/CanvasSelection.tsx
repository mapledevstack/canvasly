import AddCanvas from "./AddCanvas"
import Canvas from "./Canvas"

type Props = {
  filter?: string
}

const CanvasSelection = ({ filter }: Props) => {
  const canvases = [1, 2, 3] as number[]

  return (
    <div className="flex flex-wrap gap-4 p-4">
      <AddCanvas />
      {canvases.map((canvas, index) => (
        <Canvas key={index} />
      ))}
    </div>
  )
}
export default CanvasSelection
