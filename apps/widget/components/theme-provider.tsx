"use client"

import { Provider } from "jotai"
import { ConvexReactClient, ConvexProvider } from "convex/react"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <Provider>{children}</Provider>
    </ConvexProvider>
  )
}

export { ThemeProvider }
