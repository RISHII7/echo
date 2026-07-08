# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

> Changes staged for the next release.

---

## [1.0.0] - 2026-07-09

### Overview

**Echo 1.0 — the first general-availability release.** This is the platform
coming together end to end: a multi-tenant, AI-powered customer support product
that companies embed on their website with a single `<script>` tag.

Since v0.6.0 (the dashboard shell), Echo gained everything that makes it a
product: an embeddable **chat and voice widget**, an **AI support agent**
grounded in a per-organization **knowledge base** (RAG), a real-time **operator
dashboard** with human takeover and AI-assisted replies, **Vapi voice** calling
with encrypted credential storage, **Clerk-powered billing** with plan gating
and a signed subscription webhook, a standalone **embed loader**, a full
**documentation suite**, Echo **branding**, and a **zero-warning** lint pass
across the monorepo.

Highlights:

- **Embeddable widget** — one-tag install; chat, voice, contact, and inbox
  surfaces driven by a Jotai state machine; org-scoped and session-validated.
- **AI agent + RAG** — Gemini 2.5 Flash with `search` / `escalate` / `resolve`
  tools, answering only from your uploaded documents; `gemini-embedding-001`
  embeddings, organization-namespaced and content-hash-deduplicated.
- **Operator dashboard** — real-time inbox, chat with AI "Enhance," contact
  panel with device/location metadata, widget customization, integrations.
- **Voice (Vapi)** — live web calls and phone options; private keys encrypted in
  AWS Secrets Manager, only the public key ever reaches the browser.
- **Billing** — Clerk `PricingTable`, `PremiumFeatureOverlay` gating, and a
  `svix`-verified webhook that syncs subscription status and seat limits.
- **Embed loader** — dependency-free Vite/IIFE script with a `window.EchoWidget`
  API and `postMessage` coordination.
- **Docs & DX** — product-first README, a 14-document `docs/` suite with Mermaid
  diagrams, Echo favicon/metadata, and zero lint warnings.

---

### Fixed

#### Lint cleanup — zero warnings across the monorepo

- `packages/ui` `hint.tsx` — the `side` / `align` props were destructured but
  never forwarded to `TooltipContent`; now passed through (fixes the unused‑var
  warning **and** makes the props functional)
- `packages/ui` `ai/branch.tsx` — `childrenArray` wrapped in `useMemo` so the
  effect's dependencies are stable (fixes `react-hooks/exhaustive-deps`)
- `apps/widget` `widget-chat-screen` — removed an unused
  `AIConversationScrollButton` import
- `apps/widget` `widget-loading-screen` — escaped an apostrophe and added the
  two stable Jotai setters to a dependency array; documented the intentional
  effect‑driven bootstrap state machine (`set-state-in-effect`)
- Documented intentional React patterns with justified, scoped
  `eslint-disable` comments (external‑system syncs in `use-vapi`, `use-mobile`,
  `carousel`, `reasoning`; deliberate skeleton randomness in `sidebar`;
  once‑on‑mount data hooks in `use-vapi-data`)
- Excluded the pre‑built, minified embed loader bundle
  (`apps/widget/public/widget.js`) from linting — it is shipped static output,
  not source

### Added

#### Documentation suite & branding — `docs/`, `README.md`, `apps/*/app/icon.svg`

- **Complete rewrite of `README.md`** into a comprehensive, product‑first
  overview: what Echo is, a feature tour, Mermaid architecture and flow
  diagrams, the data model (ERD), tech stack, monorepo map, full setup with
  every external service, a backend function reference, embedding instructions,
  and deployment guidance
- **New `docs/` suite** (14 documents, all with Mermaid diagrams):
  `product-overview` (client‑facing), `architecture`, `data-model`,
  `authentication`, `ai-agent`, `conversation-flows`, `widget`, `voice`,
  `billing`, `backend-api`, `setup`, `deployment`, `embedding`, and an index
- **Echo branding** — replaced the default Next.js/Vercel `favicon.ico` in both
  `apps/web` and `apps/widget` with an `icon.svg` built from the Echo logo, and
  added product `metadata` (title, description, icons) to both root layouts

#### Embeddable widget loader — `apps/embed/`

- **New `embed` app** (Vite library build, IIFE bundle) — a standalone,
  dependency-free JavaScript loader that website owners drop onto any page via a
  single `<script>` tag. It injects a floating action button and an `<iframe>`
  pointing at the widget app, scoped to the embedding organization
- **`embed.ts`** — the loader itself: reads `data-organization-id` /
  `data-position` from its own `<script>` tag (with a `src*="embed"` fallback
  lookup), renders a fixed-position launcher button and a hidden animated
  iframe container, wires `postMessage` handling for `close` / `resize` events
  from the widget, and exposes a `window.EchoWidget` API (`init`, `show`,
  `hide`, `destroy`)
- **`config.ts`** — `EMBED_CONFIG` (widget URL from `VITE_WIDGET_URL`, default
  organization ID, default position); **`icons.ts`** — inline chat-bubble and
  close SVG icons; **`vite.config.ts`** — IIFE library build (`EchoWidget`
  global) plus a dev server on port 3002 opening `demo.html`
- **`demo.html`** — interactive demo/playground with live init / show / hide /
  destroy controls; **`landing.html`** — minimal embed smoke-test page
- **`apps/widget/public/widget.js`** — the built loader bundle, served by the
  widget app so `http://localhost:3001/widget.js` resolves in development

#### Integration snippets now load the widget — `apps/web/modules/integrations/constants/index.ts`

- The four framework snippets (`HTML_SCRIPT`, `REACT_SCRIPT`, `NEXTJS_SCRIPT`,
  `JAVASCRIPT_SCRIPT`) now include `src="http://localhost:3001/widget.js"` so
  the copied embed code actually loads the widget loader (was a bare
  `data-organization-id` tag with no script source)

- **`ui/views/integrations-view/index.tsx`** (new) — `IntegrationsView`;
  displays the organization's ID (read-only, copy-to-clipboard) and a grid of
  four integration options (HTML, React, Next.js, JavaScript); clicking one
  opens `IntegrationsDialog`, showing a two-step install snippet
  (copy-to-clipboard code block, paste-in-page instructions) with the
  organization ID interpolated into the script tag
- **`constants/index.ts`** (new) — `INTEGRATIONS` list (id/title/icon per
  framework) and one script template per framework
  (`HTML_SCRIPT`/`REACT_SCRIPT`/`NEXTJS_SCRIPT`/`JAVASCRIPT_SCRIPT`); all four
  currently share the same placeholder `<script
data-organization-id="{{ORGANIZATION_ID}}">` tag — framework-specific
  snippets are a follow-up
- **`utils/index.ts`** (new) — `createScript(integrationId, organizationId)`;
  selects the matching template and interpolates the organization ID
- **`app/(dashboard)/integrations/page.tsx`** — now renders
  `<IntegrationsView />` (was a bare `<div>Integrations</div>`)
- **`apps/web/public/languages/`** (new) — four framework logo SVGs (html5,
  react, nextjs, javascript)

---

#### Contact session auto-refresh — `packages/backend/convex/`

- **`constants.ts`** (new) — `SESSION_DURATION_MS` (24 hours), extracted from
  `public/contactSessions.ts` into a shared constant
- **`system/contactSessions.ts`** — **`refresh`** internal mutation (new);
  extends a contact session's `expiresAt` by another `SESSION_DURATION_MS`
  whenever less than `AUTO_REFRESH_THRESHOLD_MS` (4 hours) remains before
  expiry; throws if the session is missing or already expired, otherwise
  returns it unchanged when refresh isn't yet needed
- **`public/conversations.ts`** (`create`) and **`public/messages.ts`**
  (`create`) — both now call `system.contactSessions.refresh` at the start of
  the handler, keeping an actively-chatting visitor's session alive instead of
  expiring mid-conversation

### Changed

#### Subscription-gated AI features — `packages/backend/convex/`

- **`public/messages.ts`** (`create`) — the support agent now only
  auto-responds (`shouldTriggerAgent`) when the conversation is `"unresolved"`
  **and** the organization's subscription status is `"active"` (resolves the
  `TODO: Implement subscription check` placeholder); a conversation on an
  inactive/missing subscription still accepts operator messages, just without
  AI involvement
- **`private/messages.ts`** (`enhanceResponse`) — now checks
  `system.subscriptions.getByOrganizationId` and throws `BAD_REQUEST` /
  "Missing subscription" if the org isn't on an active plan
- **`private/files.ts`** (`addFile`) — same active-subscription check before
  extracting text and indexing a file into the knowledge base

#### Enhance error feedback — `apps/web/modules/dashboard/ui/views/conversation-id-view/index.tsx`

- `handleEnhanceResponse`'s catch block now shows a `sonner` error toast
  ("Something went wrong") in addition to logging to the console, so operators
  get visible feedback when enhancement fails (e.g. due to the new subscription
  check)

---

#### Billing and Pro plan gating — `apps/web/modules/billing/`

- **`ui/views/billing-view/index.tsx`** (new) — `BillingView`; "Plans & Billing"
  page rendering Clerk's `PricingTable`
- **`ui/components/pricing-table/index.tsx`** (new) — wraps Clerk's
  `<PricingTable for="organization">` with themed `appearance.elements` overrides
  to match the dashboard's card styling
- **`ui/components/premium-feature-overlay/index.tsx`** (new) —
  `PremiumFeatureOverlay`; blurs and disables pointer events on gated page
  content, overlays a dark backdrop, and centers an upgrade prompt card listing
  the six Pro-tier features (AI Customer Support, AI Voice Agent, Phone
  System, Knowledge Base, Team Access, Widget Customization) with a "View
  Plans" button linking to `/billing`
- **`app/(dashboard)/billing/page.tsx`** — now renders `<BillingView />` (was a
  bare `<div>Billing</div>`)
- **`app/(dashboard)/customization/page.tsx`**, **`files/page.tsx`**,
  **`plugins/vapi/page.tsx`** — each now an `async` Server Component that checks
  `(await auth()).has({ plan: "pro" })` and renders the real view wrapped in
  `<PremiumFeatureOverlay>` when the organization isn't on the Pro plan

#### Clerk billing webhook — `packages/backend/convex/http.ts`

- **`POST /clerk-webhook`** (new) — verifies the incoming webhook's signature
  via `svix` (`svix-id` / `svix-timestamp` / `svix-signature` headers) before
  processing; on `subscription.updated`, sets the organization's
  `maxAllowedMemberships` in Clerk (5 seats if `status === "active"`, else 1)
  and persists the subscription status via `system/subscriptions.upsert`;
  unrecognized event types are logged and ignored
- **`system/subscriptions.ts`** (new) — `upsert` internal mutation
  (insert-or-patch by `organizationId`) and `getByOrganizationId` internal query
- **`subscriptions` table** (new, `schema.ts`) — `organizationId`, `status`;
  indexed by `organizationId`
- **`svix ^1.96.1`** added to `packages/backend` dependencies

#### Themed Clerk provider — `apps/web/app/layout.tsx`

- **`ClerkProvider`** now passes `appearance.variables.colorPrimary: "#3C82F6"`
  to match the dashboard's blue design-system palette

### Fixed

#### Clerk API drift — `apps/web/modules/billing/ui/components/pricing-table/index.tsx`, `apps/web/app/(dashboard)/files/page.tsx`

- **`<PricingTable forOrganizations>`** — `forOrganizations` was a boolean prop
  on an older Clerk SDK version; the installed `@clerk/nextjs` (via
  `@clerk/shared@4.23.0`) replaced it with `for` typed as `ForPayerType =
'organization' | 'user'`. Fixed to `for="organization"`
- **`<Protect condition={...} fallback={...}>`** — the `Protect` component has
  been removed entirely from both `@clerk/nextjs` and `@clerk/react` in the
  installed versions (not renamed). Replaced with the server-side equivalent:
  `const { has } = await auth(); has({ plan: "pro" })`, called directly in each
  gated page component (now `async`)

---

#### Dashboard contact panel — `apps/web/modules/dashboard/`

- **`ui/components/contact-panel/index.tsx`** (new) — `ContactPanel`; reads
  `conversationId` from the route params, fetches the associated contact
  session, and displays a `DicebearAvatar` (with country-flag badge), name,
  email, and a "Send Email" (`mailto:`) button, followed by three collapsible
  `Accordion` sections built from the session's captured metadata:
  - **Device Information** — browser/OS/device parsed via `bowser`, screen
    resolution, viewport size, cookies enabled
  - **Location & Language** — country (resolved from timezone), language,
    timezone, UTC offset
  - **Section details** — session start time
  - Renders `null` while loading or if no contact session is found
- **`ui/layouts/conversation-id-layout/index.tsx`** (new) —
  `ConversationIdLayout`; resizable two-pane layout for the conversation detail
  route (chat at 60%, `ContactPanel` at 40%, hidden below the `lg` breakpoint)
- **`app/(dashboard)/conversations/[conversationId]/layout.tsx`** (new) —
  wires the route to `<ConversationIdLayout>`

#### Contact session lookup by conversation — `packages/backend/convex/private/contactSessions.ts`

- **`getOneByConversationId` query** (new) — identity/org-gated; resolves the
  conversation, verifies it belongs to the caller's organization, then returns
  its associated `contactSession` document
- **`bowser ^2.14.1`** added to `apps/web` dependencies (user-agent parsing for
  the Device Information accordion section)

---

#### Widget contact screen — `apps/widget/modules/widget/ui/screens/widget-contact-screen/`

- **`index.tsx`** (new) — `WidgetContactScreen`; displays the organization's
  configured Vapi phone number with a "Copy Number" button
  (`navigator.clipboard`, shows a 2-second "Copied!" confirmation state) and a
  "Call Now" button (`tel:` link)
- **`ui/views/widget-view/index.tsx`** — `contact` slot wired to
  `<WidgetContactScreen />` (was `<p>TODO: Contact</p>`)

### Changed

#### Widget layout sizing — `apps/widget/app/layout.tsx`, `ui/views/widget-view/index.tsx`

- Root layout now wraps `children` in a `h-screen w-screen` container, and
  `WidgetView`'s `<main>` sizes off that container (`h-full w-full`) instead of
  viewport units (`min-h-screen`, `min-w-screen`) — resolves a `TODO` about
  whether viewport-relative sizing was needed; more correct for an embeddable
  widget rendered inside a fixed-size iframe rather than a full page
- `WidgetVoiceScreen`'s transcript `AIConversation` simplified to `h-full`
  (was `h-full flex-1`) to match

---

#### Widget voice calling — `apps/widget/modules/widget/`

- **`ui/screens/widget-voice-screen/index.tsx`** (new) — `WidgetVoiceScreen`;
  live voice-call UI built on `useVapi()`: shows a scrolling transcript once
  the call produces messages (falls back to a "Transcript will appear here"
  empty state), a pulsing red/green indicator for assistant-speaking vs.
  listening, and a single Start/End call button that swaps based on
  `isConnected`
- **`hooks/use-vapi.ts`** — no longer hardcodes empty-string test credentials;
  reads the real `publicApiKey` from `vapiSecretsAtom` to construct the `Vapi`
  client, and `startCall()` now passes the organization's configured
  `widgetSettings.vapiSettings.assistantId` (guards against missing secrets or
  assistant ID)
- **`ui/screens/widget-loading-screen/index.tsx`** — new `"vapi"` init step
  (`"settings" → "vapi" → "done"`); calls
  `api.public.secrets.getVapiSecrets` and stores the result (or `null` on
  failure) in `vapiSecretsAtom`; this step is optional — a failed/missing Vapi
  connection doesn't block the widget from reaching `"done"`
- **`ui/screens/widget-selection-screen/index.tsx`** — two new conditionally
  rendered options: "Start voice call" (shown when `hasVapiSecretsAtom` is true
  and an assistant is configured, routes to `"voice"`) and "Call us" (shown
  when a phone number is configured, routes to `"contact"`)
- **`atoms/widget-atoms/index.ts`** — **`vapiSecretsAtom`**
  (`{ publicApiKey: string } | null`) and derived **`hasVapiSecretsAtom`**
  (`get => get(vapiSecretsAtom) !== null`)
- **`ui/views/widget-view/index.tsx`** — `voice` slot wired to
  `<WidgetVoiceScreen />` (was `<p>TODO: Voice</p>`)

#### Widget-facing Vapi credentials — `packages/backend/convex/public/secrets.ts`

- **`getVapiSecrets` action** (new) — unauthenticated (widget-facing); resolves
  the org's Vapi plugin, decrypts its AWS Secrets Manager secret, and returns
  **only** `{ publicApiKey }` — the private key is never exposed to the client;
  returns `null` if no plugin, no secret, or incomplete credentials exist

---

#### Widget settings consumption — `apps/widget/modules/widget/`

- **`ui/screens/widget-loading-screen/index.tsx`** — new `"settings"` init step
  (`"org" → "session" → "settings" → "done"`); after session validation, queries
  `api.public.widgetSettings.getByOrganizationId` and stores the result in the
  new `widgetSettingsAtom` before advancing to `"done"`
- **`ui/screens/widget-chat-screen/index.tsx`** — reads `widgetSettingsAtom` and
  derives a `suggestions` array from `defaultSuggestions`
  (`useMemo`, filters out unset suggestion slots); renders them as clickable
  `AISuggestions` above the input, but only on the first message in a
  conversation (`toUIMessages(...).length === 1`); clicking a suggestion fills
  and immediately submits the message form
- **`atoms/widget-atoms/index.ts`** — **`widgetSettingsAtom`** added
  (`atom<Doc<"widgetSettings"> | null>(null)`)

#### Widget settings public query — `packages/backend/convex/public/widgetSettings.ts`

- **`getByOrganizationId` query** (new) — unauthenticated (widget-facing) lookup
  of an organization's `widgetSettings` document by `organizationId`

### Changed

#### Conversation greeting — `packages/backend/convex/public/conversations.ts`

- **`create` mutation** — the initial assistant greeting now uses the org's
  configured `widgetSettings.greetMessage` when set, falling back to "Hello,
  how can I help you today?" (replaces the `TODO` placeholder)

---

#### Widget customization settings — `apps/web/modules/customization/`

- **`ui/views/customization-view/index.tsx`** (new) — `CustomizationView`;
  loads `widgetSettings` and the org's Vapi plugin state concurrently, shows a
  spinner until both resolve, then renders `CustomizationForm`
- **`ui/components/customization-form/index.tsx`** (new) — `CustomizationForm`;
  `react-hook-form` + `zodResolver` form with a "General Chat Settings" card
  (greeting message, three optional default-suggestion inputs) and a
  conditionally-rendered "Voice Assistant Settings" card (only when
  `hasVapiPlugin` is true); submits via `api.private.widgetSettings.upsert`
  with toast feedback; normalizes a `"none"` select value back to an empty
  string before saving
- **`ui/components/vapi-form-fields/index.tsx`** (new) — `VapiFormFields`;
  two `Select` fields (Voice Assistant, Display Phone Number) populated from
  `useVapiAssistants` / `useVapiPhoneNumbers`, disabled while loading or while
  the form is submitting
- **`schemas/index.ts`** / **`types/index.ts`** (new) — `widgetSettingsSchema`
  (zod) and the derived `FormSchema` type, shared between the form and its
  field components
- **`app/(dashboard)/customization/page.tsx`** — now renders
  `<CustomizationView />` (was a bare `<div>Customization</div>`)

#### Widget settings persistence — `packages/backend/convex/private/widgetSettings.ts`

- **`upsert` mutation** (new) — identity/org-gated; insert-or-patch a single
  `widgetSettings` document per organization (`greetMessage`,
  `defaultSuggestions`, `vapiSettings`)
- **`getOne` query** (new) — identity/org-gated; returns the org's
  `widgetSettings` document or `null`
- **`widgetSettings` table** (new, `schema.ts`) — `organizationId`,
  `greetMessage`, `defaultSuggestions` (three optional strings), `vapiSettings`
  (`assistantId` / `phoneNumber`, both optional); indexed by `organizationId`

### Fixed

#### Vapi data hooks race condition — `apps/web/modules/plugins/hooks/use-vapi-data.ts`

- **`useVapiAssistants`** / **`useVapiPhoneNumbers`** — added a `cancelled` flag
  inside the effect to guard all `setState` calls, preventing a "set state on
  an unmounted component" warning/leak if the component unmounts before the
  action resolves
- Removed `getAssistants` / `getPhoneNumbers` from the effect's dependency
  array (now fetches once on mount) — `useAction` returns a new function
  reference on every render, so including it caused a render → refetch →
  render infinite loop

#### Vapi form field placeholder — `apps/web/modules/customization/ui/components/vapi-form-fields/index.tsx`

- The "Display Phone Number" select's loading placeholder checked
  `assistantsLoading` instead of `phoneNumbersLoading` — copy-paste bug that
  showed "Loading assistants..." while phone numbers were still loading (the
  field's `disabled` state was already correct)

---

#### Vapi connected dashboard — `apps/web/modules/plugins/`

- **`ui/components/vapi-connected-view/index.tsx`** (new) — `VapiConnectedView`;
  replaces the placeholder "Connected!!" text with a full management view:
  integration card (logo, disconnect button), a "Widget Configuration" card
  linking to `/customization`, and a tabbed `Phone Numbers` / `AI Assistants`
  panel
- **`ui/components/vapi-phone-numbers-tab/index.tsx`** (new) —
  `VapiPhoneNumbersTab`; table of the org's Vapi phone numbers (number, name,
  active/inactive status badge) via `useVapiPhoneNumbers`; loading and
  empty states handled inline
- **`ui/components/vapi-assistants-tab/index.tsx`** (new) —
  `VapiAssistantsTab`; table of the org's Vapi assistants (name, model,
  first message) via `useVapiAssistants`
- **`hooks/use-vapi-data.ts`** (new) — `useVapiAssistants` /
  `useVapiPhoneNumbers`; thin `useAction`-backed data hooks with local
  loading/error state and toast-on-failure, typed directly off
  `api.private.vapi.getAssistants._returnType` /
  `.getPhoneNumbers._returnType`
- **`VapiView`** — now renders `<VapiConnectedView onDisconnect={toggleConnection} />`
  in place of the connected view; `handleSubmit` renamed to `toggleConnection`
  for clarity; adds a `VapiPluginRemoveForm` confirmation dialog (calls
  `api.private.plugins.remove`)

#### Vapi server API access — `packages/backend/convex/private/vapi.ts`

- **`getAssistants`** / **`getPhoneNumbers`** actions (new) — identity/org-gated;
  resolve the org's stored plugin, fetch and decrypt its Vapi credentials from
  AWS Secrets Manager, then call `@vapi-ai/server-sdk`'s `VapiClient` (`token:
privateApiKey`) to list assistants / phone numbers; both guard against a
  missing plugin, missing secret, or incomplete credentials
- **`@vapi-ai/server-sdk ^0.10.2`** added to `packages/backend` dependencies

---

#### Vapi plugin integration — `apps/web/modules/plugins/`, `packages/backend/convex/`

- **`ui/views/vapi-view/index.tsx`** (new) — `VapiView`; plugin connection page
  showing a `PluginCard` (feature list: web voice calls, phone numbers, outbound
  calls, workflows) when disconnected, or a connected placeholder state when a
  plugin record exists; `VapiPluginForm` dialog collects a public/private API
  key pair (`react-hook-form` + `zodResolver`, both keys required) and submits
  via `api.private.secrets.upsert`, with `sonner` toast feedback on
  success/failure
- **`ui/components/plugin-card/index.tsx`** (new) — `PluginCard`; reusable
  service-connection card showing a service ↔ platform logo swap icon, a
  feature list, and a "Connect" button
- **`app/(dashboard)/plugins/vapi/page.tsx`** — now renders `<VapiView />` (was
  a static `<p>Vapi Plugin</p>`)
- **`app/layout.tsx`** — added `<Toaster />` (from `sonner`) to the root layout
  so toast notifications render app-wide
- **`apps/web/public/vapi.jpg`** (new) — Vapi service logo asset

#### Encrypted credential storage — `packages/backend/convex/`

- **`lib/secrets.ts`** (new) — thin AWS Secrets Manager client wrapper:
  `createSecretsManagerClient`, `getSecretValue`, `upsertSecret` (creates the
  secret, falling back to an update via `PutSecretValueCommand` if it already
  exists, caught via `ResourceExistsException`), and `parseSecretString`
- **`system/secrets.ts`** — `upsert` internal action; stores a service's
  credentials in AWS Secrets Manager under `tenant/{organizationId}/{service}`,
  then records the secret's name against the organization via
  `system/plugins.upsert`
- **`private/secrets.ts`** — `upsert` mutation; identity/org-gated public
  entry point; schedules `system.secrets.upsert` via `ctx.scheduler.runAfter(0,
...)` since mutations cannot call actions (or external APIs) directly
- **`system/plugins.ts`** (new) — `upsert` internal mutation (insert-or-patch a
  `plugins` record for an org+service pair) and
  `getByOrganizationIdAndService` internal query
- **`private/plugins.ts`** (new) — `getOne` query and `remove` mutation,
  both identity/org-gated, for the dashboard's plugin connection state
- **`plugins` table** (new, `schema.ts`) — `organizationId`, `service`
  (currently `"vapi"` only), `secretName`; indexed by `organizationId` and by
  `organizationId` + `service`
- **`@aws-sdk/client-secrets-manager ^3.1080.0`** added to `packages/backend`
  dependencies

---

#### Knowledge base search tool — `packages/backend/convex/system/ai/tools/search.ts`

- **`search` tool** (new) — `createTool` definition; resolves the calling
  conversation's organization from its `threadId`, searches the RAG knowledge
  base (`rag.search()`, `limit: 5`) scoped to that organization's namespace,
  then interprets the raw results into a natural-language answer via a second
  `generateText()` call using `SEARCH_INTERPRETER_PROMPT`; saves the
  interpreted answer as an assistant message and returns it to the agent
- Wired into `supportAgent`'s tool set as `searchTool` (alongside
  `escalateConversationTool` and `resolveConversationTool`, all renamed from
  their bare export names to `*Tool` suffixes for clarity in the agent's
  instructions) in `public/messages.ts`'s `create` action

#### Centralized AI prompts — `packages/backend/convex/system/ai/constants/index.ts`

- **`SUPPORT_AGENT_PROMPT`** (new) — replaces the one-line inline instructions
  string in `supportAgent.ts`; a structured prompt covering identity, available
  tools, a step-by-step conversation flow (search first, escalate on
  frustration, resolve on completion), tone/style rules, and edge cases
- **`SEARCH_INTERPRETER_PROMPT`** (new) — instructs the model interpreting raw
  RAG search results to stay strictly faithful to retrieved content, handle
  partial/no-match cases, and never fabricate information
- **`OPERATOR_MESSAGE_ENHANCEMENT_PROMPT`** (new) — moved out of
  `private/messages.ts`'s `enhanceResponse` action into a shared constant;
  expanded with explicit tone/style guidelines, preservation rules, and
  before/after examples

---

#### Knowledge base dashboard — `apps/web/modules/files/`

- **`ui/views/files-view/index.tsx`** (new) — `FilesView`; paginated file table
  (`usePaginatedQuery(api.private.files.list)`, `initialNumItems: 10`, infinite
  scroll via `useInfiniteScroll` + `InfiniteScrollTrigger`) showing name, type
  badge, size, and a per-row actions dropdown (delete); "Add New" button opens
  the upload dialog; loading and empty states handled inline
- **`ui/components/upload-dialog/index.tsx`** (new) — `UploadDialog`; drag-and-drop
  `Dropzone` (accepts `.pdf`, `.csv`, `.txt`, one file at a time) with optional
  category and filename-override inputs; reads the dropped file as an
  `ArrayBuffer` and calls `api.private.files.addFile`; disabled until a category
  is set
- **`ui/components/delete-file-dialog/index.tsx`** (new) — `DeleteFileDialog`;
  confirmation dialog showing the file's name/type/size before calling
  `api.private.files.deleteFile`
- **`app/(dashboard)/files/page.tsx`** — now renders `<FilesView />` (was a bare
  `<div>Files</div>`)

#### File listing and metadata — `packages/backend/convex/private/files.ts`

- **`list` query** (new) — identity/org-gated; resolves the org's RAG namespace,
  lists entries via `rag.list()` (paginated), optionally filters by `category`,
  and maps each `Entry` to a `PublicFile` view model via
  `convertEntryToPublicFile` (resolves storage size via `ctx.db.system.get`,
  derives file extension from the entry's `key`, maps RAG entry status
  `"ready" | "pending" | ...` to a simplified `"ready" | "processing" | "error"`)
- **`PublicFile`** type exported (new) — `{ id, name, type, size, status, url,
category? }`, consumed directly by the dashboard's file table and delete dialog
- **`formatFileSize`** helper (new) — formats bytes as `B` / `KB` / `MB` / `GB`
  with one decimal place

#### Sample knowledge base content — `assets/knowledge-base/`

- Seven `.txt` reference documents added for testing/demoing the knowledge base
  upload flow: `api-documentation`, `billing-invoice-example`, `faq`,
  `getting-started`, `pricing-plans`, `terms-of-service`, `troubleshooting-guide`

### Fixed

#### Text embedding model — `packages/backend/convex/system/ai/rag.ts`

- **`textEmbeddingModel`** switched from `"text-embedding-004"` to
  `"gemini-embedding-001"` — Google deprecated `text-embedding-004` and it is no
  longer served on the `v1beta` `embedContent` endpoint (confirmed via a direct
  `ListModels` call), causing every file upload to fail with an uncaught
  `AI_APICallError` at runtime
- Added `outputDimensionality: 1536` to the model settings —
  `gemini-embedding-001` defaults to a 3072-dimension output; truncated to match
  the existing `embeddingDimension: 1536` RAG config. Verified with a live API
  call returning exactly 1536 dimensions

---

#### RAG file embeddings — `packages/backend/convex/`

- **`system/ai/rag.ts`** (new) — `rag` client instance from `@convex-dev/rag`;
  uses `google.textEmbeddingModel("text-embedding-004")` (Gemini's free-tier
  embedding model, 768-dimensional output) as the text embedding model
- **`convex.config.ts`** — registers `rag` as a second Convex component
  alongside `agent` via `app.use(rag)`
- **`private/files.ts`** (new) — two server functions for the dashboard's
  knowledge-base file uploads:
  - `addFile` action: identity/org-gated; stores the uploaded file in Convex
    storage, extracts its text content via `extractTextContent`, then calls
    `rag.add()` to embed and index it into the organization's namespace
    (`namespace: orgId`, preventing cross-org search leakage); deduplicates via
    `contentHash` so re-uploading unchanged content skips re-indexing; cleans up
    orphaned storage blobs when `created` is `false`
  - `deleteFile` mutation: identity/org-gated; verifies the entry's namespace and
    `uploadedBy` metadata match the caller's org before deleting both the RAG
    entry and its underlying storage blob
- **`lib/extractTextContent.ts`** (new) — `extractTextContent()`; routes by MIME
  type to one of three Gemini 2.5 Flash-powered extractors: `extractImageText`
  (vision — transcribes documents, describes non-document images),
  `extractPdfText` (native PDF document understanding), and
  `extractTextFileContent` (converts non-plain-text files to Markdown; passes
  `text/plain` through unchanged); all three are covered by Gemini's free tier
- **`@convex-dev/rag 0.3.3`** added to `packages/backend` dependencies

### Changed

#### Message creation — `packages/backend/convex/private/messages.ts`

- **`create` mutation** now auto-escalates a conversation from `"unresolved"` to
  `"escalated"` the moment an operator sends a reply, ensuring the AI agent stops
  auto-responding as soon as a human steps into the conversation

### Fixed

#### Dependency version alignment — `packages/backend`, `apps/web`, `apps/widget`

- Pinned `convex`, `ai`, `zod`, `@convex-dev/agent`, and `convex-helpers` to
  **exact** versions (removed caret ranges) across all three packages, matching
  known-compatible versions. Caret ranges had let `pnpm install` drift to newer
  releases over time, which cascaded into several real, hard-to-diagnose type
  and runtime errors:
  - `convex` (newer minor) added an `AdvancedRunQueryOptions` overload to
    `GenericMutationCtx.runQuery` not present on `GenericActionCtx.runQuery`,
    breaking `rag.add()`'s type signature when called from an action
  - `convex-helpers` (newer patch) called `getDocumentSize` from `convex/values`,
    an export that doesn't exist in the pinned `convex` version, crashing
    `convex dev`'s bundler at runtime
  - `@convex-dev/agent` drifted to `ai@6.x` (a major version away from the
    `ai@4.3.19` the rest of the backend is built against), changing the shape of
    `UIMessage` (`content` → `parts`) and breaking both chat views
  - Mixed zod v3/v4 across packages caused the earlier `@hookform/resolvers`
    phantom-dependency mismatch (see prior entries)

---

#### Conversations query — `packages/backend/convex/private/conversations.ts`

- **`getOne`** — the post-`contactSession`-fetch null check tested `!conversation`
  (already known non-null) instead of `!contactSession`; a missing contact session
  would silently pass `undefined` through rather than throwing `NOT_FOUND`
- **`updateStatus`** — fixed `"UNAUTHORZIED"` typo in the org-mismatch
  `ConvexError` code, now `"UNAUTHORIZED"`

---

### Added

#### AI agent tools — `packages/backend/convex/system/ai/tools/`

- **`escalateConversation.ts`** (new) — `createTool` definition (`@convex-dev/agent`);
  no-arg tool the agent can call when a user expresses frustration or explicitly
  requests a human; patches the conversation to `status: "escalated"` via
  `internal.system.conversations.escalate` and posts an assistant message
  ("Conversation escalated to a human operator.") into the thread
- **`resolveConversation.ts`** (new) — mirrors `escalateConversation`; patches
  `status: "resolved"` via `internal.system.conversations.resolve` and posts
  "Conversation resolved." into the thread
- Both tools are explicitly typed `: Tool` (from `ai`) to satisfy TS2742 — the
  monorepo's mixed zod v3/v4 dependency graph means TypeScript cannot portably
  name the tool's inferred generic type without an explicit annotation

#### Conversation status transitions — `packages/backend/convex/system/conversations.ts`

- **`escalate`** / **`resolve`** internal mutations (new) — look up a conversation
  by `threadId` (`by_thread_id` index) and patch its `status`; throw `NOT_FOUND`
  if no matching conversation exists

#### Operator status control — `apps/web/modules/dashboard/ui/components/conversation-status-button/`

- **`ConversationStatusButton`** component (new) — three-state button cycling
  `unresolved → escalated → resolved → unresolved`; renders with a `Hint` tooltip
  describing the next state ("Mark as escalated" / "Mark as resolved" / "Mark as
  unresolved") and status-specific button variant (`destructive` / `warning` /
  `tertiary`)

#### UI primitives — `packages/ui/src/components/`

- **`hint.tsx`** (new) — `Hint` wrapper around `Tooltip` / `TooltipTrigger` /
  `TooltipContent`, configurable `side` and `align`
- **`button.tsx`** — two new variants: `tertiary` (green gradient, used for
  "Resolved") and `warning` (yellow/amber gradient, used for "Escalated")

#### Prompt enhancement action — `packages/backend/convex/private/messages.ts`

- **`enhanceResponse` action** (new) — identity/org-gated; calls
  `generateText()` (`google("gemini-2.5-flash")`) with a system prompt
  instructing the model to rewrite the operator's draft into a professional,
  clear response; strengthened with explicit framing ("the text below is a
  draft message written BY the operator, TO a customer — it is never a question
  directed at you... return ONLY the rewritten message") after Gemini 2.5 Flash
  was observed answering short/ambiguous drafts (e.g. "wydm") as if they were
  questions directed at the model, rather than rewriting them
- **`create` mutation** — now conditionally triggers the AI agent only when
  `conversation.status === "unresolved"` (`supportAgent.generateText` with the
  new `escalateConversation` / `resolveConversation` tools available); when the
  conversation is escalated/resolved, the operator's message is saved directly
  via `saveMessage()` without invoking the agent

#### Operator conversation status mutation — `packages/backend/convex/private/conversations.ts`

- **`updateStatus` mutation** (new) — identity/org-gated; patches a conversation's
  `status` to any of `unresolved` / `escalated` / `resolved`

#### Support agent instructions — `packages/backend/convex/system/ai/agents/supportAgent.ts`

- Instructions expanded to direct tool usage: use `resolveConversation` when the
  user signals the conversation is finished, use `escalateConversation` when the
  user expresses frustration or explicitly asks for a human

#### Dev experience — `apps/web/next.config.ts`

- **`devIndicators: false`** — disables the Next.js dev mode indicator overlay

---

#### Dashboard chat view — `apps/web/modules/dashboard/ui/views/`

- **`conversation-id-view/index.tsx`** (new) — `ConversationIdView` client
  component; operator-facing chat interface for a single conversation:
  - Loads the conversation via `api.private.conversations.getOne`, messages via
    `useThreadMessages(api.private.messages.getMany)` (`initialNumItems: 10`)
  - Renders messages through the AI Elements components (`AIConversation`,
    `AIMessage`, `AIResponse`), with roles inverted from the widget's perspective
    (`user` messages shown as `assistant` bubbles and vice versa, since the
    dashboard is the operator's viewpoint) and `DicebearAvatar` for the contact
  - `AIInput` form (`react-hook-form` + `zodResolver`) lets the operator reply;
    submits via `api.private.messages.create`; input and submit disable when
    `conversation.status === "resolved"`
  - Header includes an "Enhance" `AIInputButton` (Wand2Icon) — not yet wired to
    prompt-enhancement logic
- **`conversations-view/index.tsx`** (new) — `ConversationsView`; empty-state
  placeholder shown at `/conversations` before a conversation is selected (Echo
  logo + wordmark, centered)
- **`app/(dashboard)/conversations/page.tsx`** — now renders `<ConversationsView />`
  (was a bare `<div>Conversations</div>`)
- **`app/(dashboard)/conversations/[conversationId]/page.tsx`** (new) — dynamic
  route rendering `<ConversationIdView conversationId={conversationId} />`

#### Operator-side conversation queries — `packages/backend/convex/private/`

- **`conversations.ts` — `getOne` query** (new) — Clerk-identity-gated and
  organization-scoped; fetches a conversation by ID, verifies
  `conversation.organizationId` matches the caller's `orgId`, and attaches the
  associated `contactSession` document
- **`messages.ts`** (new) — two server functions:
  - `create` mutation: identity/org-gated, verifies conversation ownership and
    rejects resolved conversations, then calls `saveMessage()` (from
    `@convex-dev/agent`) with `role: "assistant"` to record the operator's reply
    directly into the agent thread (bypassing `generateText` since this is a human
    reply, not an AI-generated one)
  - `getMany` query: identity/org-gated, resolves the conversation by `threadId`
    via the `by_thread_id` index, then returns paginated messages via
    `supportAgent.listMessages()`

#### Dashboard dependencies — `apps/web/package.json`

- **`@convex-dev/agent ^0.1.18`**, **`@hookform/resolvers ^5.4.0`**,
  **`react-hook-form ^7.80.0`**, **`zod ^4.4.3`** added

### Changed

#### Dashboard layout — `apps/web/modules/dashboard/ui/layouts/dashboard-layout/index.tsx`

- Wrapped `SidebarProvider` in a Jotai `<Provider>` so dashboard components (the
  new conversations views) can share atom state

#### Widget dependencies — `apps/widget/package.json`

- **`@hookform/resolvers`** bumped `^3.10.0` → `^5.2.0` to match `packages/ui` and
  fix a phantom-dependency type mismatch: `@hookform/resolvers`' zod adapter does
  not declare `zod` as an explicit dependency, so pnpm's module resolution fell
  through to a hoisted `zod@4.4.3` (pulled in by `apps/web`), producing a type
  error against `zod@3.25.76`-built schemas. Version 5's `zodResolver` uses a
  structural type check compatible with both zod v3 and v4, resolving the mismatch

---

#### Dashboard conversations inbox — `apps/web/modules/dashboard/`

- **`ui/layouts/conversations-layout/index.tsx`** (new) — `ConversationsLayout`;
  resizable two-pane layout via `ResizablePanelGroup` (`ConversationsPanel` at
  20-30% width, page `children` filling the remaining 70%)
- **`ui/components/conversations-panel/index.tsx`** (new) — `ConversationsPanel`
  client component:
  - Status filter `Select` (All / Unresolved / Escalated / Resolved), persisted via
    `statusFilterAtom` (`atomWithStorage`)
  - Paginated conversation list via `usePaginatedQuery(api.private.conversations.getMany)`
    (`initialNumItems: 10`), infinite scroll via `useInfiniteScroll` +
    `InfiniteScrollTrigger`
  - Each row: `DicebearAvatar` seeded by contact session ID with a country-flag
    badge (derived from the contact's timezone via `country-utils`), contact name,
    relative timestamp, last-message preview (bold when from the contact, with a
    reply-arrow icon when from the operator), and `ConversationStatusIcon`
  - Active conversation highlighted via `usePathname` route matching, with an
    animated left-edge indicator bar
  - `SkeletonConversations` loading state (8 skeleton rows) shown while the first
    page loads
- **`atoms/index.ts`** (new) — `statusFilterAtom`, `atomWithStorage` keyed by
  `STATUS_FILTER_KEY`, defaults to `"all"`
- **`constants/index.ts`** (new) — `STATUS_FILTER_KEY = "echo-status-filter"`
- **`app/(dashboard)/conversations/layout.tsx`** (new) — delegates to
  `<ConversationsLayout>`
- Sidebar typo fixed: "Knowldge Base" → "Knowledge Base"
  (`dashboard-sidebar/index.tsx`)

#### Organization-scoped conversations query — `packages/backend/convex/private/conversations.ts`

- **`getMany` query** (new) — dashboard-side, Clerk-identity-gated (throws
  `UNAUTHORIZED` if no identity or no `orgId`); paginated via
  `by_status_and_organization_id` index when a `status` filter is supplied, else
  `by_organization_id`; enriches each conversation with its `contactSession`
  document and most recent message (`lastMessage`, via
  `supportAgent.listMessages`); filters out any conversation whose contact session
  no longer exists

#### Country/timezone utilities — `apps/web/lib/country-utils.ts`

- **`getCountryFromTimezone(timezone)`** — resolves an IANA timezone string to a
  country `{ code, name }` via `countries-and-timezones`
- **`getCountryFlagUrl(countryCode)`** — returns a `flagcdn.com` PNG URL for a
  given ISO country code
- **`countries-and-timezones ^3.9.0`**, **`jotai ^2.20.1`** added to `apps/web`
  dependencies

---

#### Widget inbox screen — `apps/widget/modules/widget/ui/screens/widget-inbox-screen/`

- **`index.tsx`** — `WidgetInboxScreen` client component; lists all conversations
  for the current contact session via `usePaginatedQuery(api.public.conversations.getMany)`
  (`initialNumItems: 10`), each row showing a relative timestamp
  (`formatDistanceToNow` from `date-fns`), the last message preview (truncated), and
  a `ConversationStatusIcon`; clicking a row sets `conversationIdAtom` and routes to
  `"chat"`; back button routes to `"selection"`; infinite scroll wired via
  `useInfiniteScroll` + `InfiniteScrollTrigger`; renders `WidgetFooter` for
  Home/Inbox navigation

#### Conversation status icon — `packages/ui/src/components/conversation-status-icon.tsx`

- **`ConversationStatusIcon`** component (new) — colored circular badge per
  conversation status: `resolved` (green, check), `unresolved` (destructive red,
  arrow-right), `escalated` (yellow, arrow-up)

#### Conversations list query — `packages/backend/convex/public/conversations.ts`

- **`getMany` query** (new) — paginated, session-gated list of conversations for a
  `contactSessionId` via the `by_contact_session_id` index, ordered newest-first;
  enriches each conversation with its most recent message
  (`supportAgent.listMessages` with `numItems: 1`) as `lastMessage`
- **`date-fns ^4.4.0`** added to `apps/widget` dependencies

### Changed

#### Widget footer navigation — `apps/widget/modules/widget/ui/components/widget-footer/index.tsx`

- Home and Inbox buttons now call `setScreen("selection")` / `setScreen("inbox")`
  via `screenAtom`; active icon highlighting reads live `screen` state via
  `useAtomValue` instead of a hardcoded local variable

#### Widget view — `apps/widget/modules/widget/ui/views/widget-view/index.tsx`

- `inbox` slot wired to `<WidgetInboxScreen />` (was `<p>TODO: Inbox</p>`)

#### Widget selection screen — `apps/widget/modules/widget/ui/screens/widget-selection-screen/index.tsx`

- Renders `<WidgetFooter />` so Home/Inbox navigation is available from the
  selection screen

#### Dicebear avatar — `packages/ui/src/components/dicebear-avatar.tsx`

- Added `imageUrl` to the `useMemo` dependency array for `avatarSrc`, fixing a stale
  avatar when `imageUrl` changes after initial render

---

#### Infinite scroll for chat history — `packages/ui/src/`

- **`hooks/use-infinite-scroll.ts`** — `useInfiniteScroll` hook; wraps an
  `IntersectionObserver` (10% threshold) on a sentinel element ref
  (`topElementRef`); calls `loadMore(loadSize)` when the sentinel scrolls into
  view and `status === "CanLoadMore"`; exposes `handleLoadMore`,
  `canLoadMore`, `isLoadingMore`, `isLoadingFirstPage`, `isExhausted` derived from
  the four-state pagination `status` (`"LoadingFirstPage" | "CanLoadMore" |
"LoadingMore" | "Exhausted"`); `observerEnabled` flag to opt out of the observer
- **`components/infinite-scroll-trigger.tsx`** — `InfiniteScrollTrigger`
  presentational component; renders a centered ghost `Button` above the message
  list showing "Load more" / "Loading..." / "No more items" depending on state;
  disabled while loading or exhausted; forwards `ref` to the sentinel `div`

#### Assistant avatar — `packages/ui/src/components/dicebear-avatar.tsx`

- **`DicebearAvatar`** component (new) — renders a deterministic SVG avatar via
  `@dicebear/core`'s `createAvatar()` with the `glass` style (`@dicebear/collection`),
  seeded and memoised by a `seed` string; falls back to a provided `imageUrl` when
  set; supports an optional bottom-right badge image (`badgeImageUrl`) rendered in a
  bordered circular overlay; `size` prop controls both avatar and badge dimensions
- **`@dicebear/core ^9.2.3`**, **`@dicebear/collection ^9.2.3`** added to
  `@workspace/ui` dependencies
- **`apps/widget/public/logo.svg`** (new) — static asset used as the assistant's
  avatar image via `DicebearAvatar`'s `imageUrl` override

### Changed

#### Widget chat screen — `apps/widget/modules/widget/ui/screens/widget-chat-screen/index.tsx`

- Wired `useInfiniteScroll` to the `useThreadMessages` pagination object
  (`messages.status`, `messages.loadMore`, `loadSize: 10`)
- Rendered `<InfiniteScrollTrigger>` at the top of `AIConversationContent`, above
  the message list, so scrolling up loads older messages
- Assistant messages now render `<DicebearAvatar imageUrl="/logo.svg" seed="assistant"
size={32} />` next to `AIMessageContent` (previously a `TODO: Add Avatar component`
  placeholder)

#### Widget auth screen — `apps/widget/modules/widget/ui/screens/widget-auth-screen/index.tsx`

- On successful contact session creation, now calls `setScreen("selection")` via
  `screenAtom` to advance past the auth form (previously left the user on the same
  screen after submit)

---

#### AI support agent — `packages/backend/convex/`

- **`convex.config.ts`** (new) — registers `@convex-dev/agent` as a Convex component
  via `app.use(agent)`
- **`system/ai/agents/supportAgent.ts`** (new) — `supportAgent` instance built with
  `@convex-dev/agent`'s `Agent` class; uses `@ai-sdk/google`'s
  `google.chat("gemini-2.5-flash")` as the chat model; instructed as
  `"You are a customer support agent"`
- **`system/contactSessions.ts`** (new) — `getOne` internal query: fetches a contact
  session document by ID for server-to-server use (no expiry check — callers
  perform that check themselves)
- **`system/conversations.ts`** (new) — `getByThreadId` internal query: looks up a
  conversation by its agent `threadId` via the `by_thread_id` index
- **`public/messages.ts`** (new) — two server functions:
  - `create` action: validates contact session and conversation state (rejects
    resolved conversations), then calls `supportAgent.generateText()` with the
    conversation's `threadId` and the user's `prompt`
  - `getMany` query: validates session, returns paginated messages via
    `supportAgent.listMessages()` (`paginationOptsValidator`)
- **`@ai-sdk/google@1.2.18`**, **`@ai-sdk/openai ^1.3.23`**, **`ai ^4.3.19`**,
  **`@convex-dev/agent ^0.1.16`** added to `packages/backend` dependencies

#### Conversation threading — `packages/backend/convex/public/conversations.ts`

- **`create` mutation** now calls `supportAgent.createThread()` to provision a real
  agent thread (replacing the placeholder `threadId: "123"`), and seeds it with an
  initial assistant greeting ("Hello, how can I help you today?") via
  `saveMessage()` from `@convex-dev/agent`

#### Chat UI — `packages/ui/src/components/ai/`

- Nine new AI Elements components added: `branch`, `conversation` (with
  `AIConversationScrollButton`, powered by `use-stick-to-bottom`), `input`
  (auto-resizing textarea, model `Select`, submit/stop button states), `message`,
  `reasoning` (collapsible chain-of-thought display), `response` (Markdown via
  `react-markdown` + `remark-gfm`), `source`, `suggestion`, `tool`
- **`dropzone.tsx`** (new) — file drop zone built on `react-dropzone`
- New dependencies added to `@workspace/ui`: `react-dropzone ^15.0.0`,
  `react-markdown ^10.1.0`, `remark-gfm ^4.0.1`, `use-stick-to-bottom ^1.1.6`,
  `@radix-ui/react-use-controllable-state ^1.2.3`

#### Widget chat screen — `apps/widget/modules/widget/ui/screens/widget-chat-screen/index.tsx`

- Rebuilt on the new AI Elements components: `AIConversation` /
  `AIConversationContent` render the message list via `toUIMessages()`,
  `AIMessage` / `AIMessageContent` / `AIResponse` render each turn, `AIInput` +
  `react-hook-form` (`zodResolver`) replace the raw form submit handler
- **`useThreadMessages`** (from `@convex-dev/agent/react`) subscribes to
  `api.public.messages.getMany` for the conversation's `threadId`, paginated
  with `initialNumItems: 10`
- Message submission calls `api.public.messages.create` action with the
  conversation's `threadId`, the typed prompt, and `contactSessionId`; form resets
  immediately on submit
- Input and submit button disable when `conversation.status === "resolved"`,
  with placeholder text reflecting the resolved state
- **`@convex-dev/agent ^0.1.18`** added to `apps/widget` dependencies

---

### Fixed

#### Conversations query — `packages/backend/convex/public/conversations.ts`

- **`getOne` — missing conversation** now throws `ConvexError({ code: "NOT_FOUND",
message: "Conversation not found" })` instead of silently returning `null`;
  callers can distinguish a missing document from a network/auth failure
- **`getOne` — ownership check** added: verifies `conversation.contactSessionId ===
session._id` before returning; throws `ConvexError({ code: "UNAUTHORIZED",
message: "Incorrect session" })` if the session does not own the conversation,
  preventing cross-session data leakage

---

### Added

#### Widget selection screen — `apps/widget/modules/widget/ui/screens/widget-selection-screen/`

- **`index.tsx`** — `WidgetSelectionScreen` client component; greets the user
  ("Hi there! 👋 / How can I help you today?") and presents a "Start chat" outline
  button; on click calls `api.public.conversations.create` mutation with
  `contactSessionId` and `organizationId`; on success stores the returned ID in
  `conversationIdAtom` and routes to `"chat"`; guards against missing org/session by
  routing to `"error"` or `"auth"` respectively; `isPending` state disables the
  button while the mutation is in flight

#### Widget chat screen — `apps/widget/modules/widget/ui/screens/widget-chat-screen/`

- **`index.tsx`** — `WidgetChatScreen` client component; queries
  `api.public.conversations.getOne` with `conversationId` + `contactSessionId` (skips
  when either is null); header shows back-arrow `Button` (`variant="transparent"`)
  and menu icon; back button clears `conversationIdAtom` and routes to `"selection"`;
  body currently renders raw `JSON.stringify(conversation)` as a data stub

#### Conversations backend — `packages/backend/convex/`

- **`public/conversations.ts`** (new) — two server functions:
  - `create` mutation: verifies session existence and expiry, inserts a new
    `conversations` document with `status: "unresolved"` and a placeholder
    `threadId: "123"` (to be replaced when thread creation is wired), returns the
    new document ID
  - `getOne` query: verifies session, fetches the conversation document, returns
    `{ _id, status, threadId }` or `null` if not found; throws `ConvexError`
    `UNAUTHORIZED` for invalid/expired sessions
- **`schema.ts`** — `conversations` table added:
  - Fields: `threadId` (string), `organizationId` (string),
    `contactSessionId` (ref to `contactSessions`),
    `status` (union: `"unresolved" | "escalated" | "resolved"`)
  - Indexes: `by_organization_id`, `by_contact_session_id`, `by_thread_id`,
    `by_status_and_organization_id`

#### UI — `packages/ui/src/components/button.tsx`

- **`transparent` variant** added: `bg-transparent text-primary-foreground` with
  hover dim (`hover:text-primary-foreground/80`); used by chat screen header
  buttons rendered over the blue gradient `WidgetHeader`

### Changed

#### Widget atoms — `apps/widget/modules/widget/atoms/widget-atoms/index.ts`

- **`conversationIdAtom`** added: `atom<Id<"conversations"> | null>(null)`; set
  by selection screen on conversation creation, cleared on back navigation

#### Widget view — `apps/widget/modules/widget/ui/views/widget-view/index.tsx`

- `selection` slot wired to `<WidgetSelectionScreen />` (was `<p>TODO: Selection</p>`)
- `chat` slot wired to `<WidgetChatScreen />` (was `<p>TODO: Chat</p>`)

---

#### Widget loading screen — `apps/widget/modules/widget/ui/screens/widget-loading-screen/`

- **`index.tsx`** — `WidgetLoadingScreen` client component; multi-step sequential
  initialisation flow driven by a local `InitStep` state (`"org"` → `"session"` →
  `"done"`):
  - **Step 1 — org validation**: calls `api.public.organizations.validate` action;
    if valid, stores `organizationId` in atom and advances; if invalid or missing,
    sets `errorMessageAtom` and routes to `"error"` screen
  - **Step 2 — session validation**: reads `contactSessionIdAtomFamily(organizationId)`
    from localStorage; if a stored session ID exists calls
    `api.public.contactSessions.validate` mutation to check expiry; advances to
    `"done"` either way
  - **Step 3 — done**: routes to `"selection"` if a valid unexpired session was found,
    otherwise routes to `"auth"` for new contact registration
  - Shows `WidgetHeader` ("We're getting things ready / Just a moment") and a
    spinning `LoaderIcon` with a live `loadingMessage` string updated at each step

#### Widget atoms expansion — `apps/widget/modules/widget/atoms/widget-atoms/index.ts`

- **`organizationIdAtom`** — `atom<string | null>(null)`; set after org validation passes
- **`contactSessionIdAtomFamily`** — `atomFamily` (from `jotai-family`) keyed by
  `organizationId`; each slot is an `atomWithStorage` persisting the session ID
  under `${CONTACT_SESSION_KEY}_${organizationId}` in `localStorage`
- **`errorMessageAtom`** — `atom<string | null>(null)`; consumed by `WidgetErrorScreen`
- **`loadingMessageAtom`** — `atom<string | null>(null)`; updated at each loading step
- **`screenAtom`** initial state changed from `"auth"` to `"loading"` so every visit
  starts the initialisation flow
- **`jotai-family ^1.0.2`** added to widget dependencies; replaces the deprecated
  `atomFamily` export from `jotai/utils`

#### Contact sessions — `packages/backend/convex/public/contactSessions.ts`

- **`validate` mutation** added: accepts a `contactSessionId` (`v.id("contactSessions")`);
  returns `{ valid: false, reason }` if the document is missing or `expiresAt` has
  passed, otherwise returns `{ valid: true, contactSession }`

#### Organizations — `packages/backend/convex/public/organizations.ts`

- **`validate` action** now wraps the Clerk API call in `try/catch`; a missing
  organisation returns `{ valid: false, reason: "Organization not found" }` instead
  of throwing an uncaught `ClerkAPIResponseError`
- **`@clerk/backend ^3.10.0`** added to `packages/backend` dependencies

### Changed

#### Widget auth screen — `apps/widget/modules/widget/ui/screens/widget-auth-screen/index.tsx`

- Removed hardcoded `organizationId = "123"` placeholder; reads `organizationIdAtom`
  via `useAtomValue` instead (set by the loading screen after org validation)
- On successful `createContactSession`, stores the returned ID into
  `contactSessionIdAtomFamily(organizationId)` via `useSetAtom` so subsequent visits
  skip the auth form

#### Widget view — `apps/widget/modules/widget/ui/views/widget-view/index.tsx`

- `error` slot now renders `<WidgetErrorScreen />` (was `<p>TODO: Error</p>`)
- `loading` slot now renders `<WidgetLoadingScreen organizationId={organizationId} />`
  (was `<p>TODO: Loading</p>`)

---

#### Widget state management — `apps/widget/modules/widget/`

- **`constants/index.ts`** — `WIDGET_SCREENS` as-const tuple defining all 8 widget
  screen states: `"error"`, `"loading"`, `"selection"`, `"voice"`, `"auth"`,
  `"inbox"`, `"chat"`, `"contact"`; also exports `CONTACT_SESSION_KEY =
"echo_contact_session"` for local storage keying
- **`types/index.ts`** — `WidgetScreen` type derived from `typeof WIDGET_SCREENS[number]`;
  single source of truth — adding a screen to the constant automatically extends the type
- **`atoms/widget-atoms/index.ts`** — `screenAtom = atom<WidgetScreen>("auth")` — Jotai
  atom managing the currently active widget screen; initial state is `"auth"` so
  unauthenticated visitors land on the contact form
- **`jotai ^2.20.1`** added to `apps/widget` dependencies

#### Providers — `apps/widget/components/theme-provider.tsx`

- Wrapped widget children with Jotai `<Provider>` inside `<ConvexProvider>` so
  all widget components share the same atom store

### Changed

#### Widget view — `apps/widget/modules/widget/ui/views/widget-view/index.tsx`

- Replaced static `<WidgetAuthScreen />` with a screen-routing map driven by
  `useAtomValue(screenAtom)`; maps all 8 `WidgetScreen` values to components
  (stubs in place for `error`, `loading`, `selection`, `voice`, `inbox`, `chat`,
  `contact`; `auth` renders `<WidgetAuthScreen />`)

---

#### Widget auth screen — `apps/widget/modules/widget/ui/screens/widget-auth-screen/`

- **`index.tsx`** — `WidgetAuthScreen` client component; name + email form backed by
  `react-hook-form` with `zodResolver`; on submit collects full browser metadata
  (`userAgent`, `language`, `platform`, `vendor`, `screenResolution`, `viewportSize`,
  `timezone`, `timezoneOffset`, `cookieEnabled`, `referrer`, `currentUrl`) and calls
  `createContactSession` Convex mutation; header renders `WidgetHeader` with greeting
  ("Hi there! 👋 Let's get you started")

#### Contact sessions — `packages/backend/convex/`

- **`public/contactSessions.ts`** — `create` Convex mutation: accepts `name`,
  `email`, `organizationId`, and optional `metadata`; sets a 24-hour expiry
  (`SESSION_DURATION_MS = 24 * 60 * 60 * 1000`) and inserts into the
  `contactSessions` table; returns the new document ID
- **`schema.ts`** — `contactSessions` table added with fields: `name`, `email`,
  `organizationId`, `expiresAt`, and optional `metadata` object (12 browser
  environment properties); indexes: `by_organization_id` and `by_expires_at`

#### UI — `packages/ui/src/components/form.tsx`

- shadcn/ui `Form` component added: wraps `react-hook-form` `FormProvider` with
  `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`,
  `FormMessage` — accessible, slot-based form primitives with error-state styling

#### Widget UI module — `apps/widget/modules/widget/ui/`

- **`views/widget-view/index.tsx`** — `WidgetView` client component; full-viewport
  card layout (`min-h-screen`, `rounded-xl`, `border`, `bg-muted`) composing
  `WidgetHeader` + scrollable body + `WidgetFooter`; accepts `organizationId` prop
  for per-org data loading in subsequent releases
- **`components/widget-header/index.tsx`** — `WidgetHeader` presentational component;
  blue gradient background (`bg-linear-to-b from-primary to-[#0b63f3]`) matching
  the dashboard active-state palette; accepts `children` and optional `className`
- **`components/widget-footer/index.tsx`** — `WidgetFooter` navigation bar with
  full-height (`h-14`) ghost icon buttons for Home and Inbox screens; active icon
  highlights in `text-primary`; `screen` state typed as `"selection" | "inbox"`
  (useState stub, ready for screen-routing wiring)

#### Widget entry point — `apps/widget/app/page.tsx`

- Refactored from inline Vapi debug UI to a clean entry point: unwraps
  `organizationId` from async `searchParams` via React `use()` and delegates
  rendering to `<WidgetView organizationId={organizationId} />`

#### Design system tokens — `packages/ui/src/styles/globals.css`

- **Blue color palette** — primary colour updated from neutral grey to blue
  (`oklch(0.6231 0.188 259.8145)`) across light and dark themes; sidebar primary,
  ring, and chart tokens all aligned to the same blue base
- **Font tokens** — `--font-sans` (Inter), `--font-serif` (Source Serif 4),
  `--font-mono` (JetBrains Mono) added to `:root` and `.dark` and mapped in
  `@theme inline`
- **Shadow tokens** — `--shadow-2xs` through `--shadow-2xl` added to `:root` and
  `.dark` and mapped in `@theme inline`
- **Base layer** — `cursor: pointer` applied globally to `button:not([disabled])`
  and `[role="button"]:not([disabled])`; `letter-spacing: var(--tracking-normal)`
  and `font-weight: 500` set on `body`

#### Sidebar active-state highlighting — `apps/web/modules/dashboard/ui/components/dashboard-sidebar/`

- Active nav items now render a `bg-linear-to-b from-sidebar-primary to-[#0b63f3]`
  gradient with `text-sidebar-primary-foreground` applied via `cn()` across all
  three sidebar nav groups (Customer Support, Configuration, Account)

### Changed

#### Widget view — `apps/widget/modules/widget/ui/views/widget-view/index.tsx`

- Replaced `WidgetHeader` + body + `WidgetFooter` composition with `<WidgetAuthScreen />`
  as the first screen shown to unauthenticated widget visitors

#### Widget footer — `apps/widget/modules/widget/ui/components/widget-footer/index.tsx`

- Simplified `InboxIcon` — removed premature active-state logic; icon styling
  will be driven by screen-routing state in a future release

#### Widget dependencies — `apps/widget/package.json`

- Added `react-hook-form ^7.80.0`, `zod ^3.25.76`, `@hookform/resolvers ^3.10.0`
  (v3 line used to match zod v3; v5 resolver requires the zod v4 sub-path export)

#### Vapi integration — `apps/widget/modules/widget/hooks/use-vapi.ts`

- Hardcoded public Vapi API key and assistant ID removed; callers must supply
  keys via environment configuration (values set to empty string placeholders)

---

## [0.6.0] - 2026-07-02

### Overview

This release introduces the **Dashboard module** — a full sidebar-driven layout with
Clerk-integrated navigation, six stub pages for the core product surfaces, and a
major expansion of the `@workspace/ui` component library to 40+ shadcn/ui components.

---

### Added

#### Dashboard module — `apps/web/modules/dashboard/`

- **`ui/layouts/dashboard-layout/index.tsx`** — `DashboardLayout` server component;
  reads `sidebar_state` cookie for SSR-persisted open/closed state, composes
  `AuthGuard` + `OrganizationGuard` + `SidebarProvider` + `DashboardSidebar` + `main`
  into a single reusable layout
- **`ui/components/dashboard-sidebar/index.tsx`** — `DashboardSidebar` client
  component with full three-section nav:
  - **Header** — `OrganizationSwitcher` inside `SidebarMenuButton asChild` with
    custom Clerk `appearance` for sidebar-width and icon-collapse states
  - **Content** — three `SidebarGroup` sections: Customer Support
    (Conversations, Knowledge Base), Configuration (Widget Customization,
    Integrations, Voice Assistant), Account (Plans & Billing); each item uses
    `SidebarMenuButton asChild` wrapping a Next.js `<Link>` with active-state
    detection via `usePathname`
  - **Footer** — `UserButton showName` with custom Clerk `appearance` for
    sidebar-width and icon-collapse layout
  - **Rail** — `SidebarRail` for drag-to-resize; `collapsible="icon"` mode

#### Dashboard pages — `apps/web/app/(dashboard)/`

Six stub pages scaffolded for the core product surfaces:

| Route            | File                     | Section          |
| ---------------- | ------------------------ | ---------------- |
| `/conversations` | `conversations/page.tsx` | Customer Support |
| `/files`         | `files/page.tsx`         | Knowledge Base   |
| `/customization` | `customization/page.tsx` | Configuration    |
| `/integrations`  | `integrations/page.tsx`  | Configuration    |
| `/plugins/vapi`  | `plugins/vapi/page.tsx`  | Voice Assistant  |
| `/billing`       | `billing/page.tsx`       | Account          |

#### UI component library expansion — `packages/ui`

40+ new shadcn/ui components added to `@workspace/ui`:

`accordion` · `alert-dialog` · `alert` · `aspect-ratio` · `avatar` · `badge` ·
`breadcrumb` · `calendar` · `card` · `carousel` · `chart` · `checkbox` ·
`collapsible` · `command` · `context-menu` · `dialog` · `drawer` ·
`dropdown-menu` · `empty` · `field` · `hover-card` · `input-group` · `input-otp` ·
`kbd` · `label` · `menubar` · `message` · `native-select` · `navigation-menu` ·
`pagination` · `popover` · `progress` · `radio-group` · `resizable` ·
`scroll-area` · `select` · `separator` · `sheet` · `sidebar` · `skeleton` ·
`slider` · `sonner` · `spinner` · `switch` · `table` · `tabs` · `textarea` ·
`toggle-group` · `toggle` · `tooltip`

Also added: `hooks/use-mobile.ts` — `useIsMobile` hook used by the sidebar for
tooltip/collapse behaviour.

New Radix UI primitives added to `packages/ui`:
`react-accordion`, `react-alert-dialog`, `react-aspect-ratio`, `react-avatar`,
`react-checkbox`, `react-collapsible`, `react-context-menu`, `react-dialog`,
`react-dropdown-menu`, `react-hover-card`, `react-label`, `react-menubar`,
`react-navigation-menu`, `react-popover`, `react-progress`, `react-radio-group`,
`react-scroll-area`, `react-select`, `react-separator`, `react-slider`,
`react-switch`, `react-tabs`, `react-toggle`, `react-toggle-group`, `react-tooltip`

New peer dependencies added to `apps/web`:
`@base-ui/react`, `@shadcn/react`, `cmdk`, `date-fns`, `embla-carousel-react`,
`input-otp`, `react-day-picker`, `react-resizable-panels`, `recharts`, `sonner`, `vaul`

---

### Changed

#### App router — `apps/web/app/(dashboard)/layout.tsx`

- Replaced inline `AuthGuard` + `OrganizationGuard` composition with a single
  `<DashboardLayout>` import, moving all layout concerns into the dashboard module.
  The app route file is now a thin delegation wrapper.

#### Core UI — `packages/ui`

- **`button.tsx`** — rewritten with updated variant/size tokens and class structure
  matching the expanded design system
- **`input.tsx`** — updated to align with new design token naming
- **`styles/globals.css`** — major update: new CSS custom property design tokens for
  sidebar, chart palette, and extended color scales; Tailwind v4 layer structure

---

### Technical Decisions

- **Module-based architecture for dashboard** — `DashboardLayout` and
  `DashboardSidebar` live under `modules/dashboard/ui/` rather than in `app/`, keeping
  the app directory as a thin routing layer and making both components independently
  testable and reusable.
- **Cookie-persisted sidebar state** — `sidebar_state` is read server-side in
  `DashboardLayout` so the sidebar open/closed state survives hard refreshes without
  layout shift.
- **Stub pages** — all six dashboard routes are scaffolded as minimal stubs; content
  will be filled in by subsequent feature releases.

---

## [0.5.1] - 2026-07-01

### Overview

This release adds **Vapi AI** voice call integration to `apps/widget`, enabling
real-time voice conversations powered by a VapiBank phone support demo agent.

---

### Added

#### Vapi AI voice integration — `apps/widget`

- **`@vapi-ai/web ^2.5.2`** added to `apps/widget` dependencies
- **`modules/widget/hooks/use-vapi.ts`** — `useVapi` custom React hook that wraps
  the `@vapi-ai/web` SDK with fully managed React state:
  - `isConnected` / `isConnecting` / `isSpeaking` — granular call phase tracking
  - `transcript` — accumulated `TranscriptMessage[]` array built from final
    transcript events (`message.transcriptType === "final"`)
  - Event subscriptions: `call-start`, `call-end`, `speech-start`, `speech-end`,
    `error`, `message`; Vapi instance torn down in useEffect cleanup (`vapiInstance.stop()`)
  - Exposes `startCall()` and `endCall()` actions for the UI layer
- **`app/page.tsx`** — widget home replaced with Vapi call UI: "Start call" and
  "End call" (destructive variant) buttons, live `isConnected` / `isConnecting` /
  `isSpeaking` indicators, and a live transcript panel using `JSON.stringify`

#### VapiBank demo assets — `assets/VAPI/`

- **`system-prompt.txt`** — system prompt for **Tom**, VapiBank's 24/7 phone
  support voice assistant (identity, conversation flow, tool usage, style guidelines,
  edge cases)
- **`accounts.csv`** — mock account data (`account_id`, `name`, `phone_last4`,
  `balance`, `card_status`, `email`)
- **`transactions.csv`** — mock transaction history for all demo accounts
- **`lookup-account.txt`** — tool definition: verifies caller identity by last 4
  digits of phone number
- **`balance-tool.txt`** — tool definition: retrieves current balance for a
  verified account
- **`recent-transactions.txt`** — tool definition: retrieves recent transaction
  history for a verified account
- **`first-message.txt`** — opening greeting script for Tom

---

### Changed

#### Widget home page

- **`apps/widget/app/page.tsx`** — replaced the Convex users query/mutation test
  UI with the Vapi voice call interface. The widget app is now purpose-built for
  the voice assistant demo rather than a generic data test harness.

---

### Technical Decisions

- **`useVapi` hook isolation** — all Vapi SDK concerns (event subscription, instance
  lifecycle, state management) are encapsulated in the hook, keeping the page
  component a thin UI layer with no direct SDK imports.
- **Assets in repo** — the `assets/VAPI/` directory holds the VapiBank demo
  configuration (prompts, tool definitions, mock data) alongside the code so the
  assistant setup is reproducible without external documentation.

---

## [0.5.0] - 2026-07-01

### Overview

This release adds **Sentry** error monitoring and performance tracing to `apps/web`,
covering client, server, and edge runtimes, plus session replay on error.

---

### Added

#### Sentry integration — `apps/web`

- **`@sentry/nextjs ^10.62.0`** added to `apps/web` dependencies
- **`instrumentation.ts`** — Next.js instrumentation hook; loads `sentry.server.config`
  or `sentry.edge.config` based on `NEXT_RUNTIME`, and exports `onRequestError` for
  server-side error capture
- **`instrumentation-client.ts`** — client-side Sentry init with `replayIntegration`,
  trace sampling, session replay (10% normal, 100% on error), and router transition
  tracking via `onRouterTransitionStart`
- **`sentry.server.config.ts`** / **`sentry.edge.config.ts`** — runtime-specific Sentry
  init for the Node.js and edge runtimes, with logging and PII enabled
- **`app/global-error.tsx`** — root error boundary that reports uncaught errors to
  Sentry via `Sentry.captureException` before rendering the default Next.js error page
- **`app/sentry-example-page/`** and **`app/api/sentry-example-api/`** — Sentry's
  example test page and API route for verifying the integration end-to-end (frontend
  - backend error capture, span tracing, connectivity diagnostics)
- **`next.config.ts`** — wrapped with `withSentryConfig`; uploads source maps in CI,
  tunnels client requests through `/monitoring` to bypass ad-blockers, and enables
  automatic Vercel Cron Monitor instrumentation
- **`.npmrc`** — added `public-hoist-pattern` entries for `import-in-the-middle` and
  `require-in-the-middle`, required by Sentry's OpenTelemetry-based auto-instrumentation
  under pnpm's strict node_modules layout
- **`.mcp.json`** — Sentry MCP server config for `apps/web`, enabling Sentry tools
  (issue lookup, event search) directly from the editor
- **`.gitignore`** — excludes `.env.sentry-build-plugin` (local Sentry auth token for
  source map uploads)

#### Tooling

- **`turbo.json`** — declared `NEXT_RUNTIME` and `CI` as build-task env var
  dependencies, fixing `turbo/no-undeclared-env-vars` lint warnings introduced by the
  Sentry instrumentation and config files

---

### Technical Decisions

- **DSN hardcoded in client config** — Sentry DSNs are public identifiers by design
  (not secrets), safe to commit directly in `instrumentation-client.ts`,
  `sentry.server.config.ts`, and `sentry.edge.config.ts`.
- **Source maps uploaded only in CI** — `silent: !process.env.CI` in `next.config.ts`
  keeps local builds quiet while still uploading readable stack traces from CI builds.
- **`tunnelRoute: "/monitoring"`** — routes client-side error reports through the
  Next.js server first, avoiding ad-blockers that block direct requests to Sentry's
  ingest endpoint.

---

## [0.4.1] - 2026-07-01

### Fixed

#### Convex backend — `packages/backend`

- **`convex/users.ts`** — `add` mutation now reads `identity.orgId` after the
  existing `getUserIdentity()` check and throws `"Missing organization"` when the
  caller has no active Clerk organization. Completes the three-layer org enforcement
  introduced in v0.4.0:
  1. `proxy.ts` middleware redirect (server, before page load)
  2. `OrganizationGuard` component (client, at layout level)
  3. Convex mutation check (server, at data layer) ← added here

#### CI

- **`.github/workflows/pr-title.yml`** — added `backend` to the allowed PR title
  scopes so that commits targeting `packages/backend` can use the `(backend)` scope
  in Conventional Commits format

---

## [0.4.0] - 2026-07-01

### Overview

This release adds **Clerk Organizations** support and refactors the auth layer into a
module-based architecture under `apps/web/modules/`. Authentication and organization
membership are now enforced at the layout level via reusable guard components, and all
auth views are isolated into purpose-built view modules rather than living directly in
the app directory.

---

### Added

#### Clerk Organizations

- **`app/(auth)/org-selection/[[...org-selection]]/page.tsx`** — catch-all page for
  the Clerk organization selection flow; renders `OrgSelectionView`
- **`modules/auth/ui/views/org-selection-view/index.tsx`** — `OrgSelectionView` wrapping
  Clerk's `<OrganizationList>` with `hidePersonal`, `skipInvitationScreen`, and
  post-selection redirect to `/`
- **`modules/auth/ui/components/organization-guard/index.tsx`** — `OrganizationGuard`
  client component; uses `useOrganization()` from `@clerk/nextjs` to detect whether the
  current user has an active organization. Renders `OrgSelectionView` within `AuthLayout`
  when no organization is selected, otherwise renders children

#### Module-based auth architecture — `apps/web/modules/`

- **`modules/auth/ui/layouts/auth-layout/index.tsx`** — `AuthLayout` component; full-screen
  centered wrapper for all auth pages
- **`modules/auth/ui/views/sign-in-view/index.tsx`** — `SignInView` rendering
  `<SignIn routing="hash" />` (hash routing prevents full-page navigations on multi-step flows)
- **`modules/auth/ui/views/sign-up-view/index.tsx`** — `SignUpView` rendering
  `<SignUp routing="hash" />`
- **`modules/auth/ui/components/auth-guard/index.tsx`** — `AuthGuard` client component;
  uses Convex `<Authenticated>`, `<Unauthenticated>`, and `<AuthLoading>` guards to
  conditionally render children, a loading state, or the `SignInView` without redirecting

#### Dashboard layout with guard composition

- **`app/(dashboard)/layout.tsx`** — layout for all dashboard routes; composes
  `<AuthGuard>` (Convex session check) wrapping `<OrganizationGuard>` (Clerk org check)
  so both conditions must be satisfied before any dashboard page renders
- **`app/(dashboard)/page.tsx`** — dashboard home; shows `<UserButton />`,
  `<OrganizationSwitcher hidePersonal />`, Convex `useQuery`/`useMutation` for the users
  table, and an Add button

---

### Changed

#### Auth pages refactored to module views

- **`app/(auth)/layout.tsx`** — replaced inline centering div with `<AuthLayout>` from
  modules, centralising auth page layout in one place
- **`app/(auth)/sign-in/[[...sign-in]]/page.tsx`** — replaced inline `<SignIn />` with
  `<SignInView />` from modules
- **`app/(auth)/sign-up/[[...sign-up]]/page.tsx`** — replaced inline `<SignUp />` with
  `<SignUpView />` from modules

#### Middleware — org redirect logic

- **`proxy.ts`** — extended `clerkMiddleware` with organization enforcement:
  - Added `isOrgFreeRoute` matcher covering `/sign-in(.*)`, `/sign-up(.*)`,
    `/org-selection(.*)`
  - After auth protection, authenticated users without an active `orgId` are redirected
    to `/org-selection?redirectUrl=<original>` unless they are already on an org-free route

#### Dashboard page replaces old app root

- **`app/page.tsx`** — deleted; the application root is now `app/(dashboard)/page.tsx`
  inside the `(dashboard)` route group. The `/` URL maps to the dashboard after auth
  and org guards pass.

---

### Technical Decisions

- **Module-based architecture over flat app directory** — co-locating views, layouts, and
  guard components under `modules/auth/ui/` makes each auth concern independently testable
  and keeps the app directory as a thin routing layer.
- **`routing="hash"` on Clerk components** — prevents Clerk's multi-step sign-in/sign-up
  flows from triggering full Next.js navigations; state is tracked in the URL hash instead.
- **Guard composition at layout level** — `AuthGuard` + `OrganizationGuard` in
  `(dashboard)/layout.tsx` means every dashboard route automatically inherits both
  protection layers without per-page checks.
- **Middleware redirect vs. guard-only** — the `proxy.ts` redirect handles the server-side
  case (direct URL navigation without a Clerk session context in React), while
  `OrganizationGuard` handles the client-side case (org changed or deselected after page
  load).

---

## [0.3.0] - 2026-06-30

### Overview

This release integrates **Clerk** as the authentication provider for `apps/web`,
wired directly into the Convex real-time backend via `ConvexProviderWithClerk`.
Authentication is enforced at both the UI layer (Next.js 16 proxy middleware) and
the backend layer (Convex mutation identity checks).

---

### Added

#### Clerk authentication — `apps/web`

- **`@clerk/nextjs ^7.5.9`** added to `apps/web` dependencies
- **`app/layout.tsx`** — `ClerkProvider` wraps the entire application, providing
  Clerk session context to all pages and components
- **`proxy.ts`** (Next.js 16 middleware filename) — `clerkMiddleware()` protects all
  routes by default; public routes `/sign-in(.*)` and `/sign-up(.*)` are exempt
- **`app/(auth)/layout.tsx`** — centered layout for all auth pages
- **`app/(auth)/sign-in/[[...sign-in]]/page.tsx`** — Clerk hosted `<SignIn />` component
  with catch-all routing for multi-step sign-in flows
- **`app/(auth)/sign-up/[[...sign-up]]/page.tsx`** — Clerk hosted `<SignUp />` component
  with catch-all routing for multi-step sign-up flows
- **`app/page.tsx`** — `<Authenticated>` / `<Unauthenticated>` guards from Convex;
  authenticated view shows `<UserButton />` and the Add user mutation button;
  unauthenticated view shows `<SignInButton />`

#### Convex + Clerk session bridging

- **`components/theme-provider.tsx`** — replaced bare `ConvexProvider` with
  `ConvexProviderWithClerk` (from `convex/react-clerk`), passing `useAuth` from
  `@clerk/nextjs` so Convex automatically includes the active Clerk JWT in all
  function calls. Removed dead `ThemeHotkey`, `isTypingTarget`, `NextThemesProvider`,
  and `useTheme` code that was leftover from the previous provider setup.

#### Convex backend auth hardening — `packages/backend`

- **`convex/auth.config.ts`** — Clerk JWT provider configuration; reads
  `CLERK_JWT_ISSUER_DOMAIN` from the Convex Dashboard environment. Uses
  `/// <reference types="node" />` because this file runs in Node.js (Convex CLI),
  not the V8 function isolate runtime.
- **`convex/users.ts`** — `add` mutation now calls `ctx.auth.getUserIdentity()` and
  throws `"Not Authenticated"` for unauthenticated callers, preventing anonymous
  writes to the users table.
- **`package.json`** — added `@types/node ^20.19.41` dev dependency

---

### Fixed

- **`packages/backend/tsconfig.json`** — removed deprecated `baseUrl` compiler option.
  In TypeScript 5+, `paths` does not require `baseUrl` to be set; the option was
  flagged as deprecated in TS 5.0 and will stop functioning in TS 7.0.

---

### Changed

- **`apps/widget/components/theme-provider.tsx`** — removed dead `ThemeHotkey`,
  `isTypingTarget`, `NextThemesProvider`, and `useTheme` code, matching the cleanup
  done in `apps/web`.

#### CI/tooling

- `ci.yml`, `release.yml`, `codeql.yml` — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` added
  to the build step environment, reading from the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  GitHub repository variable. This prevents `ClerkProvider` from throwing during
  `next build` in CI environments where `.env.local` is absent.

---

### Technical Decisions

- **`ConvexProviderWithClerk` over manual token injection** — Convex's official Clerk
  integration handles token refresh, expiry, and re-auth automatically. Manual token
  passing would require re-implementing this logic.
- **Middleware-level route protection** — protecting routes at the `proxy.ts` layer
  means unauthenticated users are redirected before any page code runs, not just
  hidden by client-side conditionals.
- **`ctx.auth.getUserIdentity()` in mutations** — server-side auth checks are the last
  line of defence; even if middleware is bypassed, mutations reject unauthenticated calls.
- **`proxy.ts` (not `middleware.ts`)** — Next.js 16 renamed the middleware file from
  `middleware.ts` to `proxy.ts`. The code API is identical; only the filename changed.

---

## [0.2.0] - 2026-06-29

### Overview

This release integrates **Convex** as the real-time backend for the Echo monorepo.
A new `@workspace/backend` package encapsulates all Convex schema definitions and
server-side functions, and both `apps/web` and `apps/widget` are wired to the live
Convex deployment via `ConvexProvider` and the generated TypeScript API.

---

### Added

#### `packages/backend` — New Convex workspace package

- Scaffolded `@workspace/backend` as a dedicated Convex workspace package
- `convex/schema.ts` — database schema with a `users` table (`name: string`) defined
  using Convex's `defineSchema` and `defineTable` helpers
- `convex/users.ts` — two server functions:
  - `getMany` — `query` that fetches all users from the database
  - `add` — `mutation` that inserts a new user record (`name: "RISHII"`)
- `convex/_generated/` — committed auto-generated TypeScript API types (`api.d.ts`,
  `api.js`, `dataModel.d.ts`, `server.d.ts`, `server.js`) for full type safety across
  the monorepo without requiring a running Convex dev server in CI
- `package.json` — workspace package definition (`name: @workspace/backend`,
  `convex: ^1.42.0` runtime dependency, `dev` and `setup` scripts)
- `tsconfig.json` — TypeScript configuration extending `@workspace/typescript-config`
- `.gitignore` — excludes `.env.local` (contains deployment secrets)
- `convex/README.md` — Convex-generated quickstart guide (excluded from Prettier)

#### Convex client integration in `apps/web` and `apps/widget`

- Added `@workspace/backend: workspace:*` and `convex: ^1.42.0` to both app
  `package.json` files
- Added `@workspace/backend/*` TypeScript path alias in both `tsconfig.json` files,
  pointing to `packages/backend/convex/*` for generated API type imports
- `components/theme-provider.tsx` — replaced static `NextThemesProvider` wrapper with
  `ConvexProvider` backed by `ConvexReactClient`, reading from `NEXT_PUBLIC_CONVEX_URL`
  environment variable
- `app/page.tsx` — replaced static math function demo with live Convex hooks:
  - `useQuery(api.users.getMany)` — subscribes to real-time user list
  - `useMutation(api.users.add)` — triggers user insertion via a button click

#### CI/tooling improvements

- Added `NEXT_PUBLIC_CONVEX_URL` environment variable to the `build` step in
  `ci.yml`, `release.yml`, and `codeql.yml` — required for `ConvexReactClient`
  to initialise with a valid URL during `next build` in CI environments
- Added `packages/backend/convex/_generated/` and `packages/backend/convex/README.md`
  to `.prettierignore` — auto-generated files should not be subject to formatting rules

---

### Technical Decisions

- **`convex/_generated/` committed to source control** — Generated API types provide
  full TypeScript safety across the monorepo without requiring every developer to run
  `convex dev` before getting type completions. Files are excluded from Prettier.
- **`ConvexProvider` in theme-provider** — Centralises the Convex client provider at
  the layout level so all pages and components have access to real-time hooks without
  additional wrapper boilerplate.
- **`NEXT_PUBLIC_CONVEX_URL` as build-time env** — Convex's React client requires a
  valid URL at module initialisation; adding it to CI workflows prevents static page
  prerender failures in environments where `.env.local` is not present.

---

## [0.1.1] - 2026-06-28

### Fixed

- **CI: pnpm version conflict** — Removed hardcoded `PNPM_VERSION: "10.13.1"` env var
  from `ci.yml`, `release.yml`, and `codeql.yml`. `pnpm/action-setup@v4` now reads the
  version directly from `packageManager` in `package.json` (`pnpm@10.33.4`), eliminating
  the `ERR_PNPM_BAD_PM_VERSION` error that caused all CI runs to fail on Setup pnpm step.
- **CI: format-check command** — Replaced `pnpm format --check` (which incorrectly passed
  `--check` to Turbo, an invalid flag) with `pnpm exec prettier --check` to invoke Prettier
  directly, making the Format Check job functional.
- **CI: Dependabot PR title failures** — Added `if: github.actor != 'dependabot[bot]'`
  guard to `pr-title.yml` so Conventional Commits validation is skipped on automated
  Dependabot PRs, which use their own title format.
- **Formatting** — Applied Prettier auto-formatting across 18 files to satisfy the now-
  working format-check CI job. No logic changes — whitespace, quotes, and trailing newlines only.

---

## [0.1.0] - 2026-06-28

### Overview

Initial release of **Echo** — an enterprise-grade full-stack monorepo platform. This release establishes the complete project foundation: application architecture, shared packages, developer tooling, CI/CD pipelines, and all GitHub repository governance files.

---

### Added

#### Monorepo Architecture

- Initialized Turborepo 2 monorepo with workspace dependency graph and parallel task execution
- Configured `turbo.json` with `build`, `dev`, `lint`, `typecheck`, and `format` task pipelines
- Set up `pnpm-workspace.yaml` with `apps/*` and `packages/*` glob patterns
- Pinned `packageManager` to `pnpm@10.33.4` in root `package.json`
- Set Node.js engine requirement `>=20` in root `package.json`

#### Applications

- **`apps/web`** — Next.js 16 (App Router) web application
  - Configured with Turbopack (`next dev --turbopack`) for fast local development
  - React 19.2.4 with Server Components support enabled
  - Tailwind CSS v4 with `@tailwindcss/postcss` integration
  - `next-themes` for dark/light mode support
  - Lucide React 1.21.0 icon library
  - TypeScript 5 with strict mode via shared `@workspace/typescript-config`
  - ESLint 9 via shared `@workspace/eslint-config`
  - `components.json` for shadcn/ui component registration
- **`apps/widget`** — Embeddable widget application scaffold

#### Shared Packages

- **`packages/ui`** — Shared component library
  - Built on shadcn/ui primitives and Radix UI
  - Nova preset (Geist font + Lucide icons)
  - Base component library configuration
  - Global styles with CSS custom properties for theming
  - Exports via `@workspace/ui/components/*` path aliases
- **`packages/math`** — Shared math and utility functions workspace
- **`packages/eslint-config`** — Shared ESLint configuration
  - `base.js` — Universal rules
  - `next.js` — Next.js specific rules
  - `react-internal.js` — Internal React library rules
- **`packages/typescript-config`** — Shared TypeScript configuration
  - `base.json` — Strict universal settings
  - `nextjs.json` — Next.js app settings
  - `react-library.json` — Shared React library settings

#### Developer Tooling

- Prettier 3.8.3 with `prettier-plugin-tailwindcss` for class sorting
- `.prettierrc` and `.prettierignore` at repository root
- `.eslintrc.js` at repository root
- `.npmrc` for pnpm configuration
- `.gitignore` covering Node.js, Next.js, Turborepo, OS, and editor artifacts

#### GitHub Repository Governance

- **`LICENSE`** — MIT License (Copyright 2026 Rishikesh Palande)
- **`README.md`** — Full project documentation including:
  - CI, CodeQL, license, Node, pnpm, TypeScript, Next.js, Turborepo, Tailwind, and PRs badges
  - Architecture overview with directory tree
  - Complete tech stack table
  - Prerequisites and installation guide
  - Development commands reference
  - Git Flow branch strategy table
  - Conventional Commits reference with all types and scopes
  - Full project structure tree
  - Package API documentation
  - Vercel deployment guide with one-click deploy button
- **`CHANGELOG.md`** — This file, following Keep a Changelog format
- **`CODE_OF_CONDUCT.md`** — Contributor Covenant v2.1 with enforcement guidelines and four-tier consequence framework
- **`CONTRIBUTING.md`** — Comprehensive contribution guide covering:
  - Fork and clone workflow with upstream remote setup
  - Prerequisites and fnm Node version management setup
  - VS Code recommended extensions
  - Branch naming conventions with full table
  - Conventional Commits format with types, scopes, and breaking change syntax
  - PR guidelines: title format, size limits, target branch rules
  - TypeScript, React, and naming code style standards
  - Testing guidance
  - Review process and timeline
  - Release and versioning process
- **`SECURITY.md`** — Full security policy with:
  - Supported versions table
  - Private vulnerability reporting instructions
  - 48-hour acknowledgement SLA
  - Severity-based response time tiers (Critical → Low)
  - Coordinated disclosure policy
  - Security best practices for contributors
  - Automated tooling inventory (CodeQL, Dependabot, Secret Scanning, Branch Protection)

#### GitHub Actions Workflows

- **`ci.yml`** — Continuous Integration pipeline
  - Triggers on push and PR to `main` and `develop`
  - Concurrent run cancellation to avoid redundant builds
  - Four independent jobs: `lint`, `typecheck`, `format-check`, `build`
  - `build` job gates on `lint` and `typecheck` passing
  - Build artifact upload (7-day retention)
  - Pinned to Node 22.15.1 and pnpm 10.13.1
- **`release.yml`** — Automated release pipeline
  - Triggers on `v*.*.*` tag push
  - Version format validation with regex check
  - Full CI gate before release creation
  - GitHub Release with auto-generated release notes
  - Pre-release detection from semver pre-release identifiers
- **`codeql.yml`** — Security analysis
  - Triggers on push/PR to `main`/`develop` and weekly on Mondays at 03:00 UTC
  - `javascript-typescript` language matrix
  - `security-extended` and `security-and-quality` query suites
- **`stale.yml`** — Stale issue and PR management
  - Issues: stale after 30 days, closed after 14 more
  - PRs: stale after 14 days, closed after 7 more
  - Exempt labels: `pinned`, `security`, `in-progress`, `blocked`, `help-wanted`
  - Exempt all milestoned issues and PRs
  - Runs weekly on Mondays at 09:00 UTC
- **`pr-title.yml`** — PR title validation
  - Enforces Conventional Commits format on every PR open/edit/sync
  - Validates all 11 commit types and 10 project scopes
  - Posts sticky failure comment with examples on invalid titles
  - Auto-clears failure comment when title is corrected

#### GitHub Configuration Files

- **`.github/CODEOWNERS`** — Automatic review assignment for all paths, with special entries for workflows and security files
- **`.github/dependabot.yml`** — Automated dependency updates
  - 5 update targets: root, `apps/web`, `apps/widget`, `packages/ui`, GitHub Actions
  - Weekly schedule on Monday/Tuesday/Wednesday at 09:00 IST
  - Groups dev/production dependencies separately
  - Blocks major version bumps automatically
  - Labels all PRs with `dependencies` and `automated`
- **`.github/ISSUE_TEMPLATE/bug_report.yml`** — Structured bug report with version, affected area, reproduction steps, expected/actual behavior, and environment fields
- **`.github/ISSUE_TEMPLATE/feature_request.yml`** — Feature request with problem statement, proposed solution, alternatives, and priority fields
- **`.github/ISSUE_TEMPLATE/question.yml`** — Question template
- **`.github/ISSUE_TEMPLATE/config.yml`** — Disables blank issues; links to Discussions and Security Policy
- **`.github/PULL_REQUEST_TEMPLATE.md`** — Full PR template with type checklist, change list, screenshots section, testing checklist, and contribution checklist

---

### Technical Decisions

- **Next.js 16 over 15** — Access to latest App Router improvements and React 19 stable APIs
- **Tailwind CSS v4** — New Vite-native engine, CSS-first configuration, improved performance
- **pnpm over npm/yarn** — Strict dependency resolution, disk-efficient symlink store, workspace protocol support
- **Turborepo over Nx** — Zero-config caching, simpler pipeline DSL, native pnpm workspace support
- **shadcn/ui over full component libraries** — Copy-owned components, no runtime dependency, full customisability
- **Conventional Commits** — Machine-readable commit history enables automated changelogs and semver bumps

---

[Unreleased]: https://github.com/RISHII7/echo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/RISHII7/echo/compare/v0.6.0...v1.0.0
[0.6.0]: https://github.com/RISHII7/echo/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/RISHII7/echo/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/RISHII7/echo/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/RISHII7/echo/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/RISHII7/echo/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/RISHII7/echo/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/RISHII7/echo/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/RISHII7/echo/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/RISHII7/echo/releases/tag/v0.1.0
