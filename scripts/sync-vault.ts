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

const sourceDir = path.resolve(process.cwd(), "../../../../obsidian/yorkstead");
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
      const key = trimmedLine.slice(0, colonIndex).trim();
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
    .replace(/\.md$/i, "")
    .replace(/\\/g, "/")
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "-")
    .replace(/-+/g, "-");
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
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`[VAULT SYNC] Copied: ${entry.name}`);
    }
  }
}

if (fs.existsSync(sourceDir)) {
  console.log(`[VAULT SYNC] Syncing from ${sourceDir} -> ${destDir}...`);
  copyDirRecursive(sourceDir, destDir);
  console.log(`[VAULT SYNC] Vault successfully synced!`);
} else {
  console.log(`[VAULT SYNC] Source vault not found at ${sourceDir}, keeping existing content/vault.`);
}

// Generate static JSON bundle for zero-tracing production builds
const readVaultDir = fs.existsSync(destDir) ? destDir : (fs.existsSync(sourceDir) ? sourceDir : "");
const noteDetails: VaultNoteDetail[] = [];

if (readVaultDir) {
  function scanForBundle(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".obsidian") || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanForBundle(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const rawContent = fs.readFileSync(full, "utf-8");
        const stats = fs.statSync(full);
        const { frontmatter, content } = parseFrontmatter(rawContent);
        const relative = path.relative(readVaultDir, full).replace(/\\/g, "/");
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
          dealSize: typeof frontmatter.deal_size === "string" ? frontmatter.deal_size : undefined,
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

fs.writeFileSync(bundleFile, JSON.stringify(noteDetails, null, 2), "utf-8");
console.log(`[VAULT SYNC] Bundled ${noteDetails.length} notes into ${bundleFile}`);

