'use client';

import * as React from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Briefcase,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface CockpitTask {
  id: string;
  title: string;
  category: "Client Deliverable" | "Platform Core" | "Infrastructure" | "Consulting";
  clientName?: string;
  priority: "urgent" | "high" | "standard" | "low";
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

const DEFAULT_TASKS: CockpitTask[] = [
  {
    id: "task_1",
    title: "Configure Cloudflare R2 object vault for client drawing packets & CAD artifacts",
    category: "Infrastructure",
    clientName: "Yorkstead Core",
    priority: "urgent",
    dueDate: "Today",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task_2",
    title: "Verify zero-cross-tenant isolation on QuoteFlow cost model exports",
    category: "Platform Core",
    clientName: "Yorkstead Systems",
    priority: "high",
    dueDate: "Today",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task_3",
    title: "Implement milestone deliverable checklist in Client Engagements module",
    category: "Client Deliverable",
    clientName: "Front Range MFG",
    priority: "high",
    dueDate: "Tomorrow",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task_4",
    title: "Prepare automated workflow scoping audit for prospective industrial client",
    category: "Consulting",
    clientName: "Mile High Signworks",
    priority: "standard",
    dueDate: "This Week",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task_5",
    title: "Review Spaceship Spacemail DNS deliverability and DMARC alignment",
    category: "Infrastructure",
    clientName: "brandon@yorkstead.com",
    priority: "standard",
    dueDate: "This Week",
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

export function TaskDeliveryEngine() {
  const [tasks, setTasks] = React.useState<CockpitTask[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("yorkstead_cockpit_tasks");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return DEFAULT_TASKS;
  });

  const [filterView, setFilterView] = React.useState<"All" | "Pending" | "Completed">("Pending");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All");
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] = React.useState<CockpitTask["category"]>("Client Deliverable");
  const [newPriority, setNewPriority] = React.useState<CockpitTask["priority"]>("standard");
  const [newClient, setNewClient] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("yorkstead_cockpit_tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: CockpitTask = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      clientName: newClient.trim() || undefined,
      priority: newPriority,
      dueDate: "Active Sprint",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewClient("");
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterView === "Pending" && task.completed) return false;
    if (filterView === "Completed" && !task.completed) return false;
    if (categoryFilter !== "All" && task.category !== categoryFilter) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <Card className="border-border bg-card/80 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <CardTitle className="text-base font-bold tracking-tight">
                Task & Deliverable Engine
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Direct execution pipeline for client milestones, infrastructure fixes, and software delivery sprints.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="h-8 gap-1 font-mono text-xs"
            >
              <Plus className="size-3.5" />
              <span>New Task</span>
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
          <div className="flex gap-1">
            {(["Pending", "All", "Completed"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setFilterView(view)}
                className={`rounded-lg px-2.5 py-1 font-mono text-xs transition ${
                  filterView === view
                    ? "bg-primary/20 text-primary font-semibold border border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {view}
                <span className="ml-1.5 text-[10px] opacity-75">
                  {view === "Pending" ? pendingCount : view === "Completed" ? completedCount : tasks.length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            {["All", "Client Deliverable", "Platform Core", "Infrastructure", "Consulting"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-2 py-0.5 font-mono text-[9px] transition ${
                  categoryFilter === cat
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quick Add Form */}
        {isAdding && (
          <form onSubmit={addTask} className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <Input
              placeholder="What needs to be delivered? (e.g. Implement client auth flow)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              required
              className="text-xs h-9"
            />
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Client Name or Module (optional)"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                className="text-xs h-8 w-48"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CockpitTask["category"])}
                className="h-8 rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground"
              >
                <option value="Client Deliverable">Client Deliverable</option>
                <option value="Platform Core">Platform Core</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Consulting">Consulting</option>
              </select>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as CockpitTask["priority"])}
                className="h-8 rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High Priority</option>
                <option value="standard">Standard</option>
                <option value="low">Low Priority</option>
              </select>
              <Button type="submit" size="sm" className="h-8 ml-auto font-mono text-xs">
                Save Task
              </Button>
            </div>
          </form>
        )}

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-border p-6 text-center">
            <div>
              <CheckCircle2 className="mx-auto mb-2 size-6 text-emerald-400 opacity-60" />
              <p className="text-xs font-mono text-muted-foreground">
                {filterView === "Pending" ? "Zero pending tasks. Ready for next sprint focus." : "No tasks found in this view."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-start justify-between gap-3 rounded-xl border p-3.5 transition ${
                  task.completed
                    ? "border-border/40 bg-background/30 opacity-60"
                    : "border-border/80 bg-background/60 hover:border-primary/40 hover:bg-background/80"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 shrink-0 text-muted-foreground transition hover:text-primary"
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium leading-5 ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                      {task.clientName && (
                        <span className="flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-muted-foreground">
                          <Briefcase className="size-2.5 text-primary" />
                          {task.clientName}
                        </span>
                      )}

                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                        {task.category}
                      </Badge>

                      {task.priority === "urgent" && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 text-destructive border-destructive/30">
                          Urgent
                        </Badge>
                      )}
                      {task.priority === "high" && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 text-amber-400 border-amber-500/30">
                          High
                        </Badge>
                      )}

                      {task.dueDate && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="size-2.5" />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  className="size-7 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                  aria-label="Delete task"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
