"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import * as orders from "@/db/orders";
import { action } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";

const byId = z.object({ id: z.uuid() });

/** Runs one decision, refreshes the list, returns the confirmation. */
const decision = <S extends z.ZodType>(
  schema: S,
  message: string,
  run: (input: z.output<S>) => Promise<unknown>,
) =>
  action(schema, async (input) => {
    await run(input);
    refresh();
    return message;
  });

const accept = decision(byId, "Paiement validé.", ({ id }) =>
  orders.acceptPayment(db(), id, new Date()),
);
const reject = decision(byId, "Paiement refusé.", ({ id }) =>
  orders.rejectPayment(db(), id, new Date()),
);
const deliver = decision(byId, "Commande livrée.", ({ id }) =>
  orders.markDelivered(db(), id, new Date()),
);
const cancel = decision(byId, "Commande annulée.", ({ id }) => orders.cancelOrder(db(), id));
const open = decision(
  byId.extend({ reason: z.string().trim().min(3).max(1000) }),
  "Litige ouvert.",
  ({ id, reason }) => orders.openDispute(db(), id, reason, new Date()),
);
const close = decision(
  byId.extend({
    outcome: z.enum(["refunded", "exchanged", "rejected"]),
    note: z.string().trim().max(1000),
  }),
  "Litige clos.",
  ({ id, outcome, note }) => orders.closeDispute(db(), id, outcome, note, new Date()),
);

export async function acceptPayment(_state: unknown, form: FormData) {
  await requireAdmin();
  return accept(Object.fromEntries(form));
}

export async function rejectPayment(_state: unknown, form: FormData) {
  await requireAdmin();
  return reject(Object.fromEntries(form));
}

export async function markDelivered(_state: unknown, form: FormData) {
  await requireAdmin();
  return deliver(Object.fromEntries(form));
}

export async function cancelOrder(_state: unknown, form: FormData) {
  await requireAdmin();
  return cancel(Object.fromEntries(form));
}

export async function openDispute(_state: unknown, form: FormData) {
  await requireAdmin();
  return open(Object.fromEntries(form));
}

export async function closeDispute(_state: unknown, form: FormData) {
  await requireAdmin();
  return close(Object.fromEntries(form));
}
