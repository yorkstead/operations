import { describe, expect, it } from "bun:test";
import { TelemetryService } from "../modules/core/application/telemetry-service";
import { DisasterRecoveryService } from "../modules/core/application/disaster-recovery-service";

describe("Data Recovery, Telemetry & Observability Engine", () => {
  describe("Structured Redacted Logging", () => {
    it("creates structured log entry with trace ID and redacts sensitive credentials", () => {
      const entry = TelemetryService.createEntry(
        "security",
        "User attempted administrative login",
        {
          traceId: "trc_sec_01",
          organizationId: "org_front_range_mfg",
          userId: "usr_operator_1",
          action: "AUTH_ATTEMPT",
        },
        {
          passwordAttempt: "SecretPass123!",
          bearerToken: "eyJh...private",
          ipAddress: "10.0.0.42",
          stationCode: "LASER-6KW",
        }
      );

      expect(entry.traceId).toBe("trc_sec_01");
      expect(entry.organizationId).toBe("org_front_range_mfg");
      expect(entry.level).toBe("security");
      expect(entry.payload.passwordAttempt).toBe("[REDACTED]");
      expect(entry.payload.bearerToken).toBe("[REDACTED]");
      expect(entry.payload.ipAddress).toBe("10.0.0.42");
      expect(entry.payload.stationCode).toBe("LASER-6KW");
    });
  });

  describe("Disaster Recovery & Restore Rehearsal", () => {
    it("creates verified snapshot and rehearses deterministic restore with checksum validation", () => {
      const orgId = "org_front_range_mfg";
      const sampleTables = {
        jobs: [{ id: "job_1", title: "Laser Cut Panels", quantity: 50 }],
        materials: [{ sku: "AL-6061-025", onHand: 100 }],
        travelers: [{ id: "trav_1", station: "LASER-6KW", status: "completed" }],
      };

      const snapshot = DisasterRecoveryService.createSnapshot(orgId, sampleTables);
      expect(snapshot.snapshotId.startsWith("snap_")).toBe(true);
      expect(snapshot.recordCount).toBe(3);
      expect(snapshot.checksumSha256.startsWith("sha256_")).toBe(true);

      // Rehearse restore in test target organization
      const restoreResult = DisasterRecoveryService.rehearseRestore(snapshot.snapshotId, "org_test_sandbox");
      expect(restoreResult.success).toBe(true);
      expect(restoreResult.restoredRecordCount).toBe(3);
      expect(restoreResult.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("rejects corrupted snapshot restore rehearsals", () => {
      const orgId = "org_corrupt_test";
      const sampleTables = {
        items: [{ id: "item_1", name: "Corrupt Item" }],
      };

      const snapshot = DisasterRecoveryService.createSnapshot(orgId, sampleTables);
      
      // Deliberately tamper with payload to simulate corruption
      snapshot.dataPayload.items.push({ id: "item_injected", name: "Tampered Row" });

      expect(() => {
        DisasterRecoveryService.rehearseRestore(snapshot.snapshotId, "org_test_sandbox");
      }).toThrow(/Checksum mismatch/);
    });
  });
});
