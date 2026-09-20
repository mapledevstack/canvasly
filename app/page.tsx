"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import "@excalidraw/excalidraw/index.css"

import CTA from "./_components/CTA"

type SceneData = Awaited<
  ReturnType<typeof import("@excalidraw/excalidraw").loadFromBlob>
>

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
)

const Home = () => {
  const [initialData, setInitialData] = useState<SceneData | null>(null)

  useEffect(() => {
    const loadScene = async () => {
      const { loadFromBlob } = await import("@excalidraw/excalidraw")

      const response = await fetch("/landing.excalidraw")
      const blob = await response.blob()

      const scene = await loadFromBlob(blob, null, null)

      setInitialData(scene)
    }

    loadScene()
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 z-0 h-full w-full">
        {initialData && <Excalidraw theme="dark" initialData={initialData} />}
      </div>

      <CTA />
    </div>
  )
}

export default Home
