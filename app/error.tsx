'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Platform boundary error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <div className="space-y-4">
        <span className="font-mono text-xs uppercase tracking-[0.24em] text-red-400">
          Operational Error
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred within the platform boundary."}
        </p>
        <div className="pt-4">
          <Button onClick={() => reset()} variant="secondary">
            Retry Operation
          </Button>
        </div>
      </div>
    </div>
  );
}
