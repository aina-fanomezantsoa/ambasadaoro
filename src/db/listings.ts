import { and, asc, desc, eq, gt, inArray, or, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { isPublic } from "../lib/catalogue.ts";
import { listingPhotos, listings, orders } from "./schema.ts";

type Database = PgDatabase<PgQueryResultHKT, Record<string, unknown>>;

/** BR-01, BR-15: an expired order no longer reserves anything. */
const activeOrder = (now: Date) =>
  or(
    eq(orders.status, "to_verify"),
    and(eq(orders.status, "awaiting_payment"), gt(orders.expiresAt, now)),
  );

const onSale = inArray(listings.status, ["published", "sold"]);

/** What the catalogue shows, with the cover photo and the reserved flag. */
export async function publicListings(database: Database, now: Date) {
  const rows = await database
    .select()
    .from(listings)
    .where(onSale)
    .orderBy(desc(listings.createdAt));
  const covers = await database
    .selectDistinctOn([listingPhotos.listingId])
    .from(listingPhotos)
    .orderBy(listingPhotos.listingId, listingPhotos.position);
  const taken = await database
    .select({ id: orders.listingId })
    .from(orders)
    .where(activeOrder(now));

  const cover = new Map(covers.map((p) => [p.listingId, p.publicId]));
  const reserved = new Set(taken.map((o) => o.id));
  return rows
    .filter((l) => isPublic(l, now))
    .map((l) => ({
      ...l,
      cover: cover.get(l.id) ?? null,
      reserved: l.status === "published" && reserved.has(l.id),
    }));
}

export const photosOf = (database: Database, listingId: string) =>
  database
    .select()
    .from(listingPhotos)
    .where(eq(listingPhotos.listingId, listingId))
    .orderBy(asc(listingPhotos.position));

export async function isReserved(database: Database, listingId: string, now: Date) {
  const rows = await database
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.listingId, listingId), activeOrder(now)))
    .limit(1);
  return rows.length > 0;
}

/** One listing as the public sees it, or null (BR-40, BR-06). */
export async function publicListing(database: Database, id: string, now: Date) {
  const [listing] = await database.select().from(listings).where(eq(listings.id, id));
  if (!listing || !isPublic(listing, now)) return null;
  return {
    ...listing,
    photos: await photosOf(database, id),
    reserved: listing.status === "published" && (await isReserved(database, id, now)),
  };
}

/** BR-42 */
export const countView = (database: Database, id: string) =>
  database
    .update(listings)
    .set({ views: sql`${listings.views} + 1` })
    .where(and(eq(listings.id, id), onSale));
