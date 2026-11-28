import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, describe, expect, it } from "vitest";
import * as o from "../src/db/orders";
import { allowAttempt, forgiveAttempt } from "../src/db/rate-limit";
import * as s from "../src/db/schema";
import { canOpenDispute, isTxId } from "../src/lib/rules";

const db = drizzle(new PGlite());
const now = new Date("2026-12-01T10:00:00Z");
const after = (minutes: number) => new Date(now.getTime() + minutes * 60_000);
const DAY = 24 * 60;

let phones = 0;
const phone = () => `034000${String(++phones).padStart(4, "0")}`;

async function listing(status: "draft" | "published" = "published") {
  const [row] = await db
    .insert(s.listings)
    .values({ title: "A", priceAr: 5000, townHall: 12, status })
    .returning();
  return row.id;
}
const listingRow = async (id: string) =>
  (await db.select().from(s.listings).where(eq(s.listings.id, id)))[0];

async function order(listingId: string, number = phone(), at = now) {
  const code = await o.createOrder(db, { listingId, name: "Rabe", phone: number }, at);
  return (await o.findOrder(db, code, number, at))!;
}
const status = async (code: string) =>
  (await db.select().from(s.orders).where(eq(s.orders.code, code)))[0].status;
const pendingId = async (orderId: string) =>
  (await db.select().from(s.payments).where(eq(s.payments.orderId, orderId))).find(
    (p) => p.status === "pending",
  )!.id;

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
}, 60_000);

describe("orders", () => {
  it("BR-10, BR-11: of two simultaneous orders, one passes", async () => {
    const id = await listing();
    const results = await Promise.allSettled([order(id), order(id)]);
    expect(results.map((r) => r.status).sort()).toEqual(["fulfilled", "rejected"]);
    await expect(order(id)).rejects.toThrow("Déjà réservé");
    await expect(order(await listing("draft"))).rejects.toThrow("plus disponible");
  });

  it("BR-12, BR-14, BR-31: one order per phone, frozen price, random code", async () => {
    const id = await listing();
    const number = phone();
    const first = await order(id, number);
    expect(first.code).toMatch(/^[A-Z2-9]{10}$/);
    await expect(order(await listing(), number)).rejects.toThrow("déjà une commande");
    await db.update(s.listings).set({ priceAr: 9000 }).where(eq(s.listings.id, id));
    expect((await o.findOrder(db, first.code, number, now))?.priceAr).toBe(5000);
    expect(await o.findOrder(db, first.code, phone(), now)).toBeNull(); // BR-30
  });

  it("BR-15, BR-16: expires without an ID, never with one", async () => {
    const id = await listing();
    const first = await order(id);
    await expect(o.submitPayment(db, first.id, "mvola", "LATE-001", after(61))).rejects.toThrow(
      "expiré",
    );
    expect(await status(first.code)).toBe("expired");

    const second = await order(id, phone(), after(62));
    await o.submitPayment(db, second.id, "mvola", "ok 12345", after(63));
    await o.expireOverdue(db, after(10 * DAY));
    expect(await status(second.code)).toBe("to_verify");
  });

  it("BR-17: spaces and case never make an ID new", async () => {
    const first = await order(await listing());
    const second = await order(await listing());
    await o.submitPayment(db, first.id, "mvola", "ab 123 45", now);
    await expect(o.submitPayment(db, second.id, "mvola", "AB12345", now)).rejects.toThrow(
      "ID déjà utilisé",
    );
    await expect(o.submitPayment(db, second.id, "orange", "AB12345", now)).resolves.toBe("AB12345");
    expect(isTxId("PP230101.1234.A1")).toBe(true);
    expect(isTxId("<script>")).toBe(false);
  });

  it("BR-18: a second rejection cancels the order", async () => {
    const id = await listing();
    const first = await order(id);
    await o.submitPayment(db, first.id, "mvola", "REJ-00001", now);
    const payment = await pendingId(first.id);
    await o.rejectPayment(db, payment, now);
    expect(await status(first.code)).toBe("awaiting_payment");
    await expect(o.rejectPayment(db, payment, now)).rejects.toThrow("déjà traité");
    await o.submitPayment(db, first.id, "mvola", "REJ-00002", now);
    await o.rejectPayment(db, await pendingId(first.id), now);
    expect(await status(first.code)).toBe("cancelled");
    await expect(order(id)).resolves.toBeTruthy();
  });

  it("BR-19, BR-20, BR-32: paid, delivered, disputed", async () => {
    const id = await listing();
    const first = await order(id);
    await expect(o.markDelivered(db, first.id, now)).rejects.toThrow("payée");
    await o.submitPayment(db, first.id, "mvola", "SOLD-0001", now);
    await o.acceptPayment(db, await pendingId(first.id), now);
    expect((await listingRow(id)).status).toBe("sold");
    await expect(order(id)).rejects.toThrow("plus disponible");
    await expect(o.openDispute(db, first.id, "récupéré", now)).rejects.toThrow("livrée");

    await o.markDelivered(db, first.id, now);
    await expect(o.cancelOrder(db, first.id)).rejects.toThrow("ne peut plus"); // BR-21
    await expect(o.openDispute(db, first.id, "récupéré", after(8 * DAY))).rejects.toThrow(
      "7 jours",
    );
    expect(canOpenDispute(now, after(7 * DAY))).toBe(true);
    await o.openDispute(db, first.id, "récupéré", after(DAY));
    await expect(o.openDispute(db, first.id, "encore", after(DAY))).rejects.toThrow("existe déjà");
    await o.closeDispute(db, first.id, "refunded", "", after(DAY));
    await expect(o.closeDispute(db, first.id, "rejected", "", after(DAY))).rejects.toThrow(
      "Aucun litige",
    );

    const rows = await o.adminOrders(db, now);
    expect(rows.find((r) => r.order.id === first.id)?.dispute?.status).toBe("refunded");
    expect(rows[0].order.status).toBe("to_verify");
  });

  it("F16: statistics read delivered orders with their dispute outcome", async () => {
    const rows = await o.deliveredOrders(db);
    expect(rows).toEqual([{ deliveredAt: now, priceAr: 5000, dispute: "refunded" }]);
  });

  it("BR-21: cancelling a paid order puts the listing back on sale", async () => {
    const id = await listing();
    const first = await order(id);
    await o.submitPayment(db, first.id, "orange", "CANCEL-01", now);
    await o.acceptPayment(db, await pendingId(first.id), now);
    await o.cancelOrder(db, first.id);
    const row = await listingRow(id);
    expect([row.status, row.soldAt]).toEqual(["published", null]);
  });

  it("BR-30: only failed lookups use up the five tries", async () => {
    for (let i = 0; i < 10; i++) {
      expect(await allowAttempt(db, "track:a", 5, 15)).toBe(true);
      await forgiveAttempt(db, "track:a");
    }
    const failed = [];
    for (let i = 0; i < 6; i++) failed.push(await allowAttempt(db, "track:a", 5, 15));
    expect(failed).toEqual([true, true, true, true, true, false]);
  });
});
