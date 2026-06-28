<div align="center">

# Echo

**A modern, enterprise-grade full-stack platform built for scale.**

[![CI](https://img.shields.io/github/actions/workflow/status/RISHII7/echo/ci.yml?branch=main&label=CI&logo=github-actions&logoColor=white)](https://github.com/RISHII7/echo/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/RISHII7/echo/codeql.yml?branch=main&label=CodeQL&logo=github&logoColor=white)](https://github.com/RISHII7/echo/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.15.1-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10.13.1-orange)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo)](https://turbo.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Report Bug](https://github.com/RISHII7/echo/issues/new?template=bug_report.yml) · [Request Feature](https://github.com/RISHII7/echo/issues/new?template=feature_request.yml) · [Documentation](https://github.com/RISHII7/echo/wiki)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Development](#development)
  - [Commands](#commands)
  - [Branch Strategy](#branch-strategy)
  - [Commit Convention](#commit-convention)
- [Project Structure](#project-structure)
- [Packages](#packages)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [Changelog](#changelog)
- [License](#license)

---

## Overview

Echo is a production-ready, full-stack monorepo platform engineered for enterprise workloads. Built on Next.js 16 with React 19, it delivers a cohesive developer experience across multiple apps and shared packages — all orchestrated by Turborepo with intelligent caching and parallel execution.

> This repository follows [Semantic Versioning](https://semver.org), [Conventional Commits](https://www.conventionalcommits.org), and [Keep a Changelog](https://keepachangelog.com) standards.

---

## Features

- **Monorepo Architecture** — Turborepo with remote caching, task pipelines, and workspace dependency graph
- **Type Safety** — End-to-end TypeScript with strict mode across all packages
- **Design System** — Shared UI component library built on shadcn/ui and Radix primitives
- **Performance** — Next.js Turbopack, React Server Components, and Tailwind CSS v4
- **Code Quality** — ESLint 9, Prettier, and TypeScript strict checks enforced on every commit
- **Security** — CodeQL analysis, Dependabot, and automated vulnerability scanning
- **CI/CD** — GitHub Actions with branch protection, automated releases, and PR validation
- **Developer Experience** — Hot reload, path aliases, and shared configs across all workspaces

---

## Architecture

```
echo/
├── apps/
│   ├── web/          # Primary Next.js application
│   └── widget/       # Embeddable widget application
├── packages/
│   ├── ui/           # Shared component library
│   ├── math/         # Shared utilities
│   ├── eslint-config/       # Shared ESLint configuration
│   └── typescript-config/   # Shared TypeScript configuration
```

The monorepo uses a **workspace dependency graph** where apps consume packages, and packages can depend on other packages. Turborepo ensures tasks run in topological order with caching at every layer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui + Radix UI |
| Icons | Lucide React |
| Monorepo | Turborepo 2 |
| Package Manager | pnpm 10 |
| Linting | ESLint 9 |
| Formatting | Prettier 3 |
| CI/CD | GitHub Actions |
| Security | CodeQL + Dependabot |

---

## Getting Started

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | `>= 22.15.1` | [fnm](https://github.com/Schniz/fnm) (recommended) |
| pnpm | `>= 10.13.1` | `npm install -g pnpm` |
| Git | Latest | [git-scm.com](https://git-scm.com) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/RISHII7/echo.git
cd echo

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of the web application | Yes |

---

## Development

### Commands

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all packages and apps
pnpm lint         # Run linting across all workspaces
pnpm typecheck    # Run type checking across all workspaces
pnpm format       # Format all files with Prettier

# Target a specific app
pnpm --filter web dev
pnpm --filter widget dev
```

### Branch Strategy

| Branch | Purpose | Base |
|---|---|---|
| `main` | Production-ready code | — |
| `develop` | Integration branch | `main` |
| `feature/*` | New features | `develop` |
| `fix/*` | Bug fixes | `develop` |
| `hotfix/*` | Critical production patches | `main` |
| `release/*` | Release preparation | `develop` |
| `chore/*` | Maintenance tasks | `develop` |

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org):

| Type | Description |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, no logic change |
| `refactor` | Code refactor |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling |
| `ci` | CI/CD configuration |
| `revert` | Revert a previous commit |

```bash
git commit -m "feat(web): add user authentication flow"
git commit -m "fix(ui): resolve button focus ring on Safari"
git commit -m "chore(deps): bump next from 16.2.6 to 16.3.0"
```

---

## Project Structure

```
echo/
├── .github/
│   ├── ISSUE_TEMPLATE/          # Bug, feature, question templates
│   ├── workflows/               # GitHub Actions CI/CD pipelines
│   ├── CODEOWNERS               # Automatic review assignments
│   ├── dependabot.yml           # Automated dependency updates
│   └── PULL_REQUEST_TEMPLATE.md
├── apps/
│   ├── web/                     # Next.js web application
│   └── widget/                  # Embeddable widget
├── packages/
│   ├── ui/                      # Shared component library
│   ├── math/                    # Shared utilities
│   ├── eslint-config/           # ESLint config presets
│   └── typescript-config/       # tsconfig presets
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
└── SECURITY.md
```

---

## Packages

### `@workspace/ui`
Shared component library built on shadcn/ui and Radix UI primitives.

```tsx
import { Button } from "@workspace/ui/components/button"
```

### `@workspace/eslint-config`
Shared ESLint configurations: `base`, `next`, and `react-internal` presets.

### `@workspace/typescript-config`
Shared `tsconfig.json` presets: `base`, `nextjs`, and `react-library`.

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RISHII7/echo)

1. Import the repository on [Vercel](https://vercel.com)
2. Set **Root Directory** to `apps/web`
3. Add required environment variables
4. Deploy

---

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

---

## Security

Please read [SECURITY.md](SECURITY.md) before reporting a vulnerability. **Do not open a public issue for security vulnerabilities.**

---

## Changelog

All notable changes are documented in [CHANGELOG.md](CHANGELOG.md).

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">

Made with precision by [Rishikesh Palande](https://github.com/RISHII7)

</div>
