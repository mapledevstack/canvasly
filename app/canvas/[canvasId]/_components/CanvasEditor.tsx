"use client"

import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { useTheme } from "@teispace/next-themes"

type Props = {
  canvasId: string
}

const CanvasEditor = ({ canvasId }: Props) => {
  const { resolvedTheme } = useTheme()

  const theme = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <div className="h-full">
      <Excalidraw theme={theme} />
    </div>
  )
}

export default CanvasEditor
