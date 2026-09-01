import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const operationsRoot = join(import.meta.dir, "..");

describe("owner passkey enrollment flow", () => {
  it("routes password sign-in through the protected passkey setup page", () => {
    const loginPage = readFileSync(join(operationsRoot, "app/login/page.tsx"), "utf8");
    const passkeyPage = readFileSync(join(operationsRoot, "app/account/passkeys/page.tsx"), "utf8");

    expect(loginPage).toContain('router.push(`/account/passkeys?next=${encodeURIComponent(nextPath)}`)');
    expect(loginPage).toContain("safePostLoginPath(requestedPath)");
    expect(passkeyPage).toContain("auth.api.getSession");
    expect(passkeyPage).toContain('redirect("/login?next=/account/passkeys")');
  });

  it("provides an explicit user-gesture action for WebAuthn enrollment", () => {
    const setup = readFileSync(join(operationsRoot, "components/auth/passkey-setup.tsx"), "utf8");

    expect(setup).toContain("authClient.passkey.addPasskey");
    expect(setup).toContain("Create passkey with Windows Hello");
  });
});
