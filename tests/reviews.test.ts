import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, describe, expect, it } from "vitest";
import * as r from "../src/db/reviews";
import * as s from "../src/db/schema";

const db = drizzle(new PGlite());
const ids: string[] = [];

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
  const [listing] = await db
    .insert(s.listings)
    .values({ title: "A", priceAr: 5000, townHall: 12 })
    .returning();
  for (const [i, status] of (["delivered", "delivered", "paid"] as const).entries()) {
    const [order] = await db
      .insert(s.orders)
      .values({
        code: `C${i}`,
        listingId: listing.id,
        buyerName: "A",
        buyerPhone: `034000000${i}`,
        priceAr: 5000,
        acceptedRulesAt: new Date(),
        status,
      })
      .returning();
    ids.push(order.id);
  }
}, 60_000);

describe("reviews", () => {
  it("BR-34: one review per delivered order, hidden ones left out of the average", async () => {
    expect((await r.publicReviews(db)).count).toBe(0);
    await expect(r.createReview(db, ids[2], 5, "")).rejects.toThrow("livrée");
    await r.createReview(db, ids[0], 5, "Parfait");
    await expect(r.createReview(db, ids[0], 1, "")).rejects.toThrow("déjà");
    await r.createReview(db, ids[1], 2, "");
    await expect(r.createReview(db, ids[1], 9, "")).rejects.toThrow();

    expect(await r.publicReviews(db)).toMatchObject({ count: 2, average: 3.5 });
    const bad = (await r.adminReviews(db)).find((row) => row.review.rating === 2)!;
    await r.setReviewHidden(db, bad.review.id, true);
    const visible = await r.publicReviews(db);
    expect(visible).toMatchObject({ count: 1, average: 5 });
    expect(visible.latest.map((x) => x.comment)).toEqual(["Parfait"]);
    expect(Object.keys(visible.latest[0])).not.toContain("orderId");
  });
});
