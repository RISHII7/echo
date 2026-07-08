# Backend API Reference

Every Convex function in `packages/backend/convex/`, grouped by trust boundary. Kinds: **query** (read, reactive), **mutation** (transactional write), **action** (can call external services / other functions), **internal\*** (only callable from other Convex functions).

> Trust model recap ([architecture.md](architecture.md)): `public/*` are unauthenticated and self‑validate; `private/*` require a Clerk identity; `system/*` are internal‑only; `http.ts` is svix‑verified. See [data-model.md](data-model.md) for table shapes.

---

## `public/` — widget‑facing (unauthenticated, org‑scoped)

### `organizations.validate` — action

```ts
args: { organizationId: string }
returns: { valid: true } | { valid: false, reason: string }
```

Confirms the organization exists in Clerk (wrapped in try/catch so a missing org returns `{ valid: false }` instead of throwing). The widget's loading screen calls this first.

### `contactSessions.create` — mutation

```ts
args: { name, email, organizationId, metadata? }
returns: Id<"contactSessions">
```

Creates a visitor session with a 24h expiry (`SESSION_DURATION_MS`) and optional browser metadata. Called from the widget auth screen.

### `contactSessions.validate` — mutation

```ts
args: { contactSessionId: Id<"contactSessions"> }
returns: { valid: true, contactSession } | { valid: false, reason: string }
```

Checks a stored session exists and hasn't expired.

### `conversations.create` — mutation

```ts
args: { organizationId: string, contactSessionId: Id<"contactSessions"> }
returns: Id<"conversations">
```

Validates the session, **refreshes** its TTL, reads `widgetSettings` for the greeting, creates an agent thread (`supportAgent.createThread`), seeds it with the greeting via `saveMessage`, and inserts a `conversations` row (`status: "unresolved"`).

### `conversations.getOne` — query

```ts
args: { conversationId, contactSessionId }
returns: { _id, status, threadId } | throws
```

Ownership‑verified: throws `NOT_FOUND` if missing, `UNAUTHORIZED` if the conversation isn't owned by the session.

### `conversations.getMany` — query

```ts
args: {
  ;(contactSessionId, paginationOpts)
}
returns: PaginationResult<{ _id; _creationTime; status; threadId; lastMessage }>
```

The visitor's own conversation list, newest first, each enriched with its most recent message.

### `messages.create` — action

```ts
args: {
  ;(prompt, threadId, contactSessionId)
}
```

Validates the session, refreshes TTL, checks subscription. **Triggers the AI agent** (`supportAgent.generateText` with `searchTool` / `escalateConversationTool` / `resolveConversationTool`) only when the conversation is `unresolved` **and** the subscription is `active`; otherwise saves the message without an AI turn. See [ai-agent.md](ai-agent.md).

### `messages.getMany` — query

```ts
args: { threadId, paginationOpts, contactSessionId }
returns: paginated thread messages (supportAgent.listMessages)
```

Session‑validated. Backs the widget chat's `useThreadMessages`.

### `widgetSettings.getByOrganizationId` — query

```ts
args: {
  organizationId
}
returns: Doc<"widgetSettings"> | null
```

Unauthenticated read of the org's widget config (greeting, suggestions, Vapi settings). Consumed during widget bootstrap.

### `secrets.getVapiSecrets` — action

```ts
args: { organizationId }
returns: { publicApiKey: string } | null
```

Resolves the org's Vapi plugin, decrypts its AWS secret, and returns **only the public key**. Returns `null` if no plugin / secret / incomplete credentials.

---

## `private/` — dashboard (Clerk‑identity gated)

All functions begin by reading `ctx.auth.getUserIdentity()` and its `orgId`, throwing `UNAUTHORIZED` if absent.

### `conversations.getMany` — query

```ts
args: { paginationOpts, status? }
returns: PaginationResult<Doc<"conversations"> & { lastMessage, contactSession }>
```

Org‑scoped inbox. Uses `by_status_and_organization_id` when `status` is given, else `by_organization_id`; ordered newest‑first; enriched with each conversation's last message and contact session; drops any whose contact session no longer exists.

### `conversations.getOne` — query

```ts
args: {
  conversationId
}
returns: Doc<"conversations"> & { contactSession }
```

Org‑matched; attaches the contact session. Throws `NOT_FOUND` / `UNAUTHORIZED` appropriately.

### `conversations.updateStatus` — mutation

```ts
args: { conversationId, status: "unresolved" | "escalated" | "resolved" }
```

Org‑matched status change. Backs the `ConversationStatusButton`.

### `messages.create` — mutation

```ts
args: {
  ;(prompt, conversationId)
}
```

Operator reply. Rejects resolved conversations; **auto‑escalates** an `unresolved` conversation to `escalated`; saves the message as `assistant` with `agentName` from the operator's identity.

### `messages.getMany` — query

```ts
args: { threadId, paginationOpts }
returns: paginated thread messages
```

Org‑matched (via the conversation behind the thread). Backs the dashboard chat view.

### `messages.enhanceResponse` — action

```ts
args: {
  prompt
}
returns: string
```

Subscription‑gated. Runs a Gemini rewrite of an operator draft with `OPERATOR_MESSAGE_ENHANCEMENT_PROMPT`. Throws `BAD_REQUEST` "Missing subscription" if inactive.

### `contactSessions.getOneByConversationId` — query

```ts
args: {
  conversationId
}
returns: Doc<"contactSessions"> | null
```

Org‑matched; returns the contact behind a conversation. Backs the contact panel.

### `files.addFile` — action

```ts
args: { filename, mimeType, bytes, category? }
returns: { url, entryId }
```

Subscription‑gated. Stores the blob, extracts text (`extractTextContent`), and indexes it into the org's RAG namespace (`rag.add`, content‑hash dedup). See [ai-agent.md](ai-agent.md#knowledge-base-ingestion).

### `files.deleteFile` — mutation

```ts
args: {
  entryId: vEntryId
}
```

Verifies the entry's namespace + `uploadedBy` match the org, deletes the storage blob, and removes the RAG entry.

### `files.list` — query

```ts
args: { category?, paginationOpts }
returns: PaginationResult<PublicFile>
```

Maps RAG entries in the org's namespace to a `PublicFile` view model (`id, name, type, size, status, url, category`), resolving storage size and mapping RAG status → `ready | processing | error`.

### `plugins.getOne` / `plugins.remove` — query / mutation

```ts
args: {
  service: "vapi"
}
```

`getOne` returns the org's plugin row (or null); `remove` deletes it (org‑matched, `NOT_FOUND` if absent).

### `secrets.upsert` — mutation

```ts
args: { service: "vapi", value: any }
```

Org‑gated. Schedules `system/secrets.upsert` via `ctx.scheduler.runAfter(0, …)` (a mutation can't do external I/O directly). See [voice.md](voice.md).

### `vapi.getAssistants` / `vapi.getPhoneNumbers` — actions

```ts
args: {}
returns: Vapi.Assistant[] / Vapi.PhoneNumbersListResponseItem[]
```

Resolve the org's plugin, decrypt the secret, and call `@vapi-ai/server-sdk`'s `VapiClient` with the **private** key.

### `widgetSettings.getOne` / `widgetSettings.upsert` — query / mutation

```ts
// getOne → Doc<"widgetSettings"> | null
// upsert args: { greetMessage, defaultSuggestions, vapiSettings }
```

Org‑gated read/write of widget configuration. `upsert` inserts or patches the single per‑org row.

---

## `system/` — internal + AI

Callable only from other Convex functions.

### AI (`system/ai/`)

| Export                       | Type    | Description                                                                                |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `agents/supportAgent`        | `Agent` | Gemini‑backed agent instance + `SUPPORT_AGENT_PROMPT`                                      |
| `rag`                        | `RAG`   | RAG instance (`gemini-embedding-001`, 1536‑dim)                                            |
| `tools/search`               | tool    | Two‑stage RAG search + interpretation; posts a grounded answer                             |
| `tools/escalateConversation` | tool    | Patches conversation → `escalated`, posts a notice                                         |
| `tools/resolveConversation`  | tool    | Patches conversation → `resolved`, posts a notice                                          |
| `constants`                  | prompts | `SUPPORT_AGENT_PROMPT`, `SEARCH_INTERPRETER_PROMPT`, `OPERATOR_MESSAGE_ENHANCEMENT_PROMPT` |

### `contactSessions` (internal)

| Function  | Type             | Description                                                                                          |
| --------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `refresh` | internalMutation | Extends `expiresAt` by 24h when < 4h remain (`AUTO_REFRESH_THRESHOLD_MS`); throws if missing/expired |
| `getOne`  | internalQuery    | Fetch a session by ID (no expiry check)                                                              |

### `conversations` (internal)

| Function        | Type             | Description                                     |
| --------------- | ---------------- | ----------------------------------------------- |
| `escalate`      | internalMutation | Look up by `threadId`, set status `escalated`   |
| `resolve`       | internalMutation | Look up by `threadId`, set status `resolved`    |
| `getByThreadId` | internalQuery    | Resolve a conversation from an agent `threadId` |

### `subscriptions` (internal)

| Function              | Type             | Description                                |
| --------------------- | ---------------- | ------------------------------------------ |
| `upsert`              | internalMutation | Insert/patch the org's subscription status |
| `getByOrganizationId` | internalQuery    | Read the org's subscription                |

### `plugins` (internal)

| Function                        | Type             | Description                             |
| ------------------------------- | ---------------- | --------------------------------------- |
| `upsert`                        | internalMutation | Insert/patch the org+service plugin row |
| `getByOrganizationIdAndService` | internalQuery    | Look up a plugin by org + service       |

### `secrets` (internal)

| Function | Type           | Description                                                                         |
| -------- | -------------- | ----------------------------------------------------------------------------------- |
| `upsert` | internalAction | Write `{public,private}` keys to AWS Secrets Manager, then record the `plugins` row |

---

## HTTP actions (`http.ts`)

### `POST /clerk-webhook`

Verifies the `svix` signature (`CLERK_WEBHOOK_SECRET`), then on `subscription.updated` sets the org's Clerk seat limit (5 active / 1 inactive) and upserts `subscriptions`. Returns 400 on invalid signature or missing org ID. See [billing.md](billing.md).

---

## Root functions

### `users.getMany` / `users.add`

Scaffold query/mutation on the `users` table, retained from the starter. Not part of the support workflow.

### `lib/`

| Module                      | Purpose                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `lib/secrets.ts`            | AWS Secrets Manager client + `getSecretValue`, `upsertSecret` (create→put fallback), `parseSecretString` |
| `lib/extractTextContent.ts` | MIME‑routed Gemini text extraction (image / PDF / text‑HTML)                                             |
| `constants.ts`              | `SESSION_DURATION_MS` (24h)                                                                              |

---

**Next:** [Data Model](data-model.md) · [Conversation Flows](conversation-flows.md) · [Setup Guide](setup.md)
