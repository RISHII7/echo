# Contributing to Echo

Thank you for your interest in contributing to Echo. This document provides comprehensive guidelines to ensure a smooth and consistent contribution experience for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Code Changes](#submitting-code-changes)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Review Process](#review-process)
- [Release Process](#release-process)

---

## Code of Conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/echo.git
   cd echo
   ```
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/RISHII7/echo.git
   ```
4. **Install dependencies:**
   ```bash
   pnpm install
   ```
5. **Verify your setup:**
   ```bash
   pnpm build
   pnpm lint
   pnpm typecheck
   ```

---

## Development Setup

### Prerequisites

| Tool    | Version      |
| ------- | ------------ |
| Node.js | `>= 22.15.1` |
| pnpm    | `>= 10.13.1` |
| Git     | Latest       |

### Recommended Setup

We recommend using [fnm](https://github.com/Schniz/fnm) for Node version management. The repository includes a `.node-version` file that will automatically switch to the correct Node version.

```bash
# Install fnm
winget install Schniz.fnm  # Windows
brew install fnm           # macOS

# Configure your shell (add to profile)
eval "$(fnm env --use-on-cd)"

# Install and use the project's Node version
fnm install
fnm use
```

### Recommended Editor Extensions (VS Code)

- **ESLint** — `dbaeumer.vscode-eslint`
- **Prettier** — `esbenp.prettier-vscode`
- **Tailwind CSS IntelliSense** — `bradlc.vscode-tailwindcss`
- **TypeScript Hero** — `ms-vscode.vscode-typescript-next`
- **GitLens** — `eamodio.gitlens`

---

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. **Check existing issues** to avoid duplicates
2. **Update to the latest version** to see if the bug persists
3. **Collect information** about your environment

Use the [Bug Report template](https://github.com/RISHII7/echo/issues/new?template=bug_report.yml) and fill in all required fields. A good bug report includes:

- A clear, descriptive title
- Steps to reproduce the issue reliably
- Expected vs. actual behavior
- Screenshots or screen recordings if applicable
- Your environment (OS, Node version, browser)

### Suggesting Features

Use the [Feature Request template](https://github.com/RISHII7/echo/issues/new?template=feature_request.yml).

Before submitting:

1. Check if a similar feature has already been requested
2. Consider whether the feature fits the project's scope and goals
3. Think through the implementation approach

### Submitting Code Changes

For **small fixes** (typos, minor bugs): open a PR directly.

For **significant changes** (new features, breaking changes, architectural decisions):

1. Open an issue first to discuss the approach
2. Wait for feedback and alignment from maintainers
3. Proceed with implementation

---

## Branch Strategy

All branches must follow this naming convention:

| Type          | Pattern                       | Example                 |
| ------------- | ----------------------------- | ----------------------- |
| Feature       | `feature/<short-description>` | `feature/user-auth`     |
| Bug fix       | `fix/<short-description>`     | `fix/button-focus-ring` |
| Documentation | `docs/<short-description>`    | `docs/api-reference`    |
| Chore         | `chore/<short-description>`   | `chore/update-deps`     |
| Hotfix        | `hotfix/<short-description>`  | `hotfix/critical-xss`   |
| Release       | `release/<version>`           | `release/1.2.0`         |

**Rules:**

- Branch from `develop` (not `main`) for all features and fixes
- Keep branches short-lived — merge or close within 2 weeks
- Delete your branch after merging

```bash
# Always sync with upstream before branching
git fetch upstream
git checkout develop
git merge upstream/develop

# Create your branch
git checkout -b feature/your-feature-name
```

---

## Commit Convention

This project strictly follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type       | When to Use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | Adds a new feature (triggers minor version bump)        |
| `fix`      | Fixes a bug (triggers patch version bump)               |
| `docs`     | Documentation only changes                              |
| `style`    | Formatting, whitespace — no logic change                |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Improves performance                                    |
| `test`     | Adding or updating tests                                |
| `build`    | Changes to build system or dependencies                 |
| `ci`       | Changes to CI configuration                             |
| `chore`    | Other changes that don't modify src or test files       |
| `revert`   | Reverts a previous commit                               |

### Scopes

Use one of the workspace names as the scope:

`web`, `widget`, `ui`, `math`, `eslint-config`, `typescript-config`, `deps`, `ci`, `docs`, `repo`

### Breaking Changes

Append `!` after the type/scope, or add `BREAKING CHANGE:` in the footer:

```bash
feat(auth)!: remove deprecated session endpoint

BREAKING CHANGE: The /api/session endpoint has been removed.
Use /api/auth/session instead.
```

### Examples

```bash
feat(web): add dark mode toggle
fix(ui): resolve focus ring disappearing on Safari
docs(contributing): add branch naming convention
chore(deps): bump next from 16.2.6 to 16.3.0
ci: add CodeQL analysis workflow
refactor(math): simplify calculation utilities
perf(web): lazy load dashboard components
```

---

## Pull Request Guidelines

### Before Opening a PR

- [ ] All commits follow the [Conventional Commits](#commit-convention) format
- [ ] Code is lint-free: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Project builds successfully: `pnpm build`
- [ ] Self-reviewed your own changes
- [ ] Added/updated documentation where necessary

### PR Title

PR titles must follow the Conventional Commits format (validated automatically):

```
feat(web): add user profile page
fix(ui): correct button disabled state
```

### PR Description

Fill out the entire [PR template](.github/PULL_REQUEST_TEMPLATE.md). Do not delete any sections.

### PR Size

Keep PRs focused and small. A PR that touches fewer files is easier and faster to review.

- **Ideal**: < 400 lines changed
- **Acceptable**: 400–800 lines changed
- **Requires justification**: > 800 lines changed

### Targeting the Correct Branch

| Change Type                 | Target Branch   |
| --------------------------- | --------------- |
| Features, fixes, docs       | `develop`       |
| Critical production patches | `main` (hotfix) |
| Release preparation         | `develop`       |

---

## Code Style

### TypeScript

- Use strict TypeScript — no `any` unless absolutely necessary with a comment explaining why
- Prefer `interface` over `type` for object shapes
- Use explicit return types on exported functions
- Avoid non-null assertions (`!`) — handle nullability explicitly

### React

- Use functional components exclusively
- Prefer Server Components — only use `"use client"` when necessary
- Keep components small and focused on a single responsibility
- Extract reusable logic into custom hooks

### Naming

| Entity           | Convention                    | Example            |
| ---------------- | ----------------------------- | ------------------ |
| Files            | `kebab-case`                  | `user-profile.tsx` |
| Components       | `PascalCase`                  | `UserProfile`      |
| Hooks            | `camelCase` with `use` prefix | `useUserProfile`   |
| Utilities        | `camelCase`                   | `formatDate`       |
| Constants        | `UPPER_SNAKE_CASE`            | `MAX_RETRY_COUNT`  |
| Types/Interfaces | `PascalCase`                  | `UserProfileProps` |

### Formatting

Formatting is handled automatically by Prettier. Run `pnpm format` before committing or configure your editor to format on save.

---

## Testing

When adding tests:

- Place test files adjacent to the code they test: `component.test.tsx`
- Write descriptive test names that explain the expected behavior
- Test user-visible behavior, not implementation details
- For UI components, test accessibility (keyboard navigation, ARIA attributes)

```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm test:coverage # With coverage report
```

---

## Review Process

1. A maintainer will review your PR within **2–5 business days**
2. Address all requested changes in new commits (do not force-push during review)
3. Once approved, a maintainer will merge your PR using **Squash and Merge**
4. Your branch will be automatically deleted after merging
5. Your contribution will appear in the next release's CHANGELOG

---

## Release Process

Releases are managed by maintainers following [Semantic Versioning](https://semver.org):

| Change                | Version Bump              |
| --------------------- | ------------------------- |
| `BREAKING CHANGE`     | Major (`1.0.0` → `2.0.0`) |
| `feat`                | Minor (`1.0.0` → `1.1.0`) |
| `fix`, `perf`, others | Patch (`1.0.0` → `1.0.1`) |

Releases are created by:

1. Merging `develop` into `main`
2. Pushing a version tag (`v1.2.3`)
3. The release workflow automatically creates the GitHub Release with generated notes

---

## Questions?

Open a [Question issue](https://github.com/RISHII7/echo/issues/new?template=question.yml) or start a [Discussion](https://github.com/RISHII7/echo/discussions).

---

Thank you for contributing to Echo. Your time and effort make this project better for everyone.
