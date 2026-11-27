import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { env } from "./env";
import { isAdminUser } from "./rules";

// No database: the session lives in a signed cookie, and only one person ever logs in.
const create = () =>
  betterAuth({
    secret: env("BETTER_AUTH_SECRET"),
    socialProviders: {
      google: { clientId: env("GOOGLE_CLIENT_ID"), clientSecret: env("GOOGLE_CLIENT_SECRET") },
    },
    plugins: [nextCookies()],
  });

let instance: ReturnType<typeof create> | undefined;
export const auth = () => (instance ??= create());

/** Call first in every admin page and action. */
export async function requireAdmin() {
  const session = await auth().api.getSession({ headers: await headers() });
  if (!isAdminUser(session?.user, env("ADMIN_EMAIL"))) throw new Error("Accès refusé");
  return session!.user;
}
