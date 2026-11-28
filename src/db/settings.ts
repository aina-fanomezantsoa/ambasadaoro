import { eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { settings } from "./schema.ts";

type Database = PgDatabase<PgQueryResultHKT, Record<string, unknown>>;

export const HOME_TITLE = "Acheter un compte Clash of Clans";

/** F19: title and bio of the home page; the default title while the admin has not chosen one. */
export async function homeText(database: Database) {
  const rows = await database.select().from(settings);
  const values = new Map(rows.map((row) => [row.key, row.value]));
  return { title: values.get("home_title") || HOME_TITLE, bio: values.get("home_bio") ?? "" };
}

export async function saveHomeText(database: Database, text: { title: string; bio: string }) {
  for (const [key, value] of [
    ["home_title", text.title],
    ["home_bio", text.bio],
  ]) {
    await database
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
}

/** F18: Cloudinary id of the home background, null while the admin has not chosen one. */
export const HERO_IMAGE = "hero_image";

export async function heroImage(database: Database) {
  const [row] = await database.select().from(settings).where(eq(settings.key, HERO_IMAGE));
  return row?.value ?? null;
}
