# Deployment & Production Parity Truth

This document details the live deployment architecture, platform configuration, verified endpoints, and cross-site integration between **Yorkstead Systems** (`apps/website`) and **Yorkstead Operations** (`apps/operations`).

---

## 1. Authoritative Domain & Hosting Ownership

| Application | Domain | Hosting Platform | Project Name | Git Remote / Branch | Framework Preset |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Public Website** | `https://yorkstead.com` | **Netlify** | `yorkstead` | `yorkstead/yorkstead` (`main`, `apps/website`) | Next.js (Netlify Plugin) |
| **Operations Platform** | `https://ops.yorkstead.com` | **Vercel** | `yorkstead-operations` | `yorkstead/yorkstead` (`main`, `apps/operations`) | Next.js 16 (Turbopack) |

Database initialization must run `bun run auth:migrate` before `bun run db:migrate`. Application migrations reference Better Auth identity tables and intentionally fail if the authentication schema has not been installed first.

---

## 2. Vercel Project Configuration (`yorkstead-operations`)

- **Project ID**: `prj_mGx4vKeTu6GSyMgosXtR8QQZa4Oj`
- **Owner**: `4twentydev`
- **Root Directory**: `.`
- **Framework Preset**: `Next.js` (`framework: "nextjs"` in `vercel.json`)
- **Build Command**: `bun run build`
- **Install Command**: `bun install`
- **Node.js Runtime**: `24.x` / `bun`
- **Production Aliases**:
  - `https://ops.yorkstead.com` (Primary production custom domain)
  - `https://ops.4twenty.dev` (Migration fallback alias)

---

## 3. Verified Live Production Endpoints

| Endpoint | Method | Expected Status | CORS Header | Live Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| `https://ops.yorkstead.com/` | `GET` | `200 OK` | `—` | Serves Next.js application shell and workspace loader |
| `https://ops.yorkstead.com/api/health/readiness` | `GET` | `200 OK` | `—` | `{"status":"READY","service":"yorkstead-operations","checks":{"database":"CONNECTED","storageVault":"ACCESSIBLE","migrations":"CURRENT","tenantIsolation":"ENFORCED"}}` |
| `https://ops.yorkstead.com/api/public/demo-health` | `GET` | `200 OK` | `Access-Control-Allow-Origin: https://yorkstead.com` | Returns 4 canonical scenarios (`front-range-manufacturing`, `summit-facility-services`, `mile-high-signworks`, `peak-mobile-detail`) |
| `https://ops.yorkstead.com/demo?scenario=...` | `GET` | `200 OK` | `*` | Interactive demo sandbox with synthetic isolation |
| `https://ops.yorkstead.com/api/jobs` | `GET` | `401 Unauthorized` | `—` | Zero credential or environment secret leakage |

---

## 4. Cross-Site Integration Contract

1. **Unidirectional Link Handoff**:
   The public company website (`yorkstead.com`) links to operations sandboxes (`ops.yorkstead.com/demo?scenario=...`) using strict URL whitelisting.
2. **Zero Cross-Domain Session Leakage**:
   No cookies or session tokens are shared across `yorkstead.com` and `ops.yorkstead.com`.
3. **CORS Restrictions**:
   Public telemetry and demo manifests (`/api/public/demo-health`) explicitly restrict CORS origin to `https://yorkstead.com`.
