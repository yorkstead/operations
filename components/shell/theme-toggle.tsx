'use client';

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Check } from "lucide-react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="size-8 rounded-lg border border-border bg-card/50" aria-hidden="true" />
    );
  }

  const currentIcon = () => {
    if (theme === "light") return <Sun className="size-4 text-amber-500" />;
    if (theme === "dark") return <Moon className="size-4 text-primary" />;
    return <Laptop className="size-4 text-muted-foreground" />;
  };

  const themeOptions = [
    { value: "system", label: "System", icon: Laptop, hint: "Follow OS setting" },
    { value: "dark", label: "Dark", icon: Moon, hint: "High-contrast slate" },
    { value: "light", label: "Light", icon: Sun, hint: "High-visibility canvas" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Switch Theme (System, Dark, Light)"
        aria-expanded={open}
        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card/80 text-muted-foreground transition hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        {currentIcon()}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-2xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-1">
          <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground border-b border-border/80 mb-1">
            Display Theme
          </div>

          <div className="space-y-0.5">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;

              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-mono transition ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`size-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="size-3 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
