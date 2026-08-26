# ADR-0002: Platform Foundation, Runtime Stack, and Toolchain

- **Status**: ACCEPTED
- **Date**: 2026-08-25
- **Author(s)**: Principal Product Engineer / Gemini
- **Approver(s)**: Repository Owner
- **Related Prompts / Issues**: `prompts/00-foundation/02-platform-foundation.md`
- **Supersedes**: None
- **Superseded By**: None

## Context and Problem Statement

Yorkstead Operations requires a verified, production-ready foundation stack compatible with Windows-first development and serverless Vercel deployment. The stack must support a strict modular monolith, strong typing across database models and API contracts, high-density industrial UX with OKLCH styling, robust multi-tenant authorization, and automated quality checks (typecheck, lint, test, build, migration audit).

## Decision

Adopt the following unified stack:
1. **Runtime & Package Manager**: `bun` (v1.3+) as the primary package manager and unit test runner for fast, deterministic local development, with verified Node.js/Vercel build compatibility.
2. **Framework**: `Next.js` (v15/v16 App Router) with `React 19` and `TypeScript` in strict mode.
3. **Styling & Design System**: `Tailwind CSS` (v4) with OKLCH theme variables codified from `docs/VISUAL_SYSTEM.md`.
4. **Database & ORM**: `PostgreSQL` with `drizzle-orm` and `drizzle-kit` for type-safe schema definitions, tenant-scoped queries, and forward-safe migrations. Supports Neon/serverless connection pooling in production.
5. **Authentication**: `better-auth` (with passkey support) for modern, organization-aware authentication and capability enforcement.
6. **Environment Validation**: Type-safe schema validation (`zod`) ensuring runtime failure if required secrets or connection strings are missing.
7. **Quality Pipeline**: Standardized npm/bun scripts for `dev`, `build`, `lint`, `typecheck`, `test` (`bun test`), and `db:migrate:check`.

## Alternatives Considered

1. **Node.js / npm / pnpm as sole runtime**: Bun was selected because it provides unified fast package management, built-in test runner (`bun test`), and TypeScript execution out of the box while maintaining 100% npm/Node compatibility.
2. **Prisma ORM**: Drizzle was selected over Prisma because Drizzle produces zero-overhead SQL, faster serverless cold starts, and fine-grained control over schema definitions and multi-tenant constraints.
3. **NextAuth / Auth.js**: Better Auth was selected for superior multi-tenant organization support, passkey/WebAuthn first-class primitives, and typed client SDKs.

## Consequences and Trade-offs

### Positive
- Unified TypeScript execution, instant testing with `bun test`, and rapid build cycles.
- Single deployable modular monolith application.
- Full compliance with `docs/VISUAL_SYSTEM.md` and `docs/ARCHITECTURE.md`.

### Negative / Operational Burden
- Requires maintaining database migrations through explicit migration scripts and schema checks.

## Architectural & Security Boundaries

- **Modular Monolith**: App Router composition in `app/`, shared UI primitives in `components/ui/`, modular business domain logic in `modules/`, shared database in `db/`.
- **Tenant Isolation**: Schema primitives enforce `organization_id` on all tenant-owned entities.
- **Environment Safety**: Secrets loaded only from `.env.local` (gitignored), verified via `lib/env.ts`.

## Migration & Rollback Plan

- **Migration Path**: Initial scaffold sets up baseline configuration, dependencies, and shell.
- **Rollback Plan**: Versioned through Git commit checkpoints.

## Verification Evidence

- `bun install`: Clean package resolution.
- `bun run typecheck`: Zero TypeScript diagnostics.
- `bun run lint`: ESLint passes without errors.
- `bun test`: All unit tests pass.
- `bun run build`: Next.js production build succeeds.
