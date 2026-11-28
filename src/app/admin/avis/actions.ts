"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { setReviewHidden } from "@/db/reviews";
import { action } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";

const moderation = (hidden: boolean) =>
  action(z.object({ id: z.uuid() }), async ({ id }) => {
    await setReviewHidden(db(), id, hidden);
    refresh();
    return hidden ? "Avis masqué." : "Avis réaffiché.";
  });

const hide = moderation(true);
const show = moderation(false);

export async function hideReview(_state: unknown, form: FormData) {
  await requireAdmin();
  return hide(Object.fromEntries(form));
}

export async function showReview(_state: unknown, form: FormData) {
  await requireAdmin();
  return show(Object.fromEntries(form));
}
