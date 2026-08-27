import { describe, expect, test } from "bun:test";
import { buildYorksteadObjectKey, safeObjectFilename } from "@/lib/infrastructure/storage/object-key";

describe("R2 object keys", () => {
  test("uses organization and domain resource identifiers", () => {
    expect(buildYorksteadObjectKey({
      kind: "uploads",
      organizationId: "org_123",
      resourceType: "Job",
      resourceId: "JOB_104",
      objectId: "7B2A",
      filename: "Front Range / Final Drawing.PDF",
    })).toBe("uploads/organizations/org_123/job/job_104/7b2a/final-drawing.pdf");
  });

  test("removes traversal and unsafe filename characters", () => {
    expect(safeObjectFilename("../../customer print (approved).DXF")).toBe("customer-print-approved.dxf");
  });

  test("uses stable fallback resource segments", () => {
    expect(buildYorksteadObjectKey({
      kind: "generated",
      organizationId: "org_123",
      objectId: "report_1",
      filename: "capacity.csv",
    })).toBe("generated/organizations/org_123/files/unassigned/report_1/capacity.csv");
  });
});
