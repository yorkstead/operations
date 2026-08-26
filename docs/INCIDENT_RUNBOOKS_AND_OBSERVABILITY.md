# Incident Response Runbooks & Observability Architecture

## 1. Executive Summary

This operational manual documents the reliability engineering, alerting tiers, disaster recovery objectives, and incident runbooks for **Yorkstead Operations** (`https://ops.yorkstead.com`).

---

## 2. Service Level Objectives (SLOs) & Recovery Targets

| Metric | Target Objective | Implementation Reality |
| :--- | :--- | :--- |
| **Availability (Uptime)** | 99.9% monthly (< 43.8 min unplanned downtime) | Netlify Edge + Neon Serverless Multi-Zone Postgres |
| **Recovery Point Objective (RPO)** | < 15 minutes (Max data loss on catastrophic failure) | Automated continuous WAL archiving + daily base snapshots |
| **Recovery Time Objective (RTO)** | < 30 minutes (Max time to restore production service) | Deterministic automated snapshot restore rehearsal engine |
| **Synthetic Demo Isolation** | 100% tenant boundary containment | Dedicated \`org_demo_*\` namespaces with in-memory fallback |

---

## 3. Observability Architecture & Redaction Policy

1. **Correlation IDs**: All incoming requests receive a unique \`traceId\` header propagated across database queries, service calls, and background jobs.
2. **Mandatory Redaction**: The \`TelemetryService\` automatically scrubs sensitive authorization tokens, passwords, customer payment details, and private CAD binary contents before logging.
3. **Structured JSON Logs**: Logs output in standard JSON with ISO 8601 timestamps, log level (\`info\`, \`warn\`, \`error\`, \`security\`), \`organizationId\`, \`userId\`, and \`action\`.

---

## 4. Alert Ownership & Escalation Matrix

| Severity Tier | Trigger Condition | Notification Channel | Primary Owner | Escalation Target |
| :--- | :--- | :--- | :--- | :--- |
| **P1 - Critical** | Database outage, cross-tenant isolation breach, severe data loss risk | PagerDuty / Phone Call | Lead Infrastructure SRE | Principal Product Engineer |
| **P2 - High** | Laser station traveler blocked > 15 min, quoting margin bypass alert | Slack #ops-alerts | On-Call Product Engineer | Engineering Lead |
| **P3 - Medium** | High disk watermark (> 80%), minor API latency spike (> 500ms) | Email / Slack #ops-warnings | Platform Maintainer | Weekly Triage |

---

## 5. Incident Runbooks

### Runbook 1: Point-In-Time Database Restore Rehearsal
1. Execute \`DisasterRecoveryService.createSnapshot(orgId, tables)\` to verify live table state.
2. Run \`DisasterRecoveryService.rehearseRestore(snapshotId, testOrgId)\` in test environment.
3. Verify record counts and SHA-256 checksum match 100%.
4. Run integration smoke suite on restored tenant database.

### Runbook 2: Schema Migration Rollback
1. If a migration fails or induces application errors, execute \`bun run db:rollback\`.
2. Inspect \`scripts/migrate.ts\` logs for foreign key or lock contention issues.
3. Fix root cause in test environment before scheduling re-attempt.
