'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, KeyRound, Lock, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { safePostLoginPath } from "@/lib/owner-routes";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const router = useRouter();
  const params = React.use(searchParams);
  const requestedPath = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = safePostLoginPath(requestedPath);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message || "Invalid credentials. Please verify your email and password.");
      } else {
        router.push(`/account/passkeys?next=${encodeURIComponent(nextPath)}`);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || "Authentication request failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.signIn.passkey();
      if (res?.error) {
        setError(res.error.message || "No passkey registered on this device for this account.");
      } else {
        router.push(nextPath);
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "";
      if (
        errorMsg.includes("excludeCredentials") ||
        errorMsg.includes("NotAllowedError") ||
        errorMsg.includes("cancel") ||
        errorMsg.includes("abort")
      ) {
        setError("Passkey sign-in was cancelled or no passkey is registered on this device yet. Please sign in with email and password.");
      } else {
        setError(errorMsg || "Passkey authentication was not completed. Please sign in with your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card/90 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-2 text-center pb-6 border-b border-border">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div className="flex items-center justify-between">
            <a
              href="https://yorkstead.com"
              className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition"
            >
              <span>← yorkstead.com</span>
            </a>
            <Badge variant="secondary" className="font-mono text-[9px] uppercase bg-primary/20 text-primary border-primary/30">
              OPERATIONS GATEWAY
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Yorkstead Operations
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Authenticate to access your organization&apos;s work orders, shopfloor travelers, and ledger.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Passkey Biometric Sign-in */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePasskeySignIn}
            disabled={loading}
            className="w-full h-11 border-primary/40 font-mono text-xs font-semibold text-primary hover:bg-primary/10 gap-2"
          >
            <KeyRound className="size-4" />
            <span>Sign In with Passkey / Windows Hello</span>
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="bg-card px-2 text-[10px] uppercase font-mono text-muted-foreground">
              Or email & password
            </span>
          </div>

          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-mono">
                Operator Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-mono">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-mono text-xs gap-2"
            >
              <Lock className="size-3.5" />
              <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </form>

          <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-[11px] text-muted-foreground text-center space-y-1">
            <div>
              <span>Evaluating as a prospect? </span>
              <a href="/demo" className="font-semibold text-primary hover:underline">
                Launch interactive demo sandbox
              </a>
            </div>
            <div>
              <a href="https://yorkstead.com" className="text-[10px] text-muted-foreground hover:underline">
                Explore platform capabilities on yorkstead.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
