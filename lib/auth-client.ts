import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_APP_URL || "https://ops.yorkstead.com")
    : window.location.origin,
  plugins: [
    passkeyClient(),
  ],
});
