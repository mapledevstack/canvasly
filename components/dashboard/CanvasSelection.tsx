"use client"

import { useQuery } from "convex/react"
import AddCanvas from "./AddCanvas"
import Canvas from "./Canvas"
import { api } from "@/convex/_generated/api"

type Props = {
  filter?: string
}

const CanvasSelection = ({ filter }: Props) => {
  const canvases = useQuery(api.canvases.get)

  if (canvases === undefined) {
    return <></>
  }

  return (
    <div className="flex flex-wrap gap-4 p-4">
      <AddCanvas />
      {canvases.map((canvas, index) => (
        <Canvas key={canvas._id} canvas={canvas} />
      ))}
    </div>
  )
}
export default CanvasSelection
