"use client"

import {
  useMutation,
  useQuery,
  Authenticated,
  Unauthenticated,
} from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { SignInButton, UserButton } from "@clerk/nextjs"

export default function Page() {
  const users = useQuery(api.users.getMany)
  const addUser = useMutation(api.users.add)
  return (
    <>
      <Authenticated>
        <div className="flex min-h-svh flex-col items-center justify-center">
          <p> apps/web</p>
          <UserButton />
          <Button onClick={() => addUser()}>Add</Button>
          <div className="mx-auto w-full max-w-sm">
            {JSON.stringify(users, null, 2)}
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <p>Must be signed In</p>
        <SignInButton>Sign In!</SignInButton>
      </Unauthenticated>
    </>
  )
}
