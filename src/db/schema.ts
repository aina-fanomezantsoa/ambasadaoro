import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid().primaryKey().defaultRandom();
const at = (name: string) => timestamp(name, { withTimezone: true });
const createdAt = () => at("created_at").notNull().defaultNow();

export const listingStatus = pgEnum("listing_status", ["draft", "published", "sold", "withdrawn"]);
export const orderStatus = pgEnum("order_status", [
  "awaiting_payment",
  "to_verify",
  "paid",
  "delivered",
  "cancelled",
  "expired",
]);
export const operator = pgEnum("operator", ["mvola", "orange"]);
export const paymentStatus = pgEnum("payment_status", ["pending", "accepted", "rejected"]);
export const disputeStatus = pgEnum("dispute_status", [
  "open",
  "refunded",
  "exchanged",
  "rejected",
]);

export const listings = pgTable(
  "listings",
  {
    id: id(),
    title: text().notNull(),
    description: text().notNull().default(""),
    priceAr: integer("price_ar").notNull(),
    townHall: integer("town_hall").notNull(),
    builderHall: integer("builder_hall"),
    trophies: integer(),
    league: text(),
    gems: integer(),
    xpLevel: integer("xp_level"),
    heroes: jsonb().$type<Record<string, number>>().notNull().default({}),
    skins: text(),
    decorations: text(),
    featured: boolean().notNull().default(false),
    status: listingStatus().notNull().default("draft"),
    soldAt: at("sold_at"),
    views: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    index().on(t.status),
    index().on(t.priceAr),
    index().on(t.townHall),
    check("price_range", sql`${t.priceAr} between 1000 and 100000000`), // BR-03
  ],
);

export const listingPhotos = pgTable(
  "listing_photos",
  {
    id: id(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    position: integer().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.listingId)],
);

const active = sql`status in ('awaiting_payment', 'to_verify')`;

export const orders = pgTable(
  "orders",
  {
    id: id(),
    code: text().notNull().unique(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "restrict" }), // BR-07
    buyerName: text("buyer_name").notNull(),
    buyerPhone: text("buyer_phone").notNull(),
    priceAr: integer("price_ar").notNull(), // BR-14
    status: orderStatus().notNull().default("awaiting_payment"),
    expiresAt: at("expires_at"),
    rejections: integer().notNull().default(0),
    acceptedRulesAt: at("accepted_rules_at").notNull(),
    paidAt: at("paid_at"),
    deliveredAt: at("delivered_at"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("one_active_order_per_listing").on(t.listingId).where(active), // BR-11
    uniqueIndex("one_active_order_per_phone").on(t.buyerPhone).where(active), // BR-12
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    operator: operator().notNull(),
    txId: text("tx_id").notNull(),
    status: paymentStatus().notNull().default("pending"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("tx_used_once").on(t.operator, t.txId)],
); // BR-17

export const disputes = pgTable("disputes", {
  id: id(),
  orderId: uuid("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "restrict" }),
  reason: text().notNull(),
  status: disputeStatus().notNull().default("open"),
  note: text(),
  closedAt: at("closed_at"),
  createdAt: createdAt(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: "restrict" }), // BR-34
    rating: integer().notNull(),
    comment: text().notNull().default(""),
    hidden: boolean().notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    check("rating_range", sql`${t.rating} between 1 and 5`),
    check("comment_length", sql`char_length(${t.comment}) <= 500`),
  ],
);

export const rateLimits = pgTable("rate_limits", {
  key: text().primaryKey(),
  windowStart: at("window_start").notNull(),
  count: integer().notNull().default(0),
});

/** Site settings edited in the admin, e.g. the home background image. */
export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: text().notNull(),
});
