'use client';

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_CALENDAR_EVENTS,
  getRelativeDateStr,
  type CalendarEvent,
} from "@/lib/cockpit-data";

const CATEGORY_COLORS: Record<CalendarEvent["category"], { dot: string; badge: string; text: string }> = {
  "Client Milestone": {
    dot: "bg-primary",
    badge: "border-primary/40 bg-primary/10 text-primary",
    text: "text-primary",
  },
  "Sprint Deadline": {
    dot: "bg-amber-400",
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    text: "text-amber-400",
  },
  "Audit & Review": {
    dot: "bg-purple-400",
    badge: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    text: "text-purple-400",
  },
  "Maintenance Window": {
    dot: "bg-emerald-400",
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    text: "text-emerald-400",
  },
};

function formatDateToISO(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function OperatorCalendar() {
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = React.useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDateStr, setSelectedDateStr] = React.useState<string>(getRelativeDateStr(0));
  const [filterCategory, setFilterCategory] = React.useState<string>("All");
  const [isAddingEvent, setIsAddingEvent] = React.useState(false);

  // Form states
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] = React.useState<CalendarEvent["category"]>("Client Milestone");
  const [newTime, setNewTime] = React.useState("10:00 AM");
  const [newClient, setNewClient] = React.useState("");

  const [events, setEvents] = React.useState<CalendarEvent[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("yorkstead_operator_calendar_events");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return DEFAULT_CALENDAR_EVENTS;
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("yorkstead_operator_calendar_events", JSON.stringify(events));
    }
  }, [events]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(getRelativeDateStr(0));
  };

  // Days calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  const todayStr = formatDateToISO(today.getFullYear(), today.getMonth(), today.getDate());

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = formatDateToISO(prevYear, prevMonthIdx, d);
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = formatDateToISO(year, month, d);
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = formatDateToISO(nextYear, nextMonthIdx, d);
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Event handlers
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: `cal_${Date.now()}`,
      title: newTitle.trim(),
      date: selectedDateStr,
      time: newTime.trim() || "All Day",
      category: newCategory,
      clientName: newClient.trim() || undefined,
      status: "upcoming",
    };

    setEvents((prev) => [newEvent, ...prev]);
    setNewTitle("");
    setNewClient("");
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleEventCompleted = (id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: e.status === "completed" ? "upcoming" : "completed",
            }
          : e
      )
    );
  };

  // Selected date agenda
  const selectedDateEvents = events.filter((ev) => {
    const matchesDate = ev.date === selectedDateStr;
    const matchesCategory = filterCategory === "All" || ev.category === filterCategory;
    return matchesDate && matchesCategory;
  });

  const selectedDateObj = new Date(selectedDateStr + "T00:00:00");
  const selectedDateFormatted = selectedDateObj.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const allMonthEvents = events.filter((ev) => {
    if (filterCategory !== "All" && ev.category !== filterCategory) return false;
    return ev.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`);
  });

  const upcomingMilestones = events
    .filter((e) => e.status !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <Card className="border-border bg-card/80 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-primary" />
              <CardTitle className="text-base font-bold tracking-tight">
                Operator Schedule & Delivery Calendar
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Delivery milestones, client review checkpoints, sprint release targets, and scheduled maintenance.
            </CardDescription>
          </div>

          {/* Quick Month Navigation */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={jumpToToday}
              className="h-8 px-2.5 font-mono text-xs"
            >
              Today
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={prevMonth}
              className="size-8"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-28 text-center font-mono text-xs font-semibold text-foreground">
              {monthName}
            </span>
            <Button
              size="icon"
              variant="outline"
              onClick={nextMonth}
              className="size-8"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
          <div className="flex flex-wrap gap-1">
            {(["All", "Client Milestone", "Sprint Deadline", "Audit & Review", "Maintenance Window"] as const).map(
              (cat) => {
                const isSelected = filterCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] transition ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                );
              }
            )}
          </div>

          <Badge variant="outline" className="font-mono text-[9px]">
            {allMonthEvents.length} events this month
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Month Calendar Grid (7 columns) */}
          <div className="lg:col-span-7 space-y-2">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase text-muted-foreground">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Date Cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell) => {
                const isSelected = cell.dateStr === selectedDateStr;
                const cellEvents = events.filter((e) => {
                  if (filterCategory !== "All" && e.category !== filterCategory) return false;
                  return e.date === cell.dateStr;
                });
                const hasEvents = cellEvents.length > 0;

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`group relative flex flex-col items-center justify-between rounded-lg p-1.5 sm:p-2 min-h-12 sm:min-h-14 border text-xs font-mono transition ${
                      isSelected
                        ? "border-primary bg-primary/15 font-bold text-foreground ring-1 ring-primary"
                        : cell.isCurrentMonth
                        ? "border-border/60 bg-background/50 text-foreground hover:border-primary/40 hover:bg-background/80"
                        : "border-transparent bg-background/20 text-muted-foreground/50 hover:bg-background/40"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={`size-5 flex items-center justify-center rounded-full text-[11px] ${
                          cell.isToday
                            ? "bg-primary text-primary-foreground font-bold"
                            : ""
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {cellEvents.length > 1 && (
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {cellEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Event Dots */}
                    {hasEvents && (
                      <div className="mt-1 flex flex-wrap justify-center gap-1">
                        {cellEvents.slice(0, 3).map((ev) => {
                          const colorCfg = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS["Client Milestone"];
                          return (
                            <span
                              key={ev.id}
                              className={`size-1.5 rounded-full ${colorCfg.dot}`}
                              title={`${ev.time || ""}: ${ev.title}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] font-mono text-muted-foreground border-t border-border/40">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" />
                <span>Client Milestone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-400" />
                <span>Sprint Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-purple-400" />
                <span>Audit & Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>Maintenance</span>
              </div>
            </div>
          </div>

          {/* Selected Day Agenda & Upcoming Milestones (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-xl border border-border/80 bg-background/50 p-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary font-semibold">
                    <Clock className="size-3" />
                    <span>Selected Date Agenda</span>
                  </div>
                  <h3 className="font-mono text-sm font-bold text-foreground">
                    {selectedDateFormatted}
                  </h3>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingEvent(!isAddingEvent)}
                  className="h-7 px-2 font-mono text-[10px] gap-1"
                >
                  <Plus className="size-3" />
                  <span>Add Event</span>
                </Button>
              </div>

              {/* Quick Add Form */}
              {isAddingEvent && (
                <form
                  onSubmit={handleAddEvent}
                  className="my-3 space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs"
                >
                  <Input
                    placeholder="Event title (e.g., Client Milestone Check)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                    required
                    className="h-8 text-xs bg-background"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Time (e.g. 10:00 AM)"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                    <Input
                      placeholder="Client / System (opt)"
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as CalendarEvent["category"])}
                      className="h-8 rounded-md border border-border bg-background px-2 font-mono text-[11px] text-foreground"
                    >
                      <option value="Client Milestone">Client Milestone</option>
                      <option value="Sprint Deadline">Sprint Deadline</option>
                      <option value="Audit & Review">Audit & Review</option>
                      <option value="Maintenance Window">Maintenance Window</option>
                    </select>

                    <Button type="submit" size="sm" className="h-8 font-mono text-xs">
                      Save
                    </Button>
                  </div>
                </form>
              )}

              {/* Day Agenda List */}
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                {selectedDateEvents.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/70 p-4 text-center">
                    <p className="font-mono text-xs text-muted-foreground">
                      No events scheduled for this day.
                    </p>
                  </div>
                ) : (
                  selectedDateEvents.map((ev) => {
                    const colorCfg = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS["Client Milestone"];
                    const isCompleted = ev.status === "completed";

                    return (
                      <div
                        key={ev.id}
                        className={`group relative flex items-start justify-between gap-2.5 rounded-lg border p-2.5 transition ${
                          isCompleted
                            ? "border-border/40 bg-background/20 opacity-60"
                            : "border-border/80 bg-background/80 hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleEventCompleted(ev.id)}
                            className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition"
                            title={isCompleted ? "Mark upcoming" : "Mark completed"}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="size-4 text-emerald-400" />
                            ) : (
                              <span className={`block size-3 rounded-full mt-0.5 ${colorCfg.dot}`} />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                              {ev.time && <span>{ev.time}</span>}
                              {ev.clientName && (
                                <span className="flex items-center gap-0.5 text-primary">
                                  • {ev.clientName}
                                </span>
                              )}
                            </div>

                            <p
                              className={`text-xs font-semibold leading-snug mt-0.5 ${
                                isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {ev.title}
                            </p>

                            {ev.notes && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                {ev.notes}
                              </p>
                            )}

                            <div className="mt-1.5 flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className={`text-[8px] px-1 py-0 font-mono ${colorCfg.badge}`}
                              >
                                {ev.category}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="size-6 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                          aria-label="Delete event"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Upcoming Next Milestones Strip */}
            <div className="pt-3 border-t border-border/60">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1">
                  <Flag className="size-3 text-primary" /> Next Critical Milestones
                </span>
                <span>{upcomingMilestones.length} Queue</span>
              </div>

              <div className="space-y-1.5">
                {upcomingMilestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedDateStr(m.date)}
                    className="flex items-center justify-between rounded border border-border/60 bg-background/40 px-2 py-1 font-mono text-[10px] cursor-pointer hover:border-primary/40 hover:bg-background/80 transition"
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <span className={`size-1.5 rounded-full shrink-0 ${CATEGORY_COLORS[m.category]?.dot || "bg-primary"}`} />
                      <span className="truncate text-foreground font-medium">{m.title}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-[9px]">{m.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
