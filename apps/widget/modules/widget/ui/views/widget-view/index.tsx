"use client"

import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen"

interface Props {
  organizationId: string
}

export const WidgetView = ({ organizationId }: Props) => {
  return (
    // TODO: Confirm if we need min-screen properties
    <main className="flex h-full min-h-screen w-full min-w-screen flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetAuthScreen />
      {/* <WidgetFooter /> */}
    </main>
  )
}
