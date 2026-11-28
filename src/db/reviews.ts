import { avg, count, desc, eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { UserError } from "../lib/action.ts";
import { listings, orders, reviews } from "./schema.ts";

type Database = PgDatabase<PgQueryResultHKT, Record<string, unknown>>;

/** BR-34: one review per delivered order. The caller proves the order is the buyer's. */
export async function createReview(
  database: Database,
  orderId: string,
  rating: number,
  comment: string,
) {
  // "delivered" is final (BR-21), so reading before inserting cannot race.
  const [order] = await database
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId));
  if (order?.status !== "delivered") {
    throw new UserError("Un avis porte sur une commande livrée.");
  }
  const added = await database
    .insert(reviews)
    .values({ orderId, rating, comment })
    .onConflictDoNothing()
    .returning({ id: reviews.id });
  if (!added.length) throw new UserError("Vous avez déjà donné votre avis.");
}

/** F11: what the public sees; hidden reviews count for nothing. No buyer name or phone. */
export async function publicReviews(database: Database) {
  const visible = eq(reviews.hidden, false);
  const [summary] = await database
    .select({ count: count(), average: avg(reviews.rating).mapWith(Number) })
    .from(reviews)
    .where(visible);
  const latest = await database
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(visible)
    .orderBy(desc(reviews.createdAt))
    .limit(6);
  return { ...summary, latest };
}

export const adminReviews = (database: Database) =>
  // shortcut: every review on one page; paginate past a few hundred.
  database
    .select({ review: reviews, title: listings.title, code: orders.code })
    .from(reviews)
    .innerJoin(orders, eq(orders.id, reviews.orderId))
    .innerJoin(listings, eq(listings.id, orders.listingId))
    .orderBy(desc(reviews.createdAt));

/** The admin hides or shows a review, and never edits it (BR-34). */
export async function setReviewHidden(database: Database, id: string, hidden: boolean) {
  const done = await database
    .update(reviews)
    .set({ hidden })
    .where(eq(reviews.id, id))
    .returning({ id: reviews.id });
  if (!done.length) throw new UserError("Avis introuvable.");
}
