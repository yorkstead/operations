import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { env } from "./env";
import { createPostgresPool } from "./infrastructure/database/postgres";

function resolveRpId(urlStr: string) {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return "ops.yorkstead.com";
  }
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: Array.from(
    new Set([
      "https://ops.yorkstead.com",
      "https://ops-staging.yorkstead.com",
      "https://yorkstead.com",
      "http://localhost:3000",
      "http://localhost:3001",
      env.BETTER_AUTH_URL,
      env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean))
  ),
  database: createPostgresPool(),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  rateLimit: {
    enabled: true,
  },
  plugins: [
    passkey({
      rpID: resolveRpId(env.BETTER_AUTH_URL),
      rpName: "Yorkstead Operations",
      origin: env.BETTER_AUTH_URL,
    }),
  ],
});
