import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { Pool } from "pg";
import { env } from "./env";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: new Pool({ connectionString: env.DATABASE_URL }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    passkey(),
  ],
});
