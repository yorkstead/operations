import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { env } from "./env";
import { createPostgresPool } from "./infrastructure/database/postgres";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: createPostgresPool(),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    passkey(),
  ],
});
