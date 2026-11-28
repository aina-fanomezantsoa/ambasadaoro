import { describe, expect, it } from "vitest";
import {
  catalogueHref,
  PAGE_SIZE,
  searchCatalogue,
  type CatalogueListing,
} from "../src/lib/catalogue";

const now = new Date("2026-11-27T12:00:00Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000);

const listing = (title: string, over: Partial<CatalogueListing> = {}): CatalogueListing => ({
  title,
  priceAr: 100_000,
  townHall: 12,
  builderHall: 5,
  trophies: 2000,
  heroes: { barbarianKing: 50 },
  featured: false,
  status: "published",
  soldAt: null,
  views: 0,
  createdAt: daysAgo(1),
  ...over,
});

const titles = (listings: CatalogueListing[], params = {}) =>
  searchCatalogue(listings, params, now).items.map((l) => l.title);

describe("catalogue", () => {
  it("BR-40, BR-06: hides drafts, withdrawn and accounts sold over 7 days ago", () => {
    const all = [
      listing("ok"),
      listing("draft", { status: "draft" }),
      listing("withdrawn", { status: "withdrawn" }),
      listing("recent", { status: "sold", soldAt: daysAgo(6) }),
      listing("old", { status: "sold", soldAt: daysAgo(8) }),
    ];
    expect(titles(all)).toEqual(["ok", "recent"]);
    expect(searchCatalogue(all, {}, now).available).toBe(1);
  });

  it("BR-41: filters combine and nonsense values are ignored", () => {
    const all = [
      listing("a", { townHall: 13, priceAr: 50_000, heroes: { barbarianKing: 70 } }),
      listing("b", { townHall: 13, priceAr: 90_000 }),
      listing("c", { townHall: 12, priceAr: 50_000 }),
    ];
    expect(titles(all, { hdv: "13", barbarianKing: "60" })).toEqual(["a"]);
    expect(titles(all, { archerQueen: "10" })).toEqual([]);
    expect(titles(all, { hdv: "abc", barbarianKing: "x", tri: "__proto__" })).toHaveLength(3);
  });

  it("BR-41: available first by default, explicit sorts win", () => {
    const all = [
      listing("sold", { status: "sold", soldAt: daysAgo(1), priceAr: 10_000 }),
      listing("plain", { priceAr: 30_000 }),
      listing("featured", { featured: true, priceAr: 20_000 }),
    ];
    expect(titles(all)).toEqual(["featured", "plain", "sold"]);
    expect(titles(all, { tri: "price_asc" })).toEqual(["sold", "featured", "plain"]);
  });

  it("BR-41, F01: featured first, reserved after available and not counted", () => {
    const all = [
      listing("reserved", { reserved: true, featured: true }),
      listing("plain"),
      listing("sold", { status: "sold", soldAt: daysAgo(1) }),
    ];
    expect(titles(all)).toEqual(["plain", "reserved", "sold"]);
    expect(searchCatalogue(all, {}, now).available).toBe(1);
  });

  it("paginates and keeps filters in links", () => {
    const all = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => listing(`n${i}`));
    expect(searchCatalogue(all, { page: "2" }, now).items).toHaveLength(1);
    expect(searchCatalogue(all, { page: "99" }, now).page).toBe(2);
    expect(catalogueHref({ q: "x", page: "2" }, { hdv: "13" })).toBe("/?q=x&hdv=13");
    expect(catalogueHref({ hdv: "13" }, { hdv: "" })).toBe("/");
  });
});
