import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { env } from "./env";
import { createPostgresPool } from "./infrastructure/database/postgres";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: Array.from(new Set([env.BETTER_AUTH_URL, env.NEXT_PUBLIC_APP_URL])),
  database: createPostgresPool(),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  rateLimit: {
    enabled: true,
  },
  plugins: [
    passkey(),
  ],
});
