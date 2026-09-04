---
Title: Yorkstead Operations Cockpit
Date: 2026-09-04
Type: System Specification
Status: Production Deployed
Deployment: https://ops.yorkstead.com
Repo: https://github.com/yorkstead/yorkstead-systems.git (core/operations)
Category: Systems & Products
Tags: [internal-tool, ops-cockpit, vercel, nextjs, bun, knowledge-os]
---

# 🛠️ System Specification: Yorkstead Operations Cockpit

## 📌 System Overview
The Yorkstead Operations Cockpit (`ops.yorkstead.com`) is the operational command center for Yorkstead Systems. It serves as both the internal management tool and the live multi-tenant client portal demonstration environment.

* **Production URL:** [ops.yorkstead.com](https://ops.yorkstead.com)
* **Hosting:** Vercel Pro
* **Runtime:** Bun 1.3+ / Node.js
* **Framework:** Next.js 15 App Router

---

## ⚡ Key Capabilities & Modules

1. **Yorkstead Knowledge OS (Notion Hub):**
   * Real-time document browser displaying client dossiers, technical blueprints, and operational playbooks.
   * Full search, tag filtering, category grouping, and instant Notion deep-linking.
2. **Shopfloor Know-How & SOP Workspace:**
   * Step-by-step procedures for terminal deployments, hardware mounting, and client onboarding.
3. **Multi-Tenant Scoping & ADR Compliance:**
   * Built according to Architecture Decision Records (ADR 0001 through ADR 0016), featuring tenant-isolated PostgreSQL metadata, secure document storage, and signed URL generation.
4. **CI/CD Integration:**
   * Automated GitHub Actions pipeline compiling, type-checking, and deploying on push to `main`.
