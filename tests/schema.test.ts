import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, describe, expect, it } from "vitest";
import * as s from "../src/db/schema";

// Real Postgres in memory, built from the committed migrations.
const db = drizzle(new PGlite());
let listingId: string;
let otherId: string;

const order = (code: string, listing: string, phone: string) =>
  db
    .insert(s.orders)
    .values({
      code,
      listingId: listing,
      buyerName: "A",
      buyerPhone: phone,
      priceAr: 5000,
      acceptedRulesAt: new Date(),
    })
    .returning();

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
  const rows = await db
    .insert(s.listings)
    .values([
      { title: "A", priceAr: 5000, townHall: 12 },
      { title: "B", priceAr: 5000, townHall: 13 },
    ])
    .returning();
  [listingId, otherId] = rows.map((r) => r.id);
}, 60_000);

describe("database constraints", () => {
  it("BR-03: refuses an out-of-range price", async () => {
    await expect(
      db.insert(s.listings).values({ title: "C", priceAr: 10, townHall: 1 }),
    ).rejects.toThrow();
  });

  it("BR-11, BR-12, BR-17, BR-07", async () => {
    const [first] = await order("C1", listingId, "0340000001");
    await expect(order("C2", listingId, "0340000002")).rejects.toThrow(); // BR-11
    await expect(order("C3", otherId, "0340000001")).rejects.toThrow(); // BR-12

    const pay = { orderId: first.id, operator: "mvola" as const, txId: "TX1" };
    await db.insert(s.payments).values(pay);
    await expect(db.insert(s.payments).values(pay)).rejects.toThrow(); // BR-17
    await expect(db.delete(s.listings).where(eq(s.listings.id, listingId))).rejects.toThrow(); // BR-07

    // A finished order frees both the listing and the phone number.
    await db.update(s.orders).set({ status: "expired" }).where(eq(s.orders.id, first.id));
    await expect(order("C4", listingId, "0340000001")).resolves.toHaveLength(1);
  });
});
