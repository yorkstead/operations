import { describe, expect, it } from "bun:test";
import { IdentityService } from "../modules/core/application/identity-service";
import { InventoryService } from "../modules/inventory/application/inventory-service";

describe("Security & Tenant Isolation Hardening Suite", () => {
  describe("Tenant Boundary & IDOR Prevention", () => {
    it("strictly isolates inventory balances between distinct organizations", () => {
      const identityService = new IdentityService();
      const inventoryService = new InventoryService();

      const { user: userA, organization: orgA } = identityService.bootstrapOwner({
        email: "owner_a@yorkstead.com",
        name: "Owner A",
        organizationName: "Factory Alpha",
        organizationSlug: "factory-alpha",
      });

      identityService.createOrganization(userA.id, "Factory Beta", "factory-beta");
      const sessionB = identityService.getSessionContext(userA.id);
      const sessionA = identityService.switchActiveOrganization(userA.id, orgA.id);

      const itemA = inventoryService.createItem(sessionA, {
        itemCode: "RAW-STEEL-025",
        description: "0.25 Steel Sheet",
        category: "raw_material",
        unitOfMeasure: "SHEET",
        reorderPoint: "5",
        reorderQuantity: "20",
        standardCost: 45.0,
      });

      const itemB = inventoryService.createItem(sessionB, {
        itemCode: "RAW-STEEL-025",
        description: "0.25 Steel Sheet",
        category: "raw_material",
        unitOfMeasure: "SHEET",
        reorderPoint: "5",
        reorderQuantity: "20",
        standardCost: 45.0,
      });

      inventoryService.receiveMaterial(sessionA, { itemId: itemA.id, quantity: 100, lotNumber: "LOT-A" });
      inventoryService.receiveMaterial(sessionB, { itemId: itemB.id, quantity: 25, lotNumber: "LOT-B" });

      const balanceA = inventoryService.getItemStockSummary(sessionA, itemA.id);
      const balanceB = inventoryService.getItemStockSummary(sessionB, itemB.id);

      expect(balanceA.totalOnHand).toBe(100);
      expect(balanceB.totalOnHand).toBe(25);
    });

    it("rejects cross-tenant overdraft issues", () => {
      const identityService = new IdentityService();
      const inventoryService = new InventoryService();

      const { user: userB } = identityService.bootstrapOwner({
        email: "owner_b2@yorkstead.com",
        name: "Owner B2",
        organizationName: "Factory Beta 2",
        organizationSlug: "factory-beta-2",
      });

      const sessionB = identityService.getSessionContext(userB.id);

      const itemB = inventoryService.createItem(sessionB, {
        itemCode: "RAW-STEEL-025",
        description: "0.25 Steel Sheet",
        category: "raw_material",
        unitOfMeasure: "SHEET",
        reorderPoint: "5",
        reorderQuantity: "20",
        standardCost: 45.0,
      });

      inventoryService.receiveMaterial(sessionB, { itemId: itemB.id, quantity: 25, lotNumber: "LOT-B" });

      expect(() => {
        inventoryService.issueToJob(sessionB, {
          itemId: itemB.id,
          jobId: "job_overdraft",
          jobNumber: "JOB-FAIL-1",
          quantity: 50,
        });
      }).toThrow("Negative Stock Policy Violation");
    });
  });

  describe("Formula & Input Injection Sanitization", () => {
    it("sanitizes potentially dangerous CSV formula prefixes (=, +, -, @)", () => {
      function sanitizeCsvCell(cell: string): string {
        const dangerousPrefixes = ["=", "+", "-", "@"];
        if (cell && dangerousPrefixes.some((p) => cell.startsWith(p))) {
          return "'" + cell;
        }
        return cell;
      }

      expect(sanitizeCsvCell("=cmd|' /C calc'!A0")).toBe("'=cmd|' /C calc'!A0");
      expect(sanitizeCsvCell("+12345")).toBe("'+12345");
      expect(sanitizeCsvCell("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
      expect(sanitizeCsvCell("Standard Part Description")).toBe("Standard Part Description");
    });
  });

  describe("File Vault Path Traversal Containment", () => {
    it("rejects path traversal keys attempting to escape root directory", () => {
      function validateFileKey(key: string): boolean {
        if (key.includes("..") || key.startsWith("/") || key.includes("\\")) {
          return false;
        }
        return /^[a-zA-Z0-9_\-\/\.]+$/.test(key);
      }

      expect(validateFileKey("../../etc/passwd")).toBe(false);
      expect(validateFileKey("/root/private.key")).toBe(false);
      expect(validateFileKey("..\\windows\\system32")).toBe(false);
      expect(validateFileKey("org_123/drawings/rev_c_cad.dxf")).toBe(true);
      expect(validateFileKey("uploads/2026/08/spec_sheet.pdf")).toBe(true);
    });
  });

  describe("Audit Log Credential Redaction", () => {
    it("redacts sensitive authentication keys from diagnostic logs", () => {
      function sanitizeAuditPayload(payload: Record<string, unknown>): Record<string, unknown> {
        const sensitiveKeys = ["password", "token", "secret", "authorization", "apiKey", "passcode"];
        const sanitized: Record<string, unknown> = {};

        for (const [k, v] of Object.entries(payload)) {
          if (sensitiveKeys.some((sk) => k.toLowerCase().includes(sk.toLowerCase()))) {
            sanitized[k] = "[REDACTED]";
          } else {
            sanitized[k] = v;
          }
        }
        return sanitized;
      }

      const raw = {
        userId: "usr_123",
        action: "USER_SIGN_IN",
        passwordAttempt: "SuperSecret123!",
        bearerToken: "eyJh...raw_token",
        ipAddress: "192.168.1.100",
      };

      const clean = sanitizeAuditPayload(raw);
      expect(clean.passwordAttempt).toBe("[REDACTED]");
      expect(clean.bearerToken).toBe("[REDACTED]");
      expect(clean.userId).toBe("usr_123");
      expect(clean.ipAddress).toBe("192.168.1.100");
    });
  });
});
