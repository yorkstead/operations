---
title: Yorkstead Platform Monorepo
date: 2026-09-04
type: architecture-spec
tags:
  - codebase
  - monorepo
  - bun
  - nextjs
---

# 🏢 Yorkstead Platform Monorepo

> **Location:** `core/yorkstead/`  
> **Toolchain:** Bun, Turborepo, Next.js 15, TypeScript, Tailwind CSS

---

## 📂 Monorepo Architecture

```
core/yorkstead/
├── apps/
│   ├── website/          # https://yorkstead.com (Deployed on Netlify)
│   └── operations/       # https://ops.yorkstead.com (Deployed on Vercel)
└── packages/             # Shared TypeScript packages, schemas, UI components
```

## 🚀 Key Commands
* `bun run dev:website` — Start public marketing site on `localhost:3000`
* `bun run dev:operations` — Start operations cockpit on `localhost:3001`
* `bun run check` — Monorepo-wide typechecking and linting
* `bun run build` — Production build for all workspaces

## 🔗 Related Notes
* [[00 - Yorkstead Dashboard]]
* [[ReworkFlow Terminal Platform]]
