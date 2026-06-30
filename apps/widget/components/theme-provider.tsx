"use client"

import { ConvexReactClient, ConvexProvider } from "convex/react"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}

export { ThemeProvider }
