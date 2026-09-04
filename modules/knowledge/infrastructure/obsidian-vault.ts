import fs from "node:fs";
import path from "node:path";
import bundledNotesRaw from "../../../content/vault-bundle.json";

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

export interface VaultSummary {
  vaultPath: string;
  totalNotes: number;
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  notes: VaultNoteMetadata[];
}

const bundledNotes = bundledNotesRaw as VaultNoteDetail[];

function isProductionOrVercel(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

function resolveVaultDirectory(): string {
  // 1. Explicit environment variable
  if (process.env.NOTION_VAULT_PATH && fs.existsSync(process.env.NOTION_VAULT_PATH)) {
    return process.env.NOTION_VAULT_PATH;
  }
  if (process.env.OBSIDIAN_VAULT_PATH && fs.existsSync(process.env.OBSIDIAN_VAULT_PATH)) {
    return process.env.OBSIDIAN_VAULT_PATH;
  }

  // 2. Relative from core/operations to workspace root notion
  const relativeNotionFromApp = path.resolve(process.cwd(), "../../notion");
  if (fs.existsSync(relativeNotionFromApp)) {
    return relativeNotionFromApp;
  }

  // 3. Fallback to bundled content/vault inside operations app (for Vercel standalone runners)
  const bundledPath = path.resolve(process.cwd(), "content/vault");
  if (fs.existsSync(bundledPath)) {
    return bundledPath;
  }

  // 4. Fallback relative from repository root if running elsewhere
  const fromRepoRoot = path.resolve(process.cwd(), "notion");
  if (fs.existsSync(fromRepoRoot)) {
    return fromRepoRoot;
  }

  return relativeNotionFromApp;
}

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

export function listVaultNotes(searchQuery?: string, selectedCategory?: string, selectedTag?: string): VaultSummary {
  // Use pre-bundled static notes whenever available for fast, zero-tracing lookups
  if (bundledNotes.length > 0) {
    const notes: VaultNoteMetadata[] = [];
    const categoryCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();

    for (const note of bundledNotes) {
      const category = note.category;
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      for (const t of note.tags) {
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
      }

      if (selectedCategory && selectedCategory !== "All" && category !== selectedCategory) {
        continue;
      }

      if (selectedTag && !note.tags.includes(selectedTag)) {
        continue;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          note.title.toLowerCase().includes(q) ||
          note.relativePath.toLowerCase().includes(q) ||
          note.tags.some((t) => t.toLowerCase().includes(q)) ||
          note.content.toLowerCase().includes(q);
        if (!matches) continue;
      }

      notes.push({
        title: note.title,
        slug: note.slug,
        relativePath: note.relativePath,
        category: note.category,
        tags: note.tags,
        date: note.date,
        status: note.status,
        type: note.type,
        stage: note.stage,
        dealSize: note.dealSize,
        lastModified: note.lastModified,
        excerpt: note.excerpt,
      });
    }

    notes.sort((a, b) => {
      const aLower = a.relativePath.toLowerCase();
      const bLower = b.relativePath.toLowerCase();
      if (aLower.includes("command_center") || a.title.toLowerCase().includes("command center")) return -1;
      if (bLower.includes("command_center") || b.title.toLowerCase().includes("command center")) return 1;
      if (aLower.includes("notion_setup")) return -1;
      if (bLower.includes("notion_setup")) return 1;
      return a.relativePath.localeCompare(b.relativePath);
    });

    const categories = Array.from(categoryCounts.entries()).map(([name, count]) => ({ name, count }));
    const tags = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      vaultPath: "content/vault-bundle.json",
      totalNotes: notes.length,
      categories,
      tags,
      notes,
    };
  }

  const vaultDir = resolveVaultDirectory();
  const notes: VaultNoteMetadata[] = [];
  const categoryCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  if (!fs.existsSync(vaultDir)) {
    return {
      vaultPath: vaultDir,
      totalNotes: 0,
      categories: [],
      tags: [],
      notes: [],
    };
  }

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".obsidian") || entry.name.startsWith(".")) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const stats = fs.statSync(fullPath);
        const { frontmatter, content } = parseFrontmatter(raw);

        const relative = path.relative(vaultDir, fullPath).replace(/\\/g, "/");
        const pathParts = relative.split("/");
        const category = pathParts.length > 1 ? pathParts[0] : "Root Index";

        const title =
          (typeof frontmatter.title === "string" && frontmatter.title.trim()) ||
          entry.name.replace(/\.md$/i, "");

        const tags: string[] = Array.isArray(frontmatter.tags)
          ? (frontmatter.tags as string[])
          : typeof frontmatter.tags === "string"
          ? [frontmatter.tags]
          : [];

        // Also detect #tags in content if not in frontmatter
        const hashTagMatches = content.match(/#([a-zA-Z0-9_-]+)/g);
        if (hashTagMatches) {
          for (const ht of hashTagMatches) {
            const cleanTag = ht.slice(1);
            if (!tags.includes(cleanTag) && cleanTag.length > 2) {
              tags.push(cleanTag);
            }
          }
        }

        const lines = content.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
        const excerpt = lines.length > 0 ? lines[0].replace(/[*_#`[\]]/g, "").slice(0, 160) : "";

        const noteMeta: VaultNoteMetadata = {
          title,
          slug: createSlug(relative),
          relativePath: relative,
          category,
          tags,
          date: typeof frontmatter.date === "string" ? frontmatter.date : undefined,
          status: typeof frontmatter.status === "string" ? frontmatter.status : undefined,
          type: typeof frontmatter.type === "string" ? frontmatter.type : undefined,
          stage: typeof frontmatter.stage === "string" ? frontmatter.stage : undefined,
          dealSize: typeof frontmatter.deal_size === "string" ? frontmatter.deal_size : undefined,
          lastModified: stats.mtime.toISOString(),
          excerpt,
        };

        // Aggregation
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
        for (const t of tags) {
          tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
        }

        // Filtering
        if (selectedCategory && selectedCategory !== "All" && category !== selectedCategory) {
          continue;
        }

        if (selectedTag && !tags.includes(selectedTag)) {
          continue;
        }

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches =
            title.toLowerCase().includes(q) ||
            relative.toLowerCase().includes(q) ||
            tags.some((t) => t.toLowerCase().includes(q)) ||
            content.toLowerCase().includes(q);
          if (!matches) continue;
        }

        notes.push(noteMeta);
      }
    }
  }

  scanDir(vaultDir);

  // Sort notes: Command Center first, then Setup Guide, then alphabetical
  notes.sort((a, b) => {
    const aLower = a.relativePath.toLowerCase();
    const bLower = b.relativePath.toLowerCase();
    if (aLower.includes("command_center") || a.title.toLowerCase().includes("command center")) return -1;
    if (bLower.includes("command_center") || b.title.toLowerCase().includes("command center")) return 1;
    if (aLower.includes("notion_setup")) return -1;
    if (bLower.includes("notion_setup")) return 1;
    return a.relativePath.localeCompare(b.relativePath);
  });

  const categories = Array.from(categoryCounts.entries()).map(([name, count]) => ({ name, count }));
  const tags = Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    vaultPath: vaultDir,
    totalNotes: notes.length,
    categories,
    tags,
    notes,
  };
}

export function getVaultNoteDetail(slugOrPath: string): VaultNoteDetail | null {
  // Use pre-bundled note detail whenever available for zero cloud latency
  if (bundledNotes.length > 0) {
    const target = slugOrPath.toLowerCase().replace(/\\/g, "/");
    const cleanTarget = target.replace(/^\.\//, "").replace(/\.(md|csv)$/i, "");
    const targetFilename = cleanTarget.split("/").pop() || cleanTarget;

    const found = bundledNotes.find((n) => {
      const slug = n.slug.toLowerCase();
      const rel = n.relativePath.toLowerCase();
      const relNoExt = rel.replace(/\.(md|csv)$/i, "");
      const title = n.title.toLowerCase();
      const filename = rel.split("/").pop() || "";
      const filenameNoExt = filename.replace(/\.(md|csv)$/i, "");

      return (
        slug === target ||
        rel === target ||
        relNoExt === target ||
        title === target ||
        slug === cleanTarget ||
        relNoExt === cleanTarget ||
        filename === target ||
        filenameNoExt === cleanTarget ||
        filenameNoExt === targetFilename ||
        title === targetFilename.replace(/_/g, " ")
      );
    });
    return found || null;
  }

  const vaultDir = resolveVaultDirectory();
  if (!fs.existsSync(vaultDir)) return null;

  let targetFullPath: string | null = null;

  // 1. Check direct relative path match
  const directPath = path.join(vaultDir, slugOrPath);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    targetFullPath = directPath;
  } else if (fs.existsSync(`${directPath}.md`) && fs.statSync(`${directPath}.md`).isFile()) {
    targetFullPath = `${directPath}.md`;
  }

  // 2. Search recursively by slug or name
  if (!targetFullPath) {
    function findRecursive(dir: string): string | null {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".obsidian") || entry.name.startsWith(".")) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const found = findRecursive(full);
          if (found) return found;
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const relative = path.relative(vaultDir, full).replace(/\\/g, "/");
          if (createSlug(relative) === slugOrPath.toLowerCase() || relative.toLowerCase() === slugOrPath.toLowerCase() || entry.name.replace(/\.md$/i, "").toLowerCase() === slugOrPath.toLowerCase()) {
            return full;
          }
        }
      }
      return null;
    }
    targetFullPath = findRecursive(vaultDir);
  }

  if (!targetFullPath || !fs.existsSync(targetFullPath)) {
    return null;
  }

  const rawContent = fs.readFileSync(targetFullPath, "utf-8");
  const stats = fs.statSync(targetFullPath);
  const { frontmatter, content } = parseFrontmatter(rawContent);

  const relative = path.relative(vaultDir, targetFullPath).replace(/\\/g, "/");
  const pathParts = relative.split("/");
  const category = pathParts.length > 1 ? pathParts[0] : "Root Index";

  const title =
    (typeof frontmatter.title === "string" && frontmatter.title.trim()) ||
    path.basename(targetFullPath).replace(/\.md$/i, "");

  const tags: string[] = Array.isArray(frontmatter.tags)
    ? (frontmatter.tags as string[])
    : typeof frontmatter.tags === "string"
    ? [frontmatter.tags]
    : [];

  const lines = content.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  const excerpt = lines.length > 0 ? lines[0].replace(/[*_#`[\]]/g, "").slice(0, 160) : "";

  return {
    title,
    slug: createSlug(relative),
    relativePath: relative,
    category,
    tags,
    date: typeof frontmatter.date === "string" ? frontmatter.date : undefined,
    status: typeof frontmatter.status === "string" ? frontmatter.status : undefined,
    type: typeof frontmatter.type === "string" ? frontmatter.type : undefined,
    stage: typeof frontmatter.stage === "string" ? frontmatter.stage : undefined,
    dealSize: typeof frontmatter.deal_size === "string" ? frontmatter.deal_size : undefined,
    lastModified: stats.mtime.toISOString(),
    excerpt,
    frontmatter,
    content,
    rawContent,
  };
}
