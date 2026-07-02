"use client"

import { WidgetFooter } from "@/modules/widget/ui/components/widget-footer"
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"

interface Props {
  organizationId: string
}

export const WidgetView = ({ organizationId }: Props) => {
  return (
    // TODO: Confirm if we need min-screen properties
    <main className="flex h-full min-h-screen w-full min-w-screen flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1">Widget View: {organizationId}</div>
      <WidgetFooter />
    </main>
  )
}
