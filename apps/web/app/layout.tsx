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

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://echo-red-kappa.vercel.app"

const siteTitle = "Echo — AI-Powered Customer Support Platform"
const siteDescription =
  "Echo is a B2B AI-powered customer support platform. Deploy an embeddable chat and voice widget, resolve conversations with an AI agent grounded in your knowledge base, and manage everything from a real-time operator dashboard."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · Echo",
  },
  description: siteDescription,
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
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Echo",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
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
