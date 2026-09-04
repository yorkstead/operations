'use client';

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Folder,
  FileText,
  Search,
  Tag,
  ExternalLink,
  RefreshCw,
  Clock,
  BookOpen,
  AlertTriangle,
  Info,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import type { VaultNoteDetail, VaultSummary } from "@/modules/knowledge/infrastructure/obsidian-vault";

export function ObsidianVaultBrowser() {
  const [summary, setSummary] = React.useState<VaultSummary | null>(null);
  const [selectedNote, setSelectedNote] = React.useState<VaultNoteDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [noteLoading, setNoteLoading] = React.useState<boolean>(false);
  const [viewMode, setViewMode] = React.useState<"rendered" | "raw">("rendered");

  const loadNoteDetail = React.useCallback(async (slugOrPath: string) => {
    setNoteLoading(true);
    try {
      const res = await fetch(`/api/knowledge/vault?slug=${encodeURIComponent(slugOrPath)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedNote(data.note);
      }
    } catch (err) {
      console.error("Failed to load note detail:", err);
    } finally {
      setNoteLoading(false);
    }
  }, []);

  const loadVaultData = React.useCallback(async (query = "", category = "All", tag: string | null = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category && category !== "All") params.set("category", category);
      if (tag) params.set("tag", tag);

      const res = await fetch(`/api/knowledge/vault?${params.toString()}`);
      if (res.ok) {
        const data: VaultSummary = await res.json();
        setSummary(data);

        // Auto-select dashboard or first note if nothing selected
        if (!selectedNote && data.notes.length > 0) {
          const defaultNote = data.notes.find((n) => n.relativePath.includes("Dashboard")) || data.notes[0];
          void loadNoteDetail(defaultNote.slug);
        }
      }
    } catch (err) {
      console.error("Failed to load vault data:", err);
    } finally {
      setLoading(false);
    }
  }, [loadNoteDetail, selectedNote]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadVaultData(searchQuery, selectedCategory, selectedTag);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadVaultData, searchQuery, selectedCategory, selectedTag]);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
  };

  const handleTagClick = (t: string) => {
    setSelectedTag((prev) => (prev === t ? null : t));
  };

  const handleWikilinkClick = (linkTarget: string) => {
    const cleanTarget = linkTarget.split("|")[0].trim();
    void loadNoteDetail(cleanTarget);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            <h1 className="text-xl font-bold font-mono tracking-tight text-foreground sm:text-2xl">
              Yorkstead Knowledge Vault
            </h1>
            <Badge variant="outline" className="font-mono text-[10px] uppercase border-primary/40 text-primary">
              Obsidian Local Storage
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground font-mono">
            Synced directly from <code className="text-foreground bg-muted px-1.5 py-0.5 rounded">obsidian/yorkstead/</code>. Real-time client dossiers, product specs, and daily logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadVaultData(searchQuery, selectedCategory, selectedTag)}
            disabled={loading}
            className="font-mono text-xs gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync Now
          </Button>

          {selectedNote && (
            <Button
              variant="default"
              size="sm"
              asChild
              className="font-mono text-xs gap-1.5 bg-primary hover:bg-primary/90"
            >
              <a href={`obsidian://open?vault=yorkstead&file=${encodeURIComponent(selectedNote.relativePath.replace(/\.md$/, ""))}`}>
                <ExternalLink className="size-3.5" />
                Open in Obsidian
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout: Sidebar & Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Explorer & File Tree (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search notes, tags, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-mono text-xs bg-card"
            />
          </div>

          {/* Folder Categories */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1 flex items-center justify-between">
              <span>Vault Folders</span>
              <span>{summary?.notes.length || 0} notes</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleCategoryClick("All")}
                className={`text-xs font-mono px-2.5 py-1 rounded border transition ${
                  selectedCategory === "All"
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                All
              </button>
              {summary?.categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`text-xs font-mono px-2 py-1 rounded border transition flex items-center gap-1.5 ${
                    selectedCategory === cat.name
                      ? "bg-primary text-primary-foreground border-primary font-semibold"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  <Folder className="size-3 shrink-0" />
                  <span className="truncate max-w-[130px]">{cat.name.replace(/^\d+\s*-\s*/, "")}</span>
                  <span className="text-[10px] opacity-70">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {summary?.tags && summary.tags.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1">
                <Tag className="size-3" />
                <span>Filter by Tag</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {summary.tags.slice(0, 8).map((t) => (
                  <button
                    key={t.name}
                    onClick={() => handleTagClick(t.name)}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded transition flex items-center gap-1 ${
                      selectedTag === t.name
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>#{t.name}</span>
                    <span className="text-[9px] opacity-70">({t.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note List */}
          <div className="border border-border rounded-lg bg-card overflow-hidden divide-y divide-border max-h-[580px] overflow-y-auto">
            {loading && !summary ? (
              <div className="p-8 text-center text-xs font-mono text-muted-foreground">
                <RefreshCw className="size-4 animate-spin mx-auto mb-2 text-primary" />
                Scanning vault markdown files...
              </div>
            ) : summary?.notes.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-muted-foreground">
                No matching notes found.
              </div>
            ) : (
              summary?.notes.map((note) => {
                const isSelected = selectedNote?.slug === note.slug;
                return (
                  <button
                    key={note.relativePath}
                    onClick={() => void loadNoteDetail(note.slug)}
                    className={`w-full text-left p-3 transition flex flex-col gap-1.5 ${
                      isSelected ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className={`size-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium line-clamp-1 ${isSelected ? "text-foreground font-semibold" : "text-foreground/90"}`}>
                          {note.title}
                        </span>
                      </div>
                      {note.dealSize && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/40 text-emerald-400 shrink-0 font-mono">
                          {note.dealSize}
                        </Badge>
                      )}
                    </div>

                    {note.excerpt && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {note.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/80 pt-0.5">
                      <span className="truncate max-w-[140px] text-muted-foreground">
                        {note.category.replace(/^\d+\s*-\s*/, "")}
                      </span>
                      {note.date && <span>{note.date}</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Note Reader (8 Cols) */}
        <div className="lg:col-span-8">
          {noteLoading ? (
            <Card className="h-full min-h-[500px] flex items-center justify-center">
              <div className="text-center font-mono text-xs text-muted-foreground">
                <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                Loading note...
              </div>
            </Card>
          ) : !selectedNote ? (
            <Card className="h-full min-h-[500px] flex items-center justify-center p-8 text-center">
              <div className="max-w-md space-y-3 font-mono text-xs text-muted-foreground">
                <BookOpen className="size-8 mx-auto text-primary opacity-60" />
                <p>Select a note from the vault explorer to view client records, specifications, and commercial strategies.</p>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden border-border bg-card">
              {/* Note Header */}
              <CardHeader className="border-b border-border bg-muted/20 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                        {selectedNote.category}
                      </Badge>
                      {selectedNote.status && (
                        <Badge variant="default" className="font-mono text-[10px] bg-primary/20 text-primary border border-primary/40">
                          {selectedNote.status}
                        </Badge>
                      )}
                      {selectedNote.stage && (
                        <Badge variant="outline" className="font-mono text-[10px] border-amber-500/40 text-amber-400">
                          Stage: {selectedNote.stage}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold font-mono tracking-tight text-foreground">
                      {selectedNote.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono text-muted-foreground flex items-center gap-3">
                      <span>📄 {selectedNote.relativePath}</span>
                      {selectedNote.lastModified && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(selectedNote.lastModified).toLocaleDateString()}
                        </span>
                      )}
                    </CardDescription>
                  </div>

                  {/* Toggle Mode */}
                  <div className="flex items-center gap-1 bg-muted p-0.5 rounded border border-border">
                    <button
                      onClick={() => setViewMode("rendered")}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded transition ${
                        viewMode === "rendered" ? "bg-background text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Reader
                    </button>
                    <button
                      onClick={() => setViewMode("raw")}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded transition ${
                        viewMode === "raw" ? "bg-background text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Raw Markdown
                    </button>
                  </div>
                </div>

                {/* Tag Badges */}
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedNote.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="text-[10px] font-mono bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/60 hover:text-primary cursor-pointer transition"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardHeader>

              {/* Note Body */}
              <CardContent className="p-6">
                {viewMode === "raw" ? (
                  <pre className="font-mono text-xs bg-muted/40 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed text-foreground/90 border border-border">
                    {selectedNote.rawContent}
                  </pre>
                ) : (
                  <div className="prose prose-invert max-w-none space-y-4">
                    <MarkdownViewer content={selectedNote.content} onWikilinkClick={handleWikilinkClick} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------
// Tailored Markdown & Obsidian Callout Parser Component
// -------------------------------------------------------------------------------------
function MarkdownViewer({
  content,
  onWikilinkClick,
}: {
  content: string;
  onWikilinkClick: (target: string) => void;
}) {
  const blocks = React.useMemo(() => {
    return parseMarkdownBlocks(content);
  }, [content]);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
      {blocks.map((block, idx) => (
        <BlockRenderer key={idx} block={block} onWikilinkClick={onWikilinkClick} />
      ))}
    </div>
  );
}

interface MarkdownBlock {
  type: "heading" | "paragraph" | "callout" | "table" | "code" | "list" | "divider";
  level?: number;
  calloutType?: string;
  title?: string;
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  language?: string;
}

function parseMarkdownBlocks(rawText: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = rawText.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // Divider
    if (trimmed === "---" || trimmed === "***") {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // Fenced Code Block
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      blocks.push({ type: "code", language, text: codeLines.join("\n") });
      continue;
    }

    // Obsidian Callouts: > [!tip], > [!info], > [!warning], etc.
    if (trimmed.startsWith("> [!")) {
      const match = trimmed.match(/^>\s*\[!([a-zA-Z_-]+)\]\s*(.*)$/);
      const calloutType = match ? match[1].toLowerCase() : "info";
      const calloutTitle = match && match[2] ? match[2].trim() : calloutType.toUpperCase();
      const calloutLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        calloutLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "callout",
        calloutType,
        title: calloutTitle,
        text: calloutLines.join("\n"),
      });
      continue;
    }

    // Headings
    if (trimmed.startsWith("#")) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        blocks.push({
          type: "heading",
          level: match[1].length,
          text: match[2],
        });
        i++;
        continue;
      }
    }

    // Markdown Tables
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .slice(1, -1)
          .split("|")
          .map((s) => s.trim());
        const rows: string[][] = [];
        for (let r = 2; r < tableLines.length; r++) {
          const rowCells = tableLines[r]
            .slice(1, -1)
            .split("|")
            .map((s) => s.trim());
          rows.push(rowCells);
        }
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    // Bullet Lists
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("* ") ||
          lines[i].trim().startsWith("- ") ||
          lines[i].trim().startsWith("• ") ||
          lines[i].startsWith("  "))
      ) {
        const current = lines[i].trim();
        if (current.startsWith("* ") || current.startsWith("- ") || current.startsWith("• ")) {
          listItems.push(current.slice(2));
        } else if (listItems.length > 0) {
          listItems[listItems.length - 1] += " " + current;
        }
        i++;
      }
      blocks.push({ type: "list", items: listItems });
      continue;
    }

    // Regular Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith("* ") &&
      !lines[i].trim().startsWith("- ")
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ") });
  }

  return blocks;
}

function BlockRenderer({
  block,
  onWikilinkClick,
}: {
  block: MarkdownBlock;
  onWikilinkClick: (target: string) => void;
}) {
  switch (block.type) {
    case "heading": {
      const level = block.level || 2;
      if (level === 1) {
        return (
          <h1 className="text-xl font-bold border-b border-border pb-2 pt-2 text-primary font-mono">
            {renderInlineText(block.text || "", onWikilinkClick)}
          </h1>
        );
      }
      if (level === 2) {
        return (
          <h2 className="text-lg font-bold text-foreground font-mono pt-3">
            {renderInlineText(block.text || "", onWikilinkClick)}
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3 className="text-base font-semibold text-foreground/90 font-mono pt-2">
            {renderInlineText(block.text || "", onWikilinkClick)}
          </h3>
        );
      }
      return (
        <h4 className="text-sm font-semibold text-foreground/80 font-mono pt-1">
          {renderInlineText(block.text || "", onWikilinkClick)}
        </h4>
      );
    }

    case "divider":
      return <hr className="border-border my-4" />;

    case "paragraph":
      return <p className="leading-relaxed text-foreground/80">{renderInlineText(block.text || "", onWikilinkClick)}</p>;

    case "list":
      return (
        <ul className="list-disc list-inside space-y-1.5 pl-1 text-foreground/85">
          {block.items?.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInlineText(item, onWikilinkClick)}
            </li>
          ))}
        </ul>
      );

    case "code":
      return (
        <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs overflow-x-auto text-amber-400">
          <pre>{block.text}</pre>
        </div>
      );

    case "callout": {
      const type = block.calloutType || "info";
      let borderClass = "border-sky-500/40 bg-sky-950/20 text-sky-200";
      let Icon = Info;

      if (type === "tip" || type === "hint") {
        borderClass = "border-emerald-500/40 bg-emerald-950/20 text-emerald-200";
        Icon = Lightbulb;
      } else if (type === "warning" || type === "caution") {
        borderClass = "border-amber-500/40 bg-amber-950/20 text-amber-200";
        Icon = AlertTriangle;
      } else if (type === "important") {
        borderClass = "border-purple-500/40 bg-purple-950/20 text-purple-200";
        Icon = CheckCircle2;
      }

      return (
        <div className={`p-3.5 rounded-lg border my-3 ${borderClass}`}>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Icon className="size-4" />
            <span>{block.title || type}</span>
          </div>
          <div className="text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap">
            {renderInlineText(block.text || "", onWikilinkClick)}
          </div>
        </div>
      );
    }

    case "table":
      return (
        <div className="overflow-x-auto my-3 rounded border border-border">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-muted/60 text-foreground border-b border-border">
              <tr>
                {block.headers?.map((h, i) => (
                  <th key={i} className="p-2.5 font-semibold">
                    {renderInlineText(h, onWikilinkClick)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {block.rows?.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/30 transition">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-foreground/80 align-top">
                      {renderInlineText(cell, onWikilinkClick)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

// Inline Text Formatter (Bold, Wikilinks, Code, URLs)
function renderInlineText(text: string, onWikilinkClick: (target: string) => void): React.ReactNode {
  // Regex parsing: Obsidian wikilinks [[Target|Alias]] or [[Target]], bold **bold**, code `code`, URLs [label](url)
  const regex = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Obsidian Wikilink [[Note Title|Alias]]
    if (part.startsWith("[[") && part.endsWith("]]")) {
      const raw = part.slice(2, -2);
      const [target, alias] = raw.split("|");
      const displayText = alias ? alias.trim() : target.trim();
      return (
        <button
          key={i}
          type="button"
          onClick={() => onWikilinkClick(target)}
          className="text-primary hover:underline font-medium inline-flex items-center gap-0.5 bg-primary/10 px-1.5 py-0.2 rounded transition"
        >
          <span>{displayText}</span>
        </button>
      );
    }

    // Bold **text**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code `code`
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-400">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Standard markdown link [label](url)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const closeBracket = part.indexOf("](");
      const label = part.slice(1, closeBracket);
      const url = part.slice(closeBracket + 2, -1);
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium inline-flex items-center gap-1"
        >
          {label}
          <ExternalLink className="size-3 inline" />
        </a>
      );
    }

    return part;
  });
}
