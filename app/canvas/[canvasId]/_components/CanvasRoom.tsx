"use client"

import { useMemo } from "react"

import dynamic from "next/dynamic"

import { useQuery } from "convex/react"
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense"
import { LiveMap, LiveObject, type EnsureJson } from "@liveblocks/client"

import LiveblocksProviderWrapper from "@/providers/liveblocks-provider"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import Loading from "@/components/ui/loading"

import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types"

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

type ExcalidrawElement = EnsureJson<OrderedExcalidrawElement>

type CanvasRoomProviderProps = {
  canvasId: string
  elements: OrderedExcalidrawElement[]
}

const CanvasRoomProvider = ({
  canvasId,
  elements,
}: CanvasRoomProviderProps) => {
  /*
   * Liveblocks only applies `initialStorage` when the room's storage is first
   * created, which is also why this intentionally only depends on the canvas
   * id: recomputing it on every Convex update (e.g. after a save) would only
   * create a storage tree that Liveblocks then ignores.
   */
  const initialStorage = useMemo(
    () => ({
      elements: new LiveMap(
        elements.map(
          (element) =>
            [
              element.id,
              new LiveObject(
                JSON.parse(JSON.stringify(element)) as ExcalidrawElement
              ),
            ] as const
        )
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvasId]
  )

  return (
    <LiveblocksProviderWrapper>
      <RoomProvider
        id={canvasId}
        initialPresence={{
          pointer: null,
          button: null,
        }}
        initialStorage={initialStorage}
      >
        <ClientSideSuspense fallback={<Loading />}>
          <CanvasEditor canvasId={canvasId} />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProviderWrapper>
  )
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

  const elements = (canvas.elements ?? []) as OrderedExcalidrawElement[]

  return <CanvasRoomProvider canvasId={canvasId} elements={elements} />
}

export default CanvasRoom
