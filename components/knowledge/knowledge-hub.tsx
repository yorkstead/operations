'use client';

import * as React from "react";
import { ObsidianVaultBrowser } from "@/components/knowledge/obsidian-vault-browser";
import { KnowHowWorkspace } from "@/components/knowledge/knowhow-workspace";
import { BookOpen, Wrench } from "lucide-react";

export function KnowledgeHub() {
  const [activeTab, setActiveTab] = React.useState<"vault" | "sop">("vault");

  return (
    <div className="space-y-6">
      {/* Tab Navigation Switcher */}
      <div className="flex items-center justify-between border-b border-border pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("vault")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-t-lg transition border-b-2 ${
              activeTab === "vault"
                ? "border-primary text-primary font-bold bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <BookOpen className="size-4" />
            <span>Obsidian Operations Vault</span>
            <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded-full font-mono">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sop")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-t-lg transition border-b-2 ${
              activeTab === "sop"
                ? "border-primary text-primary font-bold bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Wrench className="size-4" />
            <span>Shopfloor Procedures (SOP)</span>
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {activeTab === "vault" ? <ObsidianVaultBrowser /> : <KnowHowWorkspace />}
    </div>
  );
}
