'use client';

import * as React from "react";
import Link from "next/link";
import { Fingerprint, KeyRound, LoaderCircle, LogOut, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Passkey = { id: string; name?: string | null };

export function PasskeySetup({ nextPath }: { nextPath: string }) {
  const [passkeys, setPasskeys] = React.useState<Passkey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const loadPasskeys = React.useCallback(async () => {
    const result = await authClient.passkey.listUserPasskeys();
    if (result.error) {
      setMessage(result.error.message || "Unable to load passkeys.");
    } else {
      setPasskeys((result.data ?? []) as Passkey[]);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => { void loadPasskeys(); }, [loadPasskeys]);

  async function createPasskey() {
    setCreating(true);
    setMessage(null);
    try {
      const result = await authClient.passkey.addPasskey({
        name: passkeys.length ? "Backup passkey" : "Primary passkey",
      });
      if (result.error) {
        setMessage(result.error.message || "Passkey enrollment failed.");
      } else {
        setMessage("Passkey created. You can now sign in with Windows Hello.");
        await loadPasskeys();
      }
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : "";
      setMessage(detail || "Passkey enrollment was cancelled or could not be completed.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-2xl items-center px-4 py-12">
      <Card className="w-full border-border bg-card/90">
        <CardHeader className="border-b border-border">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle>Secure your owner account</CardTitle>
          <CardDescription>
            Create a passkey with Windows Hello. Your password remains available as a recovery method.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Fingerprint className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {loading ? "Checking passkeys…" : passkeys.length ? `${passkeys.length} passkey${passkeys.length === 1 ? "" : "s"} enrolled` : "No passkey enrolled"}
                </div>
                <div className="text-xs text-muted-foreground">Protected by this device, phone, or password manager.</div>
              </div>
            </div>
          </div>

          {message && <div className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">{message}</div>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => void createPasskey()} disabled={loading || creating} className="gap-2">
              {creating ? <LoaderCircle className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              {passkeys.length ? "Add another passkey" : "Create passkey with Windows Hello"}
            </Button>
            <Button variant="outline" asChild>
              <Link href={nextPath}>{passkeys.length ? "Continue to Operations" : "Skip for now"}</Link>
            </Button>
            <Button variant="ghost" className="sm:ml-auto" onClick={() => void authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } })}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
