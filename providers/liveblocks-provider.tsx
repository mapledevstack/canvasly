"use client"

import { LiveblocksProvider } from "@liveblocks/react"

type Props = {
  children: React.ReactNode
}

const LiveblocksProviderWrapper = ({ children }: Props) => {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      {children}
    </LiveblocksProvider>
  )
}

export default LiveblocksProviderWrapper
