"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { allowAttempt } from "@/db/rate-limit";
import { action, UserError } from "@/lib/action";
import { endSession, startSession } from "@/lib/auth";
import { clientIp } from "@/lib/client-ip";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/rules";

const signIn = action(
  z.object({ email: z.string().trim().max(200), password: z.string().min(1).max(200) }),
  async ({ email, password }) => {
    if (!(await allowAttempt(db(), `login:${await clientIp()}`, 5, 15))) {
      throw new UserError("Trop d'essais. Réessayez dans 15 minutes.");
    }
    const passwordOk = verifyPassword(password, env("ADMIN_PASSWORD_HASH"));
    if (!passwordOk || email.toLowerCase() !== env("ADMIN_EMAIL").toLowerCase()) {
      throw new UserError("E-mail ou mot de passe incorrect.");
    }
    await startSession();
    redirect("/admin");
  },
);

export async function login(_state: unknown, form: FormData) {
  const result = await signIn(Object.fromEntries(form));
  // The e-mail comes back so a failed try does not empty the field.
  return { ...result, email: String(form.get("email") ?? "") };
}

export async function logout() {
  await endSession();
  redirect("/admin/connexion");
}
