import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.ComponentProps<"span"> & { variant?: "outline" | "secondary" | "default" };

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide",
        variant === "default" && "border-primary/30 bg-primary/10 text-primary",
        variant === "secondary" && "border-border bg-secondary text-secondary-foreground",
        variant === "outline" && "border-border text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
