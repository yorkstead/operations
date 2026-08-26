import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <div className="space-y-4">
        <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          404 // NOT FOUND
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Resource Unavailable
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          The requested path or resource does not exist in this organization workspace.
        </p>
        <div className="pt-4">
          <Button asChild variant="default">
            <Link href="/">Return to Platform</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
