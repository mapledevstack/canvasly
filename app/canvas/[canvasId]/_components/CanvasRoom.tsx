"use client"

import dynamic from "next/dynamic"
import { useEffect } from "react"

import { useMutation, useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import Loading from "@/components/ui/loading"

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

  const touchCanvas = useMutation(api.canvas.touchCanvas)

  useEffect(() => {
    return () => {
      touchCanvas({
        id: canvasId as Id<"canvases">,
      })
    }
  }, [canvasId, touchCanvas])

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
