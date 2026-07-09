import { NextResponse } from "next/server"
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Social-share preview assets must be crawlable without authentication.
  "/opengraph-image(.*)",
  "/twitter-image(.*)",
])

const isOrgFreeRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/org-selection(.*)",
  "/opengraph-image(.*)",
  "/twitter-image(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth()
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
  if (userId && !orgId && !isOrgFreeRoute(req)) {
    const searchParams = new URLSearchParams({ redirectUrl: req.url })

    const orgSelection = new URL(
      `/org-selection?${searchParams.toString()}`,
      req.url
    )

    return NextResponse.redirect(orgSelection)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
