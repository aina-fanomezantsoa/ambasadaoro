import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, describe, expect, it } from "vitest";
import { countView, publicListing, publicListings } from "../src/db/listings";
import * as s from "../src/db/schema";
import { listingForm } from "../src/lib/listing-form";
import { cloudinarySignature, publishErrors } from "../src/lib/rules";

const db = drizzle(new PGlite());
const now = new Date();
const later = new Date(now.getTime() + 3_600_000);
const earlier = new Date(now.getTime() - 60_000);
const ids: Record<string, string> = {};

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
  for (const [title, status] of [
    ["free", "published"],
    ["held", "published"],
    ["expired", "published"],
    ["draft", "draft"],
  ] as const) {
    const [row] = await db
      .insert(s.listings)
      .values({ title, status, priceAr: 5000, townHall: 12 })
      .returning();
    ids[title] = row.id;
  }
  await db.insert(s.listingPhotos).values([
    { listingId: ids.free, publicId: "second", position: 1 },
    { listingId: ids.free, publicId: "first", position: 0 },
  ]);
  const order = { buyerName: "A", priceAr: 5000, acceptedRulesAt: now };
  await db.insert(s.orders).values([
    { ...order, code: "A", listingId: ids.held, buyerPhone: "0340000001", expiresAt: later },
    { ...order, code: "B", listingId: ids.expired, buyerPhone: "0340000002", expiresAt: earlier },
  ]);
}, 60_000);

describe("listings", () => {
  it("BR-40, BR-01, BR-15: hides drafts; only a live order reserves", async () => {
    const found = await publicListings(db, now);
    const reserved = Object.fromEntries(found.map((l) => [l.title, l.reserved]));
    expect(reserved).toEqual({ free: false, held: true, expired: false });
    expect(found.find((l) => l.title === "free")?.cover).toBe("first");
    expect(await publicListing(db, ids.draft, now)).toBeNull();
    expect((await publicListing(db, ids.free, now))?.photos).toHaveLength(2);
  });

  it("BR-42: counts views of public listings only", async () => {
    await countView(db, ids.free);
    await countView(db, ids.draft);
    const rows = await db.select().from(s.listings);
    expect(rows.find((l) => l.id === ids.free)?.views).toBe(1);
    expect(rows.find((l) => l.id === ids.draft)?.views).toBe(0);
  });

  it("BR-02: publication needs title, price, town hall and a photo", () => {
    const complete = { title: "A", priceAr: 5000, townHall: 12 };
    expect(publishErrors(complete, 1)).toEqual([]);
    expect(publishErrors({ ...complete, title: " " }, 0)).toEqual(["un titre", "au moins 1 photo"]);
  });

  it("BR-03, BR-05: reads the admin form, empty meaning not given", () => {
    const empty = ["builderHall", "trophies", "league", "gems", "xpLevel", "skins", "decorations"];
    const form = {
      ...Object.fromEntries(empty.map((key) => [key, ""])),
      title: "A",
      description: "",
      priceAr: "5000",
      townHall: "12",
      barbarianKing: "40",
      archerQueen: "",
      grandWarden: "0",
      royalChampion: "",
      minionPrince: "",
    };
    const parsed = listingForm.parse(form);
    expect(parsed.heroes).toEqual({ barbarianKing: 40 });
    expect([parsed.gems, parsed.league, parsed.featured]).toEqual([null, null, false]);
    expect(listingForm.safeParse({ ...form, priceAr: "999" }).success).toBe(false);
  });

  it("signs Cloudinary parameters in key order", () => {
    const signature = cloudinarySignature({ b: 2, a: 1 }, "secret");
    expect(signature).toBe(cloudinarySignature({ a: 1, b: 2 }, "secret"));
    expect(signature).toMatch(/^[0-9a-f]{40}$/);
  });
});
