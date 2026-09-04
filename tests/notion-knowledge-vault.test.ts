import { describe, expect, it } from "bun:test";
import { listVaultNotes, getVaultNoteDetail } from "../modules/knowledge/infrastructure/obsidian-vault";

describe("Notion Knowledge OS Workspace & Relational Bundle Suite", () => {
  it("lists all Notion documents and relational databases with Command Center sorted first", () => {
    const summary = listVaultNotes();
    expect(summary.totalNotes).toBeGreaterThanOrEqual(25);

    // Command center must be first
    const firstNote = summary.notes[0];
    expect(firstNote.relativePath.toLowerCase()).toContain("command_center");
    expect(firstNote.title.toLowerCase()).toContain("yorkstead systems");

    // Zero legacy Obsidian dashboard or welcome files
    const legacyDashboard = summary.notes.find((n) => n.relativePath.includes("00 - Yorkstead Dashboard.md"));
    expect(legacyDashboard).toBeUndefined();

    const legacyWelcome = summary.notes.find((n) => n.relativePath.includes("Welcome.md"));
    expect(legacyWelcome).toBeUndefined();
  });

  it("indexes Notion relational CSV databases with database type badge", () => {
    const summary = listVaultNotes();
    const clientDb = summary.notes.find((n) => n.relativePath.includes("Clients_Database.csv"));
    expect(clientDb).toBeDefined();
    expect(clientDb?.type).toBe("database");

    const systemsDb = summary.notes.find((n) => n.relativePath.includes("Systems_Database.csv"));
    expect(systemsDb).toBeDefined();
    expect(systemsDb?.type).toBe("database");
  });

  it("retrieves the Master Command Center with all navigation links intact", () => {
    const detail = getVaultNoteDetail("00_yorkstead_command_center");
    expect(detail).not.toBeNull();
    expect(detail?.title).toContain("Yorkstead Systems");
    expect(detail?.content).toContain("Master Command Center");
    expect(detail?.content).toContain("Denver Express & No Limit");
    expect(detail?.content).toContain("ReworkFlow Terminal Platform");
  });

  it("renders relational CSV database as a structured markdown table", () => {
    const detail = getVaultNoteDetail("clients_database");
    expect(detail).not.toBeNull();
    expect(detail?.type).toBe("database");
    expect(detail?.content).toContain("Notion Relational Database");
    expect(detail?.content).toContain("Denver Express & No Limit Trucking");
  });

  it("resolves relative markdown and csv link targets", () => {
    const reworkflowDetail = getVaultNoteDetail("./02_Systems_and_Products/ReworkFlow_Terminal_Platform.md");
    expect(reworkflowDetail).not.toBeNull();
    expect(reworkflowDetail?.title).toContain("ReworkFlow Terminal Platform");

    const playbookDetail = getVaultNoteDetail("The_9500_Asset_Purchase_Strategy");
    expect(playbookDetail).not.toBeNull();
    expect(playbookDetail?.title).toContain("Asset Purchase Strategy");
  });
});
