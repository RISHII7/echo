import z from "zod"
import type { Tool } from "ai"

import { createTool } from "@convex-dev/agent"

import { internal } from "../../../_generated/api"

import { supportAgent } from "../agents/supportAgent"

export const resolveConversation: Tool = createTool({
  description: "Resolve a conversation",
  args: z.object({}),
  handler: async (ctx) => {
    if (!ctx.threadId) {
      return "Missing thread ID"
    }

    await ctx.runMutation(internal.system.conversations.resolve, {
      threadId: ctx.threadId,
    })

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: "Conversation resolved.",
      },
    })

    return "Conversation resolved"
  },
})
