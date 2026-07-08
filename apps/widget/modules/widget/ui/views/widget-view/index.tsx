"use client"

import { useAtomValue } from "jotai"

import { screenAtom } from "@/modules/widget/atoms/widget-atoms"

import { WidgetChatScreen } from "@/modules/widget/ui/screens/widget-chat-screen"
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen"
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen"
import { WidgetInboxScreen } from "@/modules/widget/ui/screens/widget-inbox-screen"
import { WidgetLoadingScreen } from "@/modules/widget/ui/screens/widget-loading-screen"
import { WidgetSelectionScreen } from "@/modules/widget/ui/screens/widget-selection-screen"
import { WidgetVoiceScreen } from "@/modules/widget/ui/screens/widget-voice-screen"

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
    contact: <p>TODO: Contact</p>,
  }

  return (
    // TODO: Confirm if we need min-screen properties
    <main className="flex h-full min-h-screen w-full min-w-screen flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]}
    </main>
  )
}
