"use client"

import { useState } from "react"

import { api } from "@/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"

type Props = {
  canvasId: string
}

const CanvasName = ({ canvasId }: Props) => {
  const canvas = useQuery(api.canvas.getCanvas, {
    id: canvasId as any,
  })

  const updateName = useMutation(api.canvas.updateCanvasName)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")

  if (!canvas) {
    return null
  }

  const handleEdit = () => {
    setName(canvas.name)
    setIsEditing(true)
  }

  const handleSave = async () => {
    const trimmedName = name.trim()

    if (!trimmedName || trimmedName === canvas.name) {
      setIsEditing(false)
      return
    }

    await updateName({
      id: canvasId as any,
      name: trimmedName,
    })

    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }

    if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  return (
    <div className="px-4 py-2 font-medium tracking-wider">
      {isEditing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="rounded-md border bg-background px-2 py-2 text-center outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={handleEdit}
          className="mb-2 cursor-text [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
        >
          {canvas.name}
        </button>
      )}
    </div>
  )
}

export default CanvasName
