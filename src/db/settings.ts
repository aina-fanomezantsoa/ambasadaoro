import { eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { settings } from "./schema.ts";

type Database = PgDatabase<PgQueryResultHKT, Record<string, unknown>>;

/** F18: Cloudinary id of the home background, null while the admin has not chosen one. */
export const HERO_IMAGE = "hero_image";

export async function heroImage(database: Database) {
  const [row] = await database.select().from(settings).where(eq(settings.key, HERO_IMAGE));
  return row?.value ?? null;
}
