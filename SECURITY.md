# Security Policy

## Supported Versions

The following versions of Echo are currently receiving security updates:

| Version          | Supported |
| ---------------- | --------- |
| `0.x.x` (latest) | ✅ Active |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you have found a security vulnerability in Echo, please report it responsibly by emailing:

**rishikesh.palande07@gmail.com**

### What to Include

To help us triage and respond quickly, please include:

- **Type of issue** (e.g., XSS, SQL injection, authentication bypass, privilege escalation)
- **Affected component** (e.g., `apps/web`, `packages/ui`)
- **Full paths** of the source file(s) related to the vulnerability
- **Step-by-step instructions** to reproduce the issue
- **Proof of concept** or exploit code (if available)
- **Potential impact** — what an attacker could achieve
- **Your suggested fix** (optional but appreciated)

---

## Response Timeline

| Stage                   | Timeframe                       |
| ----------------------- | ------------------------------- |
| Initial acknowledgement | Within **48 hours**             |
| Severity assessment     | Within **5 business days**      |
| Fix development         | Depends on severity (see below) |
| Public disclosure       | After fix is released           |

### Severity-Based Response Times

| Severity     | Description                                               | Target Fix Time |
| ------------ | --------------------------------------------------------- | --------------- |
| **Critical** | Remote code execution, authentication bypass, data breach | 24–72 hours     |
| **High**     | Privilege escalation, significant data exposure           | 7 days          |
| **Medium**   | Limited data exposure, requires user interaction          | 30 days         |
| **Low**      | Minimal impact, defense-in-depth issue                    | 90 days         |

---

## Disclosure Policy

We follow **Coordinated Vulnerability Disclosure (CVD)**:

1. You report the vulnerability privately to us
2. We acknowledge receipt and begin investigation
3. We develop and test a fix
4. We release the fix and publish a security advisory
5. You are credited in the advisory (unless you prefer to remain anonymous)

We ask that you:

- Give us reasonable time to fix the issue before public disclosure
- Avoid accessing or modifying other users' data during testing
- Do not perform denial-of-service attacks
- Do not use social engineering against our team or users

---

## Security Best Practices for Contributors

When contributing to Echo:

- **Never commit secrets** — API keys, passwords, tokens, or private keys
- **Validate all user input** — sanitize data at every boundary
- **Use parameterized queries** — prevent SQL injection
- **Set proper Content Security Policy headers** — prevent XSS
- **Avoid `dangerouslySetInnerHTML`** in React components
- **Keep dependencies updated** — Dependabot PRs should be merged promptly
- **Follow the principle of least privilege** — request only necessary permissions

---

## Security Tooling

This repository uses the following automated security tooling:

| Tool                       | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| **GitHub CodeQL**          | Static analysis for vulnerability detection           |
| **Dependabot**             | Automated dependency vulnerability alerts and updates |
| **GitHub Secret Scanning** | Detects accidentally committed secrets                |
| **Branch Protection**      | Prevents direct pushes to `main` and `develop`        |

---

## Hall of Fame

We are grateful to security researchers who responsibly disclose vulnerabilities. Contributors will be acknowledged here with their permission.

_No vulnerabilities have been reported yet._

---

## Contact

Security issues: **rishikesh.palande07@gmail.com**

For general questions, open a [Discussion](https://github.com/RISHII7/echo/discussions).
