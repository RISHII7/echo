import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Geist, Geist_Mono } from "next/font/google"

import { cn } from "@workspace/ui/lib/utils"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@workspace/ui/components/sonner"

import "@workspace/ui/globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Echo — AI-Powered Customer Support Platform",
    template: "%s · Echo",
  },
  description:
    "Echo is a B2B AI-powered customer support platform. Deploy an embeddable chat and voice widget, resolve conversations with an AI agent grounded in your knowledge base, and manage everything from a real-time operator dashboard.",
  applicationName: "Echo",
  keywords: [
    "AI customer support",
    "support widget",
    "AI agent",
    "voice AI",
    "knowledge base",
    "B2B SaaS",
  ],
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#3C82F6",
            },
          }}
        >
          <ThemeProvider>
            <Toaster />
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
