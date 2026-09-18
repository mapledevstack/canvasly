"use client"

import { LiveblocksProvider } from "@liveblocks/react/suspense"

type Props = {
  children: React.ReactNode
}

const LiveblocksProviderWrapper = ({ children }: Props) => {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      {children}
    </LiveblocksProvider>
  )
}

export default LiveblocksProviderWrapper
