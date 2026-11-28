"use server";

import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import * as orders from "@/db/orders";
import { allowAttempt, forgiveAttempt } from "@/db/rate-limit";
import { action, UserError } from "@/lib/action";
import { alertAdmin } from "@/lib/alert";
import { clientIp } from "@/lib/client-ip";
import { OPERATORS } from "@/lib/limits";
import { normalizePhone } from "@/lib/rules";

const phone = z.string().max(30).transform(normalizePhone);

const create = action(
  z.object({
    listingId: z.uuid(),
    name: z.string().trim().min(2).max(80),
    phone,
    rules: z.literal("on"), // BR-13
    adult: z.literal("on"), // BR-13
  }),
  async ({ listingId, name, phone }) => {
    if (!phone) throw new UserError("Numéro malgache invalide (ex. 034 12 345 67).");
    // Stops one visitor from reserving the whole stock with made-up numbers.
    if (!(await allowAttempt(db(), `order:${await clientIp()}`, 10, 60))) {
      throw new UserError("Trop de commandes. Réessayez dans une heure.");
    }
    const code = await orders.createOrder(db(), { listingId, name, phone }, new Date());
    return { code, phone };
  },
);

export async function createOrder(_state: unknown, form: FormData) {
  return create(Object.fromEntries(form));
}

const credentials = z.object({ code: z.string().trim().toUpperCase().max(20), phone });
type Credentials = z.output<typeof credentials>;

/** BR-30: five wrong code and phone pairs per 15 minutes. */
async function ownOrder({ code, phone }: Credentials) {
  const key = `track:${await clientIp()}`;
  if (!(await allowAttempt(db(), key, 5, 15))) {
    throw new UserError("Trop d'essais. Réessayez dans 15 minutes.");
  }
  const order = phone && (await orders.findOrder(db(), code, phone, new Date()));
  if (!order) throw new UserError("Code ou téléphone incorrect.");
  await forgiveAttempt(db(), key);
  return order;
}

/** What the browser gets back: no database id, and the numbers to pay while payment is due. */
async function view(input: Credentials) {
  const { id, ...order } = await ownOrder(input);
  void id; // never sent to the browser
  const numbers = { mvola: process.env.MVOLA_NUMBER, orange: process.env.ORANGE_MONEY_NUMBER };
  return { ...order, numbers: order.status === "awaiting_payment" ? numbers : null };
}
export type OrderView = Awaited<ReturnType<typeof view>>;

const track = action(credentials, view);

export async function trackOrder(form: FormData) {
  return track(Object.fromEntries(form));
}

const pay = action(
  credentials.extend({ operator: z.enum(["mvola", "orange"]), txId: z.string().max(60) }),
  async ({ operator, txId, ...input }) => {
    const order = await ownOrder(input);
    const saved = await orders.submitPayment(db(), order.id, operator, txId, new Date());
    // The payment is recorded even if the e-mail fails; the failure is only logged.
    after(() =>
      alertAdmin(
        `Paiement à vérifier : commande ${order.code}`,
        [
          `Compte : ${order.title}`,
          `Montant : ${order.priceAr.toLocaleString("fr-FR")} Ar`,
          `${OPERATORS[operator]}, ID ${saved}`,
          "À valider dans l'administration, rubrique Commandes.",
        ].join("\n"),
      ),
    );
    return view(input);
  },
);

export async function submitPayment(form: FormData) {
  return pay(Object.fromEntries(form));
}
