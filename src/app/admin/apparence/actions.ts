"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { saveHomeText } from "@/db/settings";
import { action } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";

const save = action(
  z.object({ title: z.string().trim().max(120), bio: z.string().trim().max(1000) }),
  async (text) => {
    await saveHomeText(db(), text);
    refresh();
    return "Enregistré.";
  },
);

export async function saveHome(_state: unknown, form: FormData) {
  await requireAdmin();
  // A textarea sends CRLF, which would count each line break twice against the limit.
  const bio = String(form.get("bio") ?? "").replace(/\r\n/g, "\n");
  return save({ title: form.get("title"), bio });
}
