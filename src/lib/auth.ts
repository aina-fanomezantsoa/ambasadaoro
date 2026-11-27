import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { env } from "./env";
import { createSession, isValidSession, SESSION_SECONDS } from "./rules";

const COOKIE = "admin_session";

// The password hash is part of the key, so changing the password ends every session.
function sessionKey() {
  const secret = env("SESSION_SECRET");
  if (secret.length < 32) throw new Error("SESSION_SECRET : 32 caractères au moins");
  return secret + env("ADMIN_PASSWORD_HASH");
}

export async function startSession() {
  (await cookies()).set(COOKIE, createSession(sessionKey()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Call first in every admin page and action. */
export async function requireAdmin() {
  await connection(); // the session expiry needs the time of the request
  const cookie = (await cookies()).get(COOKIE)?.value;
  if (!isValidSession(cookie, sessionKey())) redirect("/admin/connexion");
}
