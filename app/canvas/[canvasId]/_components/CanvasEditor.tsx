"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  useMutation as useLiveblocksMutation,
  useOthers,
  useStorage,
  useUpdateMyPresence,
} from "@liveblocks/react/suspense"

import { LiveMap, LiveObject, type EnsureJson } from "@liveblocks/client"

import { useMutation } from "convex/react"

import {
  CaptureUpdateAction,
  Excalidraw,
  reconcileElements,
} from "@excalidraw/excalidraw"

import "@excalidraw/excalidraw/index.css"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import { useTheme } from "@teispace/next-themes"

import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types"
import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile"
import type {
  Collaborator,
  ExcalidrawImperativeAPI,
  SocketId,
} from "@excalidraw/excalidraw/types"

/*
 * This module imports Excalidraw's runtime, which reads DOM globals (`Element`,
 * ...) while being imported, so it may only ever be loaded in the browser —
 * always through `next/dynamic` with `ssr: false` (see CanvasRoom).
 */

type Props = {
  canvasId: string
}

type ExcalidrawElement = EnsureJson<OrderedExcalidrawElement>

type PointerPayload = {
  pointer: { x: number; y: number; tool: "pointer" | "laser" }
  button: "up" | "down"
}

/** How long to wait after the last edit before persisting to Convex. */
const SAVE_DEBOUNCE_MS = 2000

const COLLABORATOR_COLORS = [
  { background: "#fd7f6f", stroke: "#d63031" },
  { background: "#7eb0d5", stroke: "#0984e3" },
  { background: "#b2e061", stroke: "#00b894" },
  { background: "#bd7ebe", stroke: "#6c5ce7" },
  { background: "#ffb55a", stroke: "#e17055" },
  { background: "#ffee65", stroke: "#fdcb6e" },
  { background: "#beb9db", stroke: "#a29bfe" },
  { background: "#fdcce5", stroke: "#e84393" },
  { background: "#8bd3c7", stroke: "#00cec9" },
] as const

const getCollaboratorColor = (connectionId: number) =>
  COLLABORATOR_COLORS[connectionId % COLLABORATOR_COLORS.length]

/*
 * Liveblocks hands out deeply frozen values while Excalidraw mutates every
 * element it is given (versions, fractional indices, ...). Each element that
 * crosses that boundary is deep-cloned so neither library can corrupt the
 * other's data.
 */
const cloneElement = (element: unknown) =>
  JSON.parse(JSON.stringify(element)) as OrderedExcalidrawElement

type SharedElementMap = LiveMap<string, LiveObject<ExcalidrawElement>>

/*
 * Liveblocks storage is persisted per room, and earlier versions of this editor
 * stored the scene in other shapes — a `LiveList` of elements, for instance.
 * Reading is therefore done through a helper that accepts the live collections
 * (mutable, inside a mutation) and their immutable counterparts (from
 * `useStorage`) alike.
 */
const readSharedElementValues = (sharedElements: unknown): unknown[] => {
  if (!sharedElements || typeof sharedElements !== "object") {
    return []
  }

  const collection = sharedElements as {
    values?: () => Iterable<unknown>
    keys?: () => Iterable<string>
    get?: (key: string) => unknown
    [Symbol.iterator]?: () => Iterator<unknown>
  }

  // `LiveMap` / `Map` / array
  if (typeof collection.values === "function") {
    return Array.from(collection.values())
  }

  // `LiveList` and any other live collection
  if (typeof collection[Symbol.iterator] === "function") {
    return Array.from(sharedElements as Iterable<unknown>)
  }

  // `LiveObject`
  const { keys, get } = collection

  if (typeof keys === "function" && typeof get === "function") {
    return Array.from(keys(), (key) => get(key))
  }

  return Object.values(sharedElements)
}

/** The room's elements, whatever shape the room happens to hold them in. */
const toExcalidrawElements = (sharedElements: unknown) =>
  readSharedElementValues(sharedElements)
    .map(cloneElement)
    .filter((element) => typeof element?.id === "string")

/** A `LiveMap` holding whatever elements the room already had. */
const toSharedElementMap = (sharedElements: unknown): SharedElementMap => {
  const entries: [string, LiveObject<ExcalidrawElement>][] = []

  for (const element of toExcalidrawElements(sharedElements)) {
    entries.push([
      element.id,
      new LiveObject(JSON.parse(JSON.stringify(element)) as ExcalidrawElement),
    ])
  }

  return new LiveMap(entries)
}

/** Excalidraw identifies an element revision by version + version nonce. */
const revision = (element: OrderedExcalidrawElement) =>
  `${element.version}:${element.versionNonce}`

/** Whether a local element should replace the revision already in the room. */
const isLocalRevisionNewer = (
  element: OrderedExcalidrawElement,
  sharedVersion: number,
  sharedVersionNonce: number
) =>
  element.version > sharedVersion ||
  (element.version === sharedVersion &&
    element.versionNonce < sharedVersionNonce)

/** True when the room holds an element we haven't seen, or a newer revision. */
const hasRemoteChanges = (
  localElements: readonly OrderedExcalidrawElement[],
  remoteElements: readonly OrderedExcalidrawElement[]
) => {
  const localRevisions = new Map(
    localElements.map((element) => [element.id, revision(element)])
  )

  return remoteElements.some(
    (element) => localRevisions.get(element.id) !== revision(element)
  )
}
const CanvasEditor = ({ canvasId }: Props) => {
  const { resolvedTheme } = useTheme()

  const updateCanvasElements = useMutation(api.canvas.updateCanvasElements)
  const updateMyPresence = useUpdateMyPresence()

  const others = useOthers()
  const sharedElements = useStorage((root) => root.elements)

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null)

  /*
   * `initialData` is only read once, while Excalidraw boots, so the elements
   * handed to it are captured at mount and must never change identity.
   */
  const [initialElements] = useState(() => toExcalidrawElements(sharedElements))

  const latestElementsRef =
    useRef<readonly OrderedExcalidrawElement[]>(initialElements)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasPendingSaveRef = useRef(false)

  /*
   * Excalidraw → Liveblocks storage.
   *
   * Deleted elements are never removed from the room: Excalidraw tombstones
   * them (`isDeleted` plus a bumped version), so deletions still propagate
   * while an element another client just created can never be dropped before
   * this client has seen it.
   */
  const updateSharedElements = useLiveblocksMutation(
    ({ storage }, elements: readonly OrderedExcalidrawElement[]) => {
      const stored = storage.get("elements")

      /*
       * Rooms written before the scene moved into a `LiveMap` still hold a
       * `LiveList` (storage is persisted per room, and `initialStorage` is
       * ignored for keys that already exist on the server), so those rooms are
       * migrated in place, once, keeping every element they contain.
       */
      let sharedElements = stored instanceof LiveMap ? stored : null

      if (!sharedElements) {
        const migrated = toSharedElementMap(stored)

        try {
          storage.set("elements", migrated)
        } catch {
          // Read-only access: the room cannot be migrated or written to.
          return
        }

        sharedElements = migrated
      }

      for (const element of elements) {
        const sharedElement = sharedElements.get(element.id)

        if (sharedElement) {
          const sharedVersion = sharedElement.get("version")
          const sharedVersionNonce = sharedElement.get("versionNonce")

          if (
            sharedVersion === element.version &&
            sharedVersionNonce === element.versionNonce
          ) {
            continue
          }

          /*
           * The room already holds a newer revision of this element — keep it
           * and let reconciliation pull it into the local scene instead of
           * reverting someone else's edit.
           */
          if (
            !isLocalRevisionNewer(element, sharedVersion, sharedVersionNonce)
          ) {
            continue
          }
        }

        sharedElements.set(
          element.id,
          new LiveObject(
            JSON.parse(JSON.stringify(element)) as ExcalidrawElement
          )
        )
      }
    },
    []
  )

  /*
   * Liveblocks storage → Excalidraw scene.
   *
   * `updateScene` replaces the whole scene, so the room and the local scene are
   * merged using Excalidraw's own conflict resolution (`reconcileElements`).
   * Elements this client created but the room hasn't received yet are kept, and
   * `CaptureUpdateAction.NEVER` keeps remote updates out of the local undo
   * history.
   */
  useEffect(() => {
    if (!excalidrawAPI) {
      return
    }

    const remoteElements = toExcalidrawElements(sharedElements)
    const localElements = excalidrawAPI.getSceneElementsIncludingDeleted()

    if (!hasRemoteChanges(localElements, remoteElements)) {
      return
    }

    excalidrawAPI.updateScene({
      elements: reconcileElements(
        localElements,
        remoteElements as RemoteExcalidrawElement[],
        excalidrawAPI.getAppState()
      ),
      captureUpdate: CaptureUpdateAction.NEVER,
    })
  }, [excalidrawAPI, sharedElements])

  /* Liveblocks presence → Excalidraw collaborators (live cursors). */
  useEffect(() => {
    if (!excalidrawAPI) {
      return
    }

    const collaborators = new Map<SocketId, Collaborator>()

    for (const { connectionId, info, presence } of others) {
      if (!presence.pointer) {
        continue
      }

      collaborators.set(String(connectionId) as SocketId, {
        pointer: {
          ...presence.pointer,
          renderCursor: true,
        },
        button: presence.button ?? undefined,
        username: info?.name ?? "Guest",
        avatarUrl: info?.avatar,
        color: getCollaboratorColor(connectionId),
      })
    }

    excalidrawAPI.updateScene({
      collaborators,
    })
  }, [excalidrawAPI, others])

  /*
   * Liveblocks storage is ephemeral, so edits are also persisted to Convex.
   * Tombstones only matter for live reconciliation — keeping them out of the
   * stored scene keeps the document small.
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
      /*
       * The scene is still safe in Liveblocks, and the next edit (or unmount)
       * schedules another save.
       */
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

      updateSharedElements(elements)
      scheduleSave()
    },
    [scheduleSave, updateSharedElements]
  )

  const handlePointerUpdate = useCallback(
    ({ pointer, button }: PointerPayload) => {
      updateMyPresence({
        pointer: {
          x: pointer.x,
          y: pointer.y,
          tool: pointer.tool,
        },
        button,
      })
    },
    [updateMyPresence]
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

  const initialData = useMemo(
    () => ({ elements: initialElements }),
    [initialElements]
  )

  return (
    <div
      className="h-full"
      onPointerLeave={() => updateMyPresence({ pointer: null, button: null })}
    >
      <Excalidraw
        theme={theme}
        initialData={initialData}
        excalidrawAPI={setExcalidrawAPI}
        isCollaborating
        onChange={handleChange}
        onPointerUpdate={handlePointerUpdate}
      />
    </div>
  )
}

export default CanvasEditor
