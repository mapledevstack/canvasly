"use client"

import { useState } from "react"
import Link from "next/link"

import { LucideCheck, LucideCopy, LucideShare2 } from "lucide-react"

import { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"

import { useApiMutation } from "@/hooks/useApiMutation"
import { getCanvasElements } from "@/lib/party"

import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { toast } from "@/components/ui/toast"

type Props = {
  canvasId: Id<"canvases">
}

const ShareCanvas = ({ canvasId }: Props) => {
  const [open, setOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { mutate: createShare, pending: sharePending } = useApiMutation(
    api.share.createShare
  )

  const handleShare = async () => {
    setOpen(true)
    setShareUrl(null)
    setCopied(false)

    try {
      const elements = await getCanvasElements(canvasId)
      const shareId = await createShare({ elements })

      setShareUrl(`${window.location.origin}/share/${shareId}`)
    } catch (error) {
      console.error("Failed to create share:", error)

      toast.add({
        type: "error",
        description: "Unable to create share link",
      })

      setOpen(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      toast.add({
        type: "error",
        description: "Unable to copy link",
      })
    }
  }

  return (
    <>
      <button
        className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Share canvas"
        onClick={(e) => {
          e.stopPropagation()
          handleShare()
        }}
        disabled={sharePending}
      >
        <LucideShare2 size={16} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-md space-y-2"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Share canvas</DialogTitle>
            <DialogDescription>
              Anyone with this link can view this canvas for one week.
            </DialogDescription>
          </DialogHeader>

          {sharePending || !shareUrl ? (
            <div className="flex min-h-24 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                Creating share link...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-1">
                <input
                  readOnly
                  value={shareUrl}
                  className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none"
                />

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <LucideCheck />
                      Copied
                    </>
                  ) : (
                    <>
                      <LucideCopy />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={() => window.open(shareUrl, "_blank")}
              >
                Open share
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ShareCanvas
