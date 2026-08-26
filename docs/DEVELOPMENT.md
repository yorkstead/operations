# Development

## Established Platform Stack

The platform foundation is codified in [`docs/decisions/0002-platform-foundation-and-toolchain.md`](decisions/0002-platform-foundation-and-toolchain.md):
- **Runtime & Package Manager**: Bun (`bun@1.3.14+`)
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with OKLCH tokens (`docs/VISUAL_SYSTEM.md`)
- **Database & ORM**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth (`better-auth`)

## Standard Commands

- **Install dependencies**: `bun install`
- **Development server**: `bun run dev`
- **Typecheck**: `bun run typecheck`
- **Lint**: `bun run lint`
- **Unit & integration tests**: `bun test`
- **Database migration check**: `bun run db:migrate:check`
- **Production build**: `bun run build`

## Environment Configuration

Copy `.env.example` to `.env.local` for local secrets. Never commit `.env.local` or real credentials. All environment variables are validated at runtime in [`lib/env.ts`](../lib/env.ts).

## Prompt Execution Cycle

Before each prompt: pull/inspect, confirm clean working tree, read relevant docs. Before commit: run all verification checks individually (`typecheck`, `lint`, `test`, `db:migrate:check`, `build`), inspect diff, and update docs.

