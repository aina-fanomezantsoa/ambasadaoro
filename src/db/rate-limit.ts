import { eq, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { rateLimits } from "./schema.ts";

/** Counts one attempt, atomically; false once the key has used up its window. */
export async function allowAttempt(
  database: PgDatabase<PgQueryResultHKT, Record<string, unknown>>,
  key: string,
  max: number,
  windowMinutes: number,
) {
  const expired = sql`${rateLimits.windowStart} < now() - make_interval(mins => ${windowMinutes})`;
  const [row] = await database
    .insert(rateLimits)
    .values({ key, windowStart: sql`now()`, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${expired} then now() else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count });
  return row.count <= max;
}

/** Gives back an attempt that turned out legitimate, so only failures add up. */
export const forgiveAttempt = (
  database: PgDatabase<PgQueryResultHKT, Record<string, unknown>>,
  key: string,
) =>
  database
    .update(rateLimits)
    .set({ count: sql`greatest(${rateLimits.count} - 1, 0)` })
    .where(eq(rateLimits.key, key));
