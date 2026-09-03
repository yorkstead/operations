// app/demo/page.tsx
"use client";

import React, { useState } from "react";
import { getAllDemoModules } from "@/modules/demo/demo-registry";
import { OperationalScenarioDisplay } from "@/components/demo/operational-scenario-display";

export default function DemoPage() {
  const modules = getAllDemoModules();
  const [selectedId, setSelectedId] = useState(modules[0]?.id);

  const activeModule = modules.find((m) => m.id === selectedId) ?? modules[0];

  return (
    <main className="min-h-screen bg-black py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Industry / Workflow Module Switcher */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 overflow-x-auto">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedId(mod.id)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded transition-colors whitespace-nowrap ${
                mod.id === activeModule?.id
                  ? "bg-zinc-100 text-zinc-950 font-bold shadow"
                  : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {mod.title}
            </button>
          ))}
        </div>

        {/* Render the Active Operational Scenario */}
        {activeModule ? (
          <OperationalScenarioDisplay key={activeModule.id} demoModule={activeModule} />
        ) : null}
      </div>
    </main>
  );
}
