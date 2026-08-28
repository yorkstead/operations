import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

// Omit baseURL so Better Auth strictly uses relative paths (/api/auth) in the browser,
// preventing any build-time environment variable from baking a staging URL into the client bundle.
export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
  ],
});
