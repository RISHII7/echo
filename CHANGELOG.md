# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

> Changes staged for the next release.

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

[Unreleased]: https://github.com/RISHII7/echo/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/RISHII7/echo/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/RISHII7/echo/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/RISHII7/echo/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/RISHII7/echo/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/RISHII7/echo/releases/tag/v0.1.0
