import { and, count, desc, eq, inArray, lte, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { UserError } from "../lib/action.ts";
import { canOpenDispute, HOLD_MS, isTxId, normalizeTxId, orderCode } from "../lib/rules.ts";
import { disputes, listings, orders, payments } from "./schema.ts";

type Database = PgDatabase<PgQueryResultHKT, Record<string, unknown>>;

/** The unique index a failed insert ran into, if any. */
const violated = (error: unknown) =>
  (error as { cause?: { constraint?: string } } | null)?.cause?.constraint;

/** BR-15: run before reading or writing orders, as the unique indexes ignore the clock. */
export const expireOverdue = (database: Database, now: Date) =>
  database
    .update(orders)
    .set({ status: "expired" })
    .where(and(eq(orders.status, "awaiting_payment"), lte(orders.expiresAt, now)));

/** F06. The caller validates the name, the phone and the acceptances (BR-13). */
export async function createOrder(
  database: Database,
  input: { listingId: string; name: string; phone: string },
  now: Date,
) {
  await expireOverdue(database, now);
  try {
    return await database.transaction(async (tx) => {
      // The lock keeps the listing from changing under the new order.
      const [listing] = await tx
        .select()
        .from(listings)
        .where(eq(listings.id, input.listingId))
        .for("update");
      if (listing?.status !== "published") {
        throw new UserError("Ce compte n'est plus disponible."); // BR-10
      }
      const code = orderCode();
      await tx.insert(orders).values({
        code,
        listingId: listing.id,
        buyerName: input.name,
        buyerPhone: input.phone,
        priceAr: listing.priceAr, // BR-14
        expiresAt: new Date(now.getTime() + HOLD_MS),
        acceptedRulesAt: now,
      });
      return code;
    });
  } catch (error) {
    // The indexes settle simultaneous orders: only one insert wins.
    if (violated(error) === "one_active_order_per_listing") {
      throw new UserError("Déjà réservé par un autre acheteur."); // BR-11
    }
    if (violated(error) === "one_active_order_per_phone") {
      throw new UserError("Vous avez déjà une commande en cours avec ce numéro."); // BR-12
    }
    throw error;
  }
}

/** BR-30: an order is only shown to someone who has both its code and its phone. */
export async function findOrder(database: Database, code: string, phone: string, now: Date) {
  await expireOverdue(database, now);
  const [row] = await database
    .select({ order: orders, title: listings.title, dispute: disputes.status })
    .from(orders)
    .innerJoin(listings, eq(listings.id, orders.listingId))
    .leftJoin(disputes, eq(disputes.orderId, orders.id))
    .where(and(eq(orders.code, code), eq(orders.buyerPhone, phone)));
  if (!row) return null;
  const { order } = row;
  return {
    id: order.id,
    code: order.code,
    title: row.title,
    priceAr: order.priceAr,
    status: order.status,
    expiresAt: order.expiresAt,
    rejections: order.rejections,
    dispute: row.dispute,
  };
}

async function lockOrder(tx: Database, id: string) {
  const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
  if (!order) throw new UserError("Commande introuvable.");
  return order;
}

/** F07; returns the transaction ID as stored. */
export async function submitPayment(
  database: Database,
  orderId: string,
  operator: "mvola" | "orange",
  rawTxId: string,
  now: Date,
) {
  const txId = normalizeTxId(rawTxId); // BR-17
  if (!isTxId(txId)) throw new UserError("ID de transaction invalide.");
  await expireOverdue(database, now);
  try {
    await database.transaction(async (tx) => {
      const order = await lockOrder(tx, orderId);
      if (order.status === "expired") throw new UserError("Cette commande a expiré.");
      if (order.status !== "awaiting_payment") {
        throw new UserError("Aucun paiement n'est attendu pour cette commande.");
      }
      await tx.insert(payments).values({ orderId, operator, txId });
      // BR-16: from now on it waits for the admin, however long that takes.
      await tx
        .update(orders)
        .set({ status: "to_verify", expiresAt: null })
        .where(eq(orders.id, orderId));
    });
  } catch (error) {
    if (violated(error) === "tx_used_once") throw new UserError("ID déjà utilisé.");
    throw error;
  }
  return txId;
}

async function pendingPayment(tx: Database, paymentId: string) {
  const find = () => tx.select().from(payments).where(eq(payments.id, paymentId));
  const [payment] = await find();
  if (!payment) throw new UserError("Paiement introuvable.");
  const order = await lockOrder(tx, payment.orderId);
  // Read again under the order lock: a double click must not decide twice.
  const [fresh] = await find();
  if (fresh.status !== "pending" || order.status !== "to_verify") {
    throw new UserError("Paiement déjà traité.");
  }
  return order;
}

export const acceptPayment = (database: Database, paymentId: string, now: Date) =>
  database.transaction(async (tx) => {
    const order = await pendingPayment(tx, paymentId);
    await tx.update(payments).set({ status: "accepted" }).where(eq(payments.id, paymentId));
    // BR-19
    await tx.update(orders).set({ status: "paid", paidAt: now }).where(eq(orders.id, order.id));
    await tx
      .update(listings)
      .set({ status: "sold", soldAt: now })
      .where(eq(listings.id, order.listingId));
  });

export const rejectPayment = (database: Database, paymentId: string, now: Date) =>
  database.transaction(async (tx) => {
    const order = await pendingPayment(tx, paymentId);
    await tx.update(payments).set({ status: "rejected" }).where(eq(payments.id, paymentId));
    const rejections = order.rejections + 1;
    // BR-18: one more hour the first time, cancelled the second.
    await tx
      .update(orders)
      .set(
        rejections < 2
          ? { rejections, status: "awaiting_payment", expiresAt: new Date(+now + HOLD_MS) }
          : { rejections, status: "cancelled" },
      )
      .where(eq(orders.id, order.id));
  });

/** BR-20 */
export async function markDelivered(database: Database, orderId: string, now: Date) {
  const done = await database
    .update(orders)
    .set({ status: "delivered", deliveredAt: now })
    .where(and(eq(orders.id, orderId), eq(orders.status, "paid")))
    .returning({ id: orders.id });
  if (!done.length) throw new UserError("Seule une commande payée peut être livrée.");
}

/** BR-21 */
export const cancelOrder = (database: Database, orderId: string) =>
  database.transaction(async (tx) => {
    const order = await lockOrder(tx, orderId);
    if (!["awaiting_payment", "to_verify", "paid"].includes(order.status)) {
      throw new UserError("Cette commande ne peut plus être annulée.");
    }
    await tx.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId));
    await tx
      .update(payments)
      .set({ status: "rejected" })
      .where(and(eq(payments.orderId, orderId), eq(payments.status, "pending")));
    // Only a paid order had taken the listing off sale.
    if (order.status === "paid") {
      await tx
        .update(listings)
        .set({ status: "published", soldAt: null })
        .where(eq(listings.id, order.listingId));
    }
  });

export const openDispute = (database: Database, orderId: string, reason: string, now: Date) =>
  database.transaction(async (tx) => {
    const order = await lockOrder(tx, orderId);
    if (order.status !== "delivered" || !order.deliveredAt) {
      throw new UserError("Un litige porte sur une commande livrée.");
    }
    if (!canOpenDispute(order.deliveredAt, now)) {
      throw new UserError("Le délai de 7 jours est dépassé."); // BR-32
    }
    const opened = await tx
      .insert(disputes)
      .values({ orderId, reason })
      .onConflictDoNothing()
      .returning({ id: disputes.id });
    if (!opened.length) throw new UserError("Un litige existe déjà pour cette commande.");
  });

export async function closeDispute(
  database: Database,
  orderId: string,
  status: "refunded" | "exchanged" | "rejected",
  note: string,
  now: Date,
) {
  const done = await database
    .update(disputes)
    .set({ status, note: note || null, closedAt: now })
    .where(and(eq(disputes.orderId, orderId), eq(disputes.status, "open")))
    .returning({ id: disputes.id });
  if (!done.length) throw new UserError("Aucun litige ouvert sur cette commande.");
}

/** F15: every order, the ones waiting for a decision first. */
export async function adminOrders(database: Database, now: Date) {
  await expireOverdue(database, now);
  // shortcut: every order on one page; paginate past a few hundred.
  const rows = await database
    .select({ order: orders, title: listings.title, dispute: disputes })
    .from(orders)
    .innerJoin(listings, eq(listings.id, orders.listingId))
    .leftJoin(disputes, eq(disputes.orderId, orders.id))
    .orderBy(sql`${orders.status} <> 'to_verify'`, desc(orders.createdAt));
  const ids = rows.map((r) => r.order.id);
  const paid = await database
    .select()
    .from(payments)
    .where(inArray(payments.orderId, ids))
    .orderBy(desc(payments.createdAt));
  return rows.map((r) => ({ ...r, payments: paid.filter((p) => p.orderId === r.order.id) }));
}

export async function countToVerify(database: Database) {
  const [row] = await database
    .select({ n: count() })
    .from(orders)
    .where(eq(orders.status, "to_verify"));
  return row.n;
}
