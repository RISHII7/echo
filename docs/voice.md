# Voice (Vapi)

Echo integrates [Vapi](https://vapi.ai) to offer **live voice conversations** inside the widget, plus a tap‑to‑call phone option. This doc covers how an organization connects Vapi, how credentials are secured, and the call lifecycle.

---

## Table of Contents

- [Overview](#overview)
- [Connecting Vapi (dashboard)](#connecting-vapi-dashboard)
- [Secret handling](#secret-handling)
- [Widget voice call lifecycle](#widget-voice-call-lifecycle)
- [The contact (phone) screen](#the-contact-phone-screen)
- [Managing assistants & numbers](#managing-assistants--numbers)
- [Security model](#security-model)

---

## Overview

Voice is a **Pro‑tier, opt‑in plugin**. When an organization connects Vapi and configures an assistant in Widget Customization, the widget's selection screen surfaces **"Start voice call"** (and **"Call us"** if a phone number is set).

```mermaid
flowchart LR
    connect["Dashboard:<br/>connect Vapi keys"] --> aws[("AWS Secrets Manager")]
    connect --> plugin["plugins row (service: vapi)"]
    customize["Dashboard:<br/>pick assistant + number"] --> ws["widgetSettings.vapiSettings"]
    aws --> widget["Widget fetches PUBLIC key"]
    ws --> widget
    widget --> call["Live voice call"]

    style aws fill:#fff7ed,stroke:#f59e0b
```

---

## Connecting Vapi (dashboard)

On the **Plugins → Vapi** page, an operator connects Vapi by submitting a **public** and **private** API key. The form calls `private/secrets.upsert`, which schedules the encrypted write.

```mermaid
sequenceDiagram
    autonumber
    participant Op as Operator
    participant Form as VapiView form
    participant Priv as private/secrets.upsert
    participant Sys as system/secrets.upsert
    participant AWS as AWS Secrets Manager
    participant DB

    Op->>Form: enter public + private API keys
    Form->>Priv: upsert(service: "vapi", value)
    Priv->>Priv: verify identity + orgId
    Priv->>Sys: scheduler.runAfter(0, upsert, …)  %% mutations can't call actions directly
    Sys->>AWS: create/put secret "tenant/{org}/vapi"
    Sys->>DB: plugins.upsert(org, service, secretName)
```

Mutations can't perform external I/O directly, so `private/secrets.upsert` **schedules** the internal action `system/secrets.upsert`, which does the AWS write and records the `plugins` row.

---

## Secret handling

Credentials never touch the database or the browser in plaintext:

| Where                      | What's stored                                                       |
| -------------------------- | ------------------------------------------------------------------- |
| **AWS Secrets Manager**    | `{ publicApiKey, privateApiKey }` at `tenant/{organizationId}/vapi` |
| **Convex `plugins` table** | Only the `secretName` (a pointer), plus org + service               |
| **Widget**                 | Only the **public** key, fetched at load                            |
| **Backend actions**        | The **private** key, in memory, only when calling Vapi's server SDK |

`system/secrets.ts` uses `upsertSecret` (create, falling back to update on `ResourceExistsException`) from [`lib/secrets.ts`](../packages/backend/convex/lib/secrets.ts).

---

## Widget voice call lifecycle

When the widget loads, `WidgetLoadingScreen` fetches the org's **public** Vapi key via `public/secrets.getVapiSecrets` (which returns _only_ the public key). If present, `hasVapiSecretsAtom` unlocks the voice option.

```mermaid
sequenceDiagram
    autonumber
    participant Widget
    participant Secrets as public/secrets.getVapiSecrets
    participant AWS
    participant Vapi as Vapi (web client)

    Widget->>Secrets: getVapiSecrets(orgId)
    Secrets->>AWS: decrypt tenant/{org}/vapi
    AWS-->>Secrets: { publicApiKey, privateApiKey }
    Secrets-->>Widget: { publicApiKey }   %% private key withheld
    Note over Widget: user opens Voice screen
    Widget->>Vapi: new Vapi(publicApiKey)
    Widget->>Vapi: vapi.start(vapiSettings.assistantId)
    Vapi-->>Widget: call-start · speech-start/end · transcript · call-end
```

The `useVapi` hook ([`apps/widget/modules/widget/hooks/use-vapi.ts`](../apps/widget/modules/widget/hooks/use-vapi.ts)) manages the client and exposes `isConnected`, `isConnecting`, `isSpeaking`, `transcript`, `startCall`, and `endCall`. `WidgetVoiceScreen` renders:

- A **live transcript** (or an empty "transcript will appear here" state).
- A **speaking/listening indicator** (pulsing red when the assistant speaks, green when listening).
- A single button that swaps between **Start call** and **End call**.

`startCall` requires both a public key and a configured `assistantId`; otherwise it's a no‑op.

---

## The contact (phone) screen

If `widgetSettings.vapiSettings.phoneNumber` is set, the selection screen offers **"Call us"**, routing to `WidgetContactScreen`, which shows the number with:

- **Copy Number** — `navigator.clipboard`, with a 2‑second "Copied!" confirmation.
- **Call Now** — a `tel:` link.

---

## Managing assistants & numbers

The dashboard's connected Vapi view lists the org's Vapi resources in tabbed tables, powered by server‑side actions that use the **private** key:

| Action                         | Returns                                                |
| ------------------------------ | ------------------------------------------------------ |
| `private/vapi.getAssistants`   | The org's Vapi assistants (name, model, first message) |
| `private/vapi.getPhoneNumbers` | The org's Vapi phone numbers (number, name, status)    |

Both resolve the org's plugin, decrypt the secret, and call `@vapi-ai/server-sdk`'s `VapiClient` with the private key. The dashboard hooks (`useVapiAssistants`, `useVapiPhoneNumbers`) wrap these actions with loading/error state.

The Widget Customization form then lets the operator pick which assistant and phone number the widget should use, storing them in `widgetSettings.vapiSettings`.

---

## Security model

```mermaid
flowchart TD
    subgraph secure["Never leaves the server"]
        priv["Private Vapi key"]
    end
    subgraph public["Safe to expose"]
        pub["Public Vapi key"]
    end
    priv --> sdk["Backend: VapiClient (list assistants/numbers)"]
    pub --> web["Widget: vapi.start()"]

    style secure fill:#fdecec,stroke:#EE342F
    style public fill:#f0fff4,stroke:#3FB62F
```

- The **private key** is used only in backend actions (`private/vapi.*`), never returned to a client.
- The **public key** is the only credential the widget receives, via `public/secrets.getVapiSecrets`.
- Requires `AWS_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` in the Convex environment, and the IAM user needs `secretsmanager:CreateSecret`, `PutSecretValue`, and `GetSecretValue`.

---

**Next:** [Widget & Embed](widget.md) · [Billing & Subscriptions](billing.md) · [Setup Guide](setup.md)
