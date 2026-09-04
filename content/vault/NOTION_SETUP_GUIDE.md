# 🚀 Yorkstead Systems — Notion Setup & Import Guide

Welcome to your **Yorkstead Notion Operating System (OS)**!

This workspace consolidates all information regarding Yorkstead Systems — including your commercial CRM, system specifications, rugged forklift hardware blueprints, sales playbooks, regional freight intelligence, daily logs, and brand doctrine.

---

## 📥 Method 1: 1-Click Import into Notion Desktop (Fastest — 30 Seconds)

Your Notion Desktop application is installed and active on Windows. Follow these simple steps to import the entire workspace:

1. **Open Notion Desktop.**
2. In the left sidebar, click **"Import"** (near the bottom left of the sidebar, or in the page menu `...` -> `Import`).
3. In the Import modal, select **"Markdown & CSV"**.
4. A file picker will appear. Navigate to:
   ```
   C:\Users\4twen\dev\yorkstead-systems\notion\
   ```
   *(Or choose the zipped archive: `C:\Users\4twen\dev\yorkstead-systems\exports\Yorkstead_Notion_OS_Bundle.zip`)*
5. Select the files / folder and click **Open**.
6. Notion will automatically:
   * Import all markdown pages with nested headers, code snippets, and callouts.
   * Import `Clients_Database.csv`, `Systems_Database.csv`, `Playbooks_Database.csv`, and `Daily_Logs_Database.csv` into native Notion relational databases.
   * Preserve all relative page links.
7. Rename the imported root page to **"Yorkstead Systems OS"** and set an icon (e.g., 🌐 or ⚡).

---

## 🔄 Method 2: Programmatic Notion API Sync (Automated)

If you want automated two-way or one-way synchronization between your local code repository and your live Notion cloud workspace:

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and click **"+ New integration"**.
2. Name it **"Yorkstead OS Sync"**, select your workspace, and copy the **Internal Integration Secret**.
3. In `C:\Users\4twen\dev\yorkstead-systems\core\operations\.env.local` (or your shell), set:
   ```env
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Run the sync command:
   ```powershell
   cd C:\Users\4twen\dev\yorkstead-systems
   bun run scripts/notion-sync.ts
   ```

---

## 🖥️ Method 3: Access Directly inside Yorkstead Operations Cockpit

You don't even have to leave your code editor or browser to browse this information:
* Open [ops.yorkstead.com](https://ops.yorkstead.com) (or run `bun run dev` in `core/operations`).
* Navigate to **Knowledge OS (Notion Hub)**.
* All dossiers, hardware specs, and playbooks are parsed and searchable with zero cloud latency.
