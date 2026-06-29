# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

> Changes staged for the next release.

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

[Unreleased]: https://github.com/RISHII7/echo/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/RISHII7/echo/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/RISHII7/echo/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/RISHII7/echo/releases/tag/v0.1.0
