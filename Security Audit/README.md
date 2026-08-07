# Security Audit

Security review artifacts for the Dealport Admin Dashboard.

- **[Security-Audit-Report.md](./Security-Audit-Report.md)** — input-validation-focused audit of `apps/api` and `apps/web`: 6 findings (2 medium, 4 low), all fixed in code and verified via build + a standalone test of the new upload content-verification logic. Includes an open item on confirming the fix is live in production.
