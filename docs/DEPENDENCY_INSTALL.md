# Reproducible Operations dependency installation

The standalone `yorkstead/operations` repository declares Bun 1.3.14 in
`package.json`. Commit `bun.lock` with dependency changes and use
`bun install --frozen-lockfile` in CI and Vercel so builds do not resolve a new
dependency graph on every deployment.

The August 30, 2026 Vercel build of `d38daca` ran npm without a lockfile and
failed with ERESOLVE: Better Auth's resolved `better-call@1.4.0` requires
Zod 4, while Operations declared Zod 3. Operations now declares Zod 4 and
uses the two-argument `z.record(keySchema, valueSchema)` form for packet
approval overrides. Do not bypass peer validation with `--force` or
`--legacy-peer-deps`.

This dependency correction does not rotate authentication secrets, apply
database migrations, change storage credentials, or change visual identity.
Installation/build success does not establish database, storage, or sign-in
readiness; verify those separately after deployment.

## Local verification

- `bun install --frozen-lockfile`: passed with no dependency changes.
- `bun run typecheck`, `bun run lint`, `bun run build`: passed.
- `bun test`: 324 passed; six existing deployment-configuration tests fail
  because they reference former monorepo paths outside this standalone checkout.
- `bun audit`: one moderate transitive esbuild advisory (GHSA-67mh-4wv8-2f99).
- An independent npm lockfile-resolution probe was blocked by the local npm
  `EALLOWREMOTE` policy on a Tailwind optional WASM tarball. No policy was
  relaxed. The verified install path is Bun, explicitly set in `vercel.json`.
- Hosted deployment and authenticated runtime verification remain pending.
