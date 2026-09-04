import fs from "node:fs";
import path from "node:path";

export interface VaultNoteMetadata {
  title: string;
  slug: string;
  relativePath: string;
  category: string;
  tags: string[];
  date?: string;
  status?: string;
  type?: string;
  stage?: string;
  dealSize?: string;
  lastModified: string;
  excerpt: string;
}

export interface VaultNoteDetail extends VaultNoteMetadata {
  content: string;
  rawContent: string;
  frontmatter: Record<string, unknown>;
}

const notionDir = path.resolve(process.cwd(), "../../notion");
const fallbackNotionDir = path.resolve(process.cwd(), "notion");
const sourceDir = fs.existsSync(notionDir)
  ? notionDir
  : fs.existsSync(fallbackNotionDir)
  ? fallbackNotionDir
  : "";

const destDir = path.resolve(process.cwd(), "content/vault");
const bundleFile = path.resolve(process.cwd(), "content/vault-bundle.json");

function parseFrontmatter(rawContent: string): { frontmatter: Record<string, unknown>; content: string } {
  const trimmed = rawContent.trimStart();
  if (!trimmed.startsWith("---")) {
    return { frontmatter: {}, content: rawContent };
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { frontmatter: {}, content: rawContent };
  }

  const rawYaml = trimmed.slice(3, endIndex).trim();
  const content = trimmed.slice(endIndex + 4).trimStart();
  const frontmatter: Record<string, unknown> = {};

  const lines = rawYaml.split("\n");
  let currentKey: string | null = null;
  let isList = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    if (trimmedLine.startsWith("- ") && currentKey && isList) {
      const val = trimmedLine.slice(2).trim().replace(/^["']|["']$/g, "");
      const arr = frontmatter[currentKey] as string[];
      arr.push(val);
      continue;
    }

    const colonIndex = trimmedLine.indexOf(":");
    if (colonIndex !== -1) {
      const key = trimmedLine.slice(0, colonIndex).trim().toLowerCase();
      const val = trimmedLine.slice(colonIndex + 1).trim();

      if (val === "" || val === "[]") {
        currentKey = key;
        isList = true;
        frontmatter[key] = [];
      } else if (val.startsWith("[") && val.endsWith("]")) {
        currentKey = key;
        isList = false;
        const items = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
        frontmatter[key] = items;
      } else {
        currentKey = key;
        isList = false;
        frontmatter[key] = val.replace(/^["']|["']$/g, "");
      }
    }
  }

  return { frontmatter, content };
}

function createSlug(filePath: string): string {
  return filePath
    .replace(/\.(md|csv)$/i, "")
    .replace(/\\/g, "/")
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "-")
    .replace(/-+/g, "-");
}

function parseCsvToMarkdown(csvContent: string, fileName: string, category: string): {
  title: string;
  content: string;
  excerpt: string;
  frontmatter: Record<string, unknown>;
} {
  const lines = csvContent.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  const title = fileName.replace(/\.csv$/i, "").replace(/_/g, " ");

  if (lines.length === 0) {
    return {
      title,
      content: `# 📊 ${title}\n\n*Empty database.*`,
      excerpt: "Empty database",
      frontmatter: { title, type: "database", category, tags: ["database", "notion-database"] },
    };
  }

  const parseRow = (line: string): string[] => {
    const row: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        row.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    row.push(cur.trim());
    return row;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);

  const headerLine = `| ${headers.join(" | ")} |`;
  const separatorLine = `| ${headers.map(() => ":---").join(" | ")} |`;
  const bodyLines = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");

  const mdTable = `${headerLine}\n${separatorLine}\n${bodyLines}`;
  const content = `# 📊 ${title} (Notion Relational Database)\n\n> **Live Relational Database** — ${rows.length} records synchronizing with Notion OS.\n\n${mdTable}\n`;
  const excerpt = `Notion relational database containing ${rows.length} records.`;

  return {
    title,
    content,
    excerpt,
    frontmatter: {
      title,
      type: "database",
      category,
      tags: ["database", "notion", "crm"],
    },
  };
}

function cleanDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanDir(full);
      fs.rmdirSync(full);
    } else {
      fs.unlinkSync(full);
    }
  }
}

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".obsidian") || entry.name.startsWith(".")) {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".csv"))) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`[NOTION SYNC] Copied: ${entry.name}`);
    }
  }
}

if (sourceDir && fs.existsSync(sourceDir)) {
  console.log(`[NOTION SYNC] Cleaning target ${destDir}...`);
  cleanDir(destDir);
  console.log(`[NOTION SYNC] Syncing from ${sourceDir} -> ${destDir}...`);
  copyDirRecursive(sourceDir, destDir);
  console.log(`[NOTION SYNC] Workspace successfully synced!`);
} else {
  console.log(`[NOTION SYNC] Source notion workspace not found at ${sourceDir}, scanning ${destDir}.`);
}

// Generate static JSON bundle for zero-tracing production builds
const readVaultDir = fs.existsSync(destDir) ? destDir : (sourceDir && fs.existsSync(sourceDir) ? sourceDir : "");
const noteDetails: VaultNoteDetail[] = [];

if (readVaultDir) {
  function scanForBundle(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".obsidian") || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanForBundle(full);
      } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".csv"))) {
        const rawContent = fs.readFileSync(full, "utf-8");
        const stats = fs.statSync(full);
        const relative = path.relative(readVaultDir, full).replace(/\\/g, "/");
        const pathParts = relative.split("/");
        const category = pathParts.length > 1 ? pathParts[0] : "Root Index";

        let title = "";
        let content = "";
        let excerpt = "";
        let frontmatter: Record<string, unknown> = {};

        if (entry.name.endsWith(".csv")) {
          const csvResult = parseCsvToMarkdown(rawContent, entry.name, category);
          title = csvResult.title;
          content = csvResult.content;
          excerpt = csvResult.excerpt;
          frontmatter = csvResult.frontmatter;
        } else {
          const parsed = parseFrontmatter(rawContent);
          frontmatter = parsed.frontmatter;
          content = parsed.content;
          title =
            (typeof frontmatter.title === "string" && frontmatter.title.trim()) ||
            entry.name.replace(/\.md$/i, "").replace(/_/g, " ");

          const lines = content.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
          excerpt = lines.length > 0 ? lines[0].replace(/[*_#`[\]]/g, "").slice(0, 160) : "";
        }

        const tags: string[] = Array.isArray(frontmatter.tags)
          ? (frontmatter.tags as string[])
          : typeof frontmatter.tags === "string"
          ? [frontmatter.tags]
          : [];

        const hashTagMatches = content.match(/#([a-zA-Z0-9_-]+)/g);
        if (hashTagMatches) {
          for (const ht of hashTagMatches) {
            const cleanTag = ht.slice(1);
            if (!tags.includes(cleanTag) && cleanTag.length > 2) {
              tags.push(cleanTag);
            }
          }
        }

        noteDetails.push({
          title,
          slug: createSlug(relative),
          relativePath: relative,
          category,
          tags,
          date: typeof frontmatter.date === "string" ? frontmatter.date : undefined,
          status: typeof frontmatter.status === "string" ? frontmatter.status : undefined,
          type: typeof frontmatter.type === "string" ? frontmatter.type : undefined,
          stage: typeof frontmatter.stage === "string" ? frontmatter.stage : undefined,
          dealSize: typeof frontmatter.dealsize === "string"
            ? (frontmatter.dealsize as string)
            : typeof frontmatter.deal_size === "string"
            ? (frontmatter.deal_size as string)
            : undefined,
          lastModified: stats.mtime.toISOString(),
          excerpt,
          content,
          rawContent,
          frontmatter,
        });
      }
    }
  }
  scanForBundle(readVaultDir);
}

// Sort: Command Center first, then Setup Guide, then alphabetical
noteDetails.sort((a, b) => {
  const aLower = a.relativePath.toLowerCase();
  const bLower = b.relativePath.toLowerCase();
  if (aLower.includes("command_center")) return -1;
  if (bLower.includes("command_center")) return 1;
  if (aLower.includes("notion_setup")) return -1;
  if (bLower.includes("notion_setup")) return 1;
  return a.relativePath.localeCompare(b.relativePath);
});

fs.writeFileSync(bundleFile, JSON.stringify(noteDetails, null, 2), "utf-8");
console.log(`[NOTION SYNC] Bundled ${noteDetails.length} Notion documents & databases into ${bundleFile}`);


