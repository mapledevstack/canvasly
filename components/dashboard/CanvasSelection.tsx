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
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      <AddCanvas />
      {canvases.map((canvas) => (
        <Canvas key={canvas._id} canvas={canvas} />
      ))}
    </div>
  )
}
export default CanvasSelection
