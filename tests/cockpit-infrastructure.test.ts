import { describe, expect, it } from "bun:test";
import { CLOUD_SERVICES } from "../components/cockpit/cloud-infrastructure-hub";

describe("Executive Cockpit & Cloud Infrastructure Suite", () => {
  it("defines all critical production cloud services for Yorkstead Systems", () => {
    const titles = CLOUD_SERVICES.map((s) => s.title);

    expect(titles).toContain("Cloudflare Edge & DNS");
    expect(titles).toContain("Google Cloud Run");
    expect(titles).toContain("Neon PostgreSQL");
    expect(titles).toContain("Cloudflare R2 Storage");
    expect(titles).toContain("GitHub Workflows & CI/CD");
    expect(titles).toContain("Resend Email Infrastructure");
    expect(titles).toContain("Spaceship Console & Spacemail");
  });

  it("ensures all cloud service URLs are secure HTTPS endpoints", () => {
    for (const service of CLOUD_SERVICES) {
      expect(service.href.startsWith("https://")).toBe(true);
      expect(service.status).toBeDefined();
      expect(service.category).toBeDefined();
    }
  });

  it("categorizes infrastructure across compute, database, edge, communications, and CI/CD", () => {
    const categories = new Set(CLOUD_SERVICES.map((s) => s.category));

    expect(categories.has("Cloud Compute")).toBe(true);
    expect(categories.has("Database & Storage")).toBe(true);
    expect(categories.has("Edge & Networking")).toBe(true);
    expect(categories.has("Communications")).toBe(true);
    expect(categories.has("CI/CD & Delivery")).toBe(true);
  });
});
