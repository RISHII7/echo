"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { useAtomValue, useSetAtom } from "jotai"
import { ChevronRightIcon, MessageSquareTextIcon } from "lucide-react"

import { api } from "@workspace/backend/_generated/api"

import { Button } from "@workspace/ui/components/button"

import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import { WidgetFooter } from "@/modules/widget/ui/components/widget-footer"
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  errorMessageAtom,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms"

export const WidgetSelectionScreen = () => {
  const setScreen = useSetAtom(screenAtom)
  const setErrorMessage = useSetAtom(errorMessageAtom)
  const organizationId = useAtomValue(organizationIdAtom)
  const setConversationId = useSetAtom(conversationIdAtom)
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  )

  const createConversation = useMutation(api.public.conversations.create)
  const [isPending, setIsPending] = useState(false)

  const handleNewConversation = async () => {
    if (!organizationId) {
      setScreen("error")
      setErrorMessage("Missing Organization ID")
      return
    }

    if (!contactSessionId) {
      setScreen("auth")
      return
    }

    setIsPending(true)
    try {
      const conversationId = await createConversation({
        contactSessionId,
        organizationId,
      })

      setConversationId(conversationId)
      setScreen("chat")
    } catch {
      setScreen("auth")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">How can I help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-4 overflow-y-auto p-4">
        <Button
          className="h-16 w-full justify-between"
          variant="outline"
          onClick={handleNewConversation}
          disabled={isPending}
        >
          <div className="flex items-center gap-x-2">
            <MessageSquareTextIcon className="size-4" />
            <span>Start chat</span>
          </div>
          <ChevronRightIcon />
        </Button>
      </div>
      <WidgetFooter />
    </>
  )
}
