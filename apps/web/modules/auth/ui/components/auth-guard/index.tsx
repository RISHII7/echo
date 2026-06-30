"use client"

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react"

import { SignInView } from "@/modules/auth/ui/views/sign-in-view"

import { AuthLayout } from "@/modules/auth/ui/layouts/auth-layout"

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthLoading>
        <AuthLayout>
          <p>Loading</p>
        </AuthLayout>
      </AuthLoading>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <AuthLayout>
          <SignInView />
        </AuthLayout>
      </Unauthenticated>
    </>
  )
}
