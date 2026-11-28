import { HEROES } from "./rules";

export type Params = Record<string, string | string[] | undefined>;

export type CatalogueListing = {
  title: string;
  priceAr: number;
  townHall: number;
  builderHall: number | null;
  trophies: number | null;
  heroes: Record<string, number>;
  featured: boolean;
  status: "draft" | "published" | "sold" | "withdrawn";
  reserved?: boolean; // BR-01: deduced from an active order
  soldAt: Date | null;
  views: number;
  createdAt: Date;
};

export const SORTS = {
  recommended: "Recommandés",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
  popular: "Popularité",
  town_hall: "HDV le plus élevé",
} as const;

export const PAGE_SIZE = 12;
const SOLD_VISIBLE_MS = 7 * 86_400_000;

export const param = (params: Params, key: string) => {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
};

/** A positive whole number from the URL, or null when absent or nonsense. */
const num = (params: Params, key: string) => {
  const value = Number(param(params, key));
  return Number.isInteger(value) && value > 0 ? value : null;
};

/** BR-06, BR-40 */
export const isPublic = (l: CatalogueListing, now: Date) =>
  l.status === "published" ||
  (l.status === "sold" && !!l.soldAt && now.getTime() - l.soldAt.getTime() < SOLD_VISIBLE_MS);

/**
 * BR-41: filters combine; the default sort puts available accounts first.
 * shortcut: filters in memory, fine for the 20 to 200 accounts on sale (decision 4); SQL beyond.
 */
export function searchCatalogue<L extends CatalogueListing>(
  listings: L[],
  params: Params,
  now: Date,
) {
  const q = param(params, "q").toLowerCase();
  const townHall = num(params, "hdv");

  const found = listings.filter(
    (l) =>
      isPublic(l, now) &&
      (!q || l.title.toLowerCase().includes(q)) &&
      (!townHall || l.townHall === townHall) &&
      Object.keys(HEROES).every((hero) => (l.heroes[hero] ?? 0) >= (num(params, hero) ?? 0)),
  );

  const sort = param(params, "tri");
  const rank = (l: L) => (l.status === "sold" ? 0 : l.reserved ? 2 : 4) + (l.featured ? 1 : 0);
  const compare: Record<string, (a: L, b: L) => number> = {
    price_asc: (a, b) => a.priceAr - b.priceAr,
    price_desc: (a, b) => b.priceAr - a.priceAr,
    popular: (a, b) => b.views - a.views,
    town_hall: (a, b) => b.townHall - a.townHall,
  };
  found.sort(
    Object.hasOwn(compare, sort)
      ? compare[sort]
      : (a, b) => rank(b) - rank(a) || b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const page = Math.min(num(params, "page") ?? 1, pages);
  return {
    items: found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    available: found.filter((l) => l.status === "published" && !l.reserved).length,
    total: found.length,
    page,
    pages,
  };
}

/** The current URL with some parameters changed; changing anything else returns to page 1. */
export function catalogueHref(params: Params, changes: Record<string, string>) {
  const next = new URLSearchParams();
  for (const key of Object.keys(params)) {
    const value = param(params, key);
    if (value && key !== "page") next.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  const query = next.toString();
  return query ? `/?${query}` : "/";
}
