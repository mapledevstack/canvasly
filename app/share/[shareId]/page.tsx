"use client"

import dynamic from "next/dynamic"

import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import "@excalidraw/excalidraw/index.css"
import { use } from "react"
import Loading from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const Excalidraw = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw")
    return Excalidraw
  },
  { ssr: false }
)

type SharePageProps = {
  params: Promise<{
    shareId: string
  }>
}

export default function SharePage({ params }: SharePageProps) {
  const { shareId } = use(params)

  const share = useQuery(api.share.getShare, {
    shareId: shareId as Id<"shares">,
  })

  if (share === undefined) {
    return <Loading />
  }

  if (share === null) {
    return (
      <main className="grid h-screen place-items-center px-6">
        <div className="flex h-full max-w-md flex-col items-center gap-6 text-center">
          <div>
            <h1 className="text-2xl font-semibold">Share unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This share link may have expired or no longer exists.
            </p>
          </div>

          <Button>
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </main>
    )
  }
  return (
    <div className="h-screen w-screen">
      <Excalidraw
        initialData={{
          elements: share.elements,
        }}
        viewModeEnabled
      />
    </div>
  )
}
