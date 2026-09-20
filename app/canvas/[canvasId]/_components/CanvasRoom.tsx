"use client"

import dynamic from "next/dynamic"

import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import Loading from "@/components/ui/loading"

/*
 * Excalidraw reads DOM globals (`Element`) while being imported, so the editor
 * can only ever be loaded in the browser.
 */
const CanvasEditor = dynamic(() => import("./CanvasEditor"), {
  ssr: false,
  loading: () => <Loading />,
})

type Props = {
  canvasId: string
}

const CanvasRoom = ({ canvasId }: Props) => {
  const canvas = useQuery(api.canvas.getCanvas, {
    id: canvasId as Id<"canvases">,
  })

  if (canvas === undefined) {
    return <Loading />
  }

  if (canvas === null) {
    return (
      <div className="grid h-full place-items-center text-2xl">
        Canvas not found
      </div>
    )
  }

  return <CanvasEditor canvasId={canvasId} />
}

export default CanvasRoom
