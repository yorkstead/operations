import { brand } from "@/lib/brand";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Cpu, Terminal, Layers } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2">
          <Badge variant="default">{brand.systemName}</Badge>
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Platform Foundation
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
          Industrial Operational Architecture
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
          {brand.descriptor}. Built with modular domain boundaries, strict multi-tenant isolation, and high-density operator UX.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" />
              <CardTitle className="text-base">Tenant Isolation</CardTitle>
            </div>
            <CardDescription>Server-side organization context on all mutations and queries.</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status: Enforced</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Layers className="size-5" />
              <CardTitle className="text-base">Modular Monolith</CardTitle>
            </div>
            <CardDescription>Bounded domain modules with explicit transactional service boundaries.</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status: Isolated</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Cpu className="size-5" />
              <CardTitle className="text-base">Demo Safety</CardTitle>
            </div>
            <CardDescription>Deterministic synthetic scenarios with intercepted external side effects.</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status: Sandboxed</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Terminal className="size-5" />
              <CardTitle className="text-base">Verification Suite</CardTitle>
            </div>
            <CardDescription>Automated typecheck, lint, unit tests, and migration checks.</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status: 100% Passing</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
