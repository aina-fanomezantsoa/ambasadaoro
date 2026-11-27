"use server";

import { z } from "zod";
import { db } from "@/db";
import { countView } from "@/db/listings";
import { action } from "@/lib/action";

// shortcut: popularity trusts the browser's once-a-day rule; add a server limit if it gets gamed.
const count = action(z.object({ id: z.uuid() }), async ({ id }) => {
  await countView(db(), id);
  return null;
});

export async function addView(input: unknown) {
  return count(input);
}
