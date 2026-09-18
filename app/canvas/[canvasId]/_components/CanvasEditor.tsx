"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useMutation } from "convex/react"

import { Excalidraw } from "@excalidraw/excalidraw"

import "@excalidraw/excalidraw/index.css"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import { useTheme } from "@teispace/next-themes"

import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types"
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"

/*
 * This module imports Excalidraw's runtime, which reads DOM globals (`Element`,
 * ...) while being imported, so it may only ever be loaded in the browser —
 * always through `next/dynamic` with `ssr: false` (see CanvasRoom).
 */

type Props = {
  canvasId: string
  initialElements: OrderedExcalidrawElement[]
}

/** How long to wait after the last edit before persisting to Convex. */
const SAVE_DEBOUNCE_MS = 2000

const CanvasEditor = ({ canvasId, initialElements }: Props) => {
  const { resolvedTheme } = useTheme()

  const updateCanvasElements = useMutation(api.canvas.updateCanvasElements)

  const [, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)

  const latestElementsRef =
    useRef<readonly OrderedExcalidrawElement[]>(initialElements)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasPendingSaveRef = useRef(false)

  /*
   * Edits are persisted to Convex (debounced). Deleted elements are filtered
   * out before saving to keep the stored document small.
   */
  const flushPendingSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    if (!hasPendingSaveRef.current) {
      return
    }

    hasPendingSaveRef.current = false

    updateCanvasElements({
      id: canvasId as Id<"canvases">,
      elements: latestElementsRef.current.filter(
        (element) => !element.isDeleted
      ),
    }).catch(() => {
      // Next edit (or unmount) schedules another save.
      hasPendingSaveRef.current = true
    })
  }, [canvasId, updateCanvasElements])

  const scheduleSave = useCallback(() => {
    hasPendingSaveRef.current = true

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(flushPendingSave, SAVE_DEBOUNCE_MS)
  }, [flushPendingSave])

  const handleChange = useCallback(
    (elements: readonly OrderedExcalidrawElement[]) => {
      latestElementsRef.current = elements
      scheduleSave()
    },
    [scheduleSave]
  )

  /* Leaving the canvas (or the tab) must not lose pending edits. */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushPendingSave()
      }
    }

    window.addEventListener("pagehide", flushPendingSave)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("pagehide", flushPendingSave)
      document.removeEventListener("visibilitychange", handleVisibilityChange)

      flushPendingSave()
    }
  }, [flushPendingSave])

  /* Ctrl/Cmd + S saves right away instead of waiting for the debounce. */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        event.stopPropagation()

        flushPendingSave()
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [flushPendingSave])

  const theme = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <div className="h-full">
      <Excalidraw
        theme={theme}
        initialData={{ elements: initialElements }}
        excalidrawAPI={setExcalidrawAPI}
        onChange={handleChange}
      />
    </div>
  )
}

export default CanvasEditor
