"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { Excalidraw, restoreElements } from "@excalidraw/excalidraw"

import "@excalidraw/excalidraw/index.css"

import { useTheme } from "@teispace/next-themes"

import usePartySocket from "partysocket/react"
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types"
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"

import Loading from "@/components/ui/loading"
import { env } from "@/lib/env"

import { CanvasMessageSchema } from "@/app/types"

type Props = {
  canvasId: string
}

const CanvasEditor = ({ canvasId }: Props) => {
  const { resolvedTheme } = useTheme()

  const [elements, setElements] = useState<
    readonly OrderedExcalidrawElement[] | null
  >(null)
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const suppressEchoUntilRef = useRef(0)
  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingElementsRef = useRef<readonly OrderedExcalidrawElement[] | null>(
    null
  )

  const theme = resolvedTheme === "dark" ? "dark" : "light"

  const applyRemoteElements = useCallback(
    (nextElements: readonly OrderedExcalidrawElement[]) => {
      if (excalidrawAPIRef.current) {
        // updateScene() triggers onChange() asynchronously, so suppress the
        // echo with a short time window instead of a microtask flag.
        suppressEchoUntilRef.current = Date.now() + 500
        excalidrawAPIRef.current.updateScene({ elements: nextElements })

        if (suppressTimeoutRef.current) {
          clearTimeout(suppressTimeoutRef.current)
        }
        suppressTimeoutRef.current = setTimeout(() => {
          suppressEchoUntilRef.current = 0
          suppressTimeoutRef.current = null
        }, 500)
      } else {
        // Editor is not ready yet; keep the newest snapshot so initialData
        // does not render stale content.
        setElements(nextElements)
      }
    },
    []
  )

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      let data: unknown

      try {
        data = JSON.parse(event.data)
      } catch {
        return
      }

      const parsed = CanvasMessageSchema.safeParse(data)

      if (!parsed.success) {
        return
      }

      const restoredElements = restoreElements(parsed.data.elements, null)

      if (parsed.data.type === "canvas:init") {
        // First snapshot for this client. If the editor is already mounted
        // (e.g. after a reconnect), apply it directly so the local scene
        // cannot stay stale.
        if (excalidrawAPIRef.current) {
          applyRemoteElements(restoredElements)
          return
        }

        setElements(restoredElements)
        return
      }

      // Remote updates from other clients.
      applyRemoteElements(restoredElements)
    },
    [applyRemoteElements]
  )

  // The socket is created here (rather than in CanvasRoom) so the
  // `canvas:init` snapshot sent by the server on connect cannot arrive
  // before this component's message listener is attached. Creating it
  // earlier (e.g. while the editor bundle is still loading) would drop
  // that first message and leave the editor stuck on <Loading />.
  const socket = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: canvasId,
    onMessage: handleMessage,
  })

  useEffect(() => {
    return () => {
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current)
      }
      if (suppressTimeoutRef.current) {
        clearTimeout(suppressTimeoutRef.current)
      }
    }
  }, [])

  const handleChange = useCallback(
    (nextElements: readonly OrderedExcalidrawElement[]) => {
      if (Date.now() < suppressEchoUntilRef.current) {
        return
      }

      // Excalidraw fires onChange on every frame while drawing; debounce
      // network + storage writes and only send the latest snapshot.
      pendingElementsRef.current = nextElements

      if (sendTimeoutRef.current) {
        return
      }

      sendTimeoutRef.current = setTimeout(() => {
        sendTimeoutRef.current = null

        const latest = pendingElementsRef.current
        pendingElementsRef.current = null

        if (!latest || socket.readyState !== socket.OPEN) {
          return
        }

        socket.send(
          JSON.stringify({
            type: "canvas:update",
            elements: latest,
          })
        )
      }, 300)
    },
    [socket]
  )

  const handleExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    excalidrawAPIRef.current = api
  }, [])

  if (elements === null) {
    return <Loading />
  }

  return (
    <div className="h-full">
      <Excalidraw
        theme={theme}
        initialData={{
          elements,
        }}
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
      />
    </div>
  )
}

export default CanvasEditor
