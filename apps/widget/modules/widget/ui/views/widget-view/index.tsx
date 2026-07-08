"use client"

import { useAtomValue } from "jotai"

import { screenAtom } from "@/modules/widget/atoms/widget-atoms"

import { WidgetChatScreen } from "@/modules/widget/ui/screens/widget-chat-screen"
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen"
import { WidgetVoiceScreen } from "@/modules/widget/ui/screens/widget-voice-screen"
import { WidgetInboxScreen } from "@/modules/widget/ui/screens/widget-inbox-screen"
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen"
import { WidgetLoadingScreen } from "@/modules/widget/ui/screens/widget-loading-screen"
import { WidgetContactScreen } from "@/modules/widget/ui/screens/widget-contact-screen"
import { WidgetSelectionScreen } from "@/modules/widget/ui/screens/widget-selection-screen"

interface Props {
  organizationId: string
}

export const WidgetView = ({ organizationId }: Props) => {
  const screen = useAtomValue(screenAtom)

  const screenComponents = {
    error: <WidgetErrorScreen />,
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    auth: <WidgetAuthScreen />,
    voice: <WidgetVoiceScreen />,
    inbox: <WidgetInboxScreen />,
    selection: <WidgetSelectionScreen />,
    chat: <WidgetChatScreen />,
    contact: <WidgetContactScreen />,
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]}
    </main>
  )
}
