import { describe, expect, it } from "bun:test";
import {
  QUICK_LINKS,
  DEFAULT_CALENDAR_EVENTS,
  getRelativeDateStr,
} from "../lib/cockpit-data";

describe("Project Command Center: Quicklinks Hub", () => {
  it("defines comprehensive quicklinks across all four core business categories", () => {
    expect(QUICK_LINKS.length).toBeGreaterThanOrEqual(12);

    const categories = new Set(QUICK_LINKS.map((l) => l.category));
    expect(categories.has("Production")).toBe(true);
    expect(categories.has("Commercial")).toBe(true);
    expect(categories.has("Plant Ops")).toBe(true);
    expect(categories.has("Platform")).toBe(true);
  });

  it("ensures every quicklink has valid operational routing path and description", () => {
    for (const link of QUICK_LINKS) {
      expect(link.id).toBeDefined();
      expect(link.title.length).toBeGreaterThan(0);
      expect(link.href.startsWith("/")).toBe(true);
      expect(link.description.length).toBeGreaterThan(10);
      expect(link.tag).toBeDefined();
      expect(link.iconName).toBeDefined();
    }
  });

  it("includes critical shopfloor, engagement, quoting, and maintenance destinations", () => {
    const hrefs = QUICK_LINKS.map((l) => l.href);
    expect(hrefs).toContain("/shopfloor");
    expect(hrefs).toContain("/engagements");
    expect(hrefs).toContain("/quotes");
    expect(hrefs).toContain("/inventory");
    expect(hrefs).toContain("/maintenance");
    expect(hrefs).toContain("/quality");
    expect(hrefs).toContain("/infrastructure");
    expect(hrefs).toContain("/demo");
  });
});

describe("Project Command Center: Operator Calendar", () => {
  it("calculates relative ISO date strings correctly", () => {
    const todayStr = getRelativeDateStr(0);
    expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const futureStr = getRelativeDateStr(3);
    expect(futureStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(futureStr >= todayStr).toBe(true);
  });

  it("provides comprehensive default calendar events for client milestones and audits", () => {
    expect(DEFAULT_CALENDAR_EVENTS.length).toBeGreaterThanOrEqual(5);

    const categories = new Set(DEFAULT_CALENDAR_EVENTS.map((e) => e.category));
    expect(categories.has("Client Milestone")).toBe(true);
    expect(categories.has("Audit & Review")).toBe(true);
    expect(categories.has("Sprint Deadline")).toBe(true);
    expect(categories.has("Maintenance Window")).toBe(true);
  });

  it("ensures all calendar events have required milestone metadata", () => {
    for (const event of DEFAULT_CALENDAR_EVENTS) {
      expect(event.id).toBeDefined();
      expect(event.title.length).toBeGreaterThan(5);
      expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(event.status).toBeDefined();
      expect(event.clientName).toBeDefined();
    }
  });
});
