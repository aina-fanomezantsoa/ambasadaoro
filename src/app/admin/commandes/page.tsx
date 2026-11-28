import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { db } from "@/db";
import { adminOrders } from "@/db/orders";
import { requireAdmin } from "@/lib/auth";
import { DISPUTE_STATUS, OPERATORS, ORDER_STATUS } from "@/lib/limits";
import { canOpenDispute } from "@/lib/rules";
import { ActionButton } from "../annonces/action-button";
import { acceptPayment, cancelOrder, markDelivered, rejectPayment } from "./actions";
import { DisputeForm } from "./dispute-form";

export const metadata: Metadata = { title: "Commandes", robots: { index: false } };

const date = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Indian/Antananarivo",
});
const PAYMENT = { pending: "à vérifier", accepted: "validé", rejected: "refusé" } as const;
const accent = "bg-accent text-on-accent";

async function Orders() {
  await requireAdmin();
  await connection(); // expiry and the dispute delay need the time of the request
  const now = new Date();
  const rows = await adminOrders(db(), now);
  if (rows.length === 0) return <p className="mt-6 text-muted">Rien à traiter.</p>;

  return (
    <ul className="mt-6 space-y-3">
      {rows.map(({ order, title, dispute, payments }) => {
        const pending = payments.find((p) => p.status === "pending");
        return (
          <li key={order.id} className="rounded-3xl bg-surface p-5">
            <h2 className="font-semibold">{title}</h2>
            <p className="font-medium">
              {ORDER_STATUS[order.status]}
              {dispute && ` · ${DISPUTE_STATUS[dispute.status]}`} ·{" "}
              {order.priceAr.toLocaleString("fr-FR")} Ar
            </p>
            <p className="text-muted">
              {order.code} · {order.buyerName} ·{" "}
              <a href={`tel:${order.buyerPhone}`} className="underline">
                {order.buyerPhone}
              </a>{" "}
              · {date.format(order.createdAt)}
            </p>
            {payments.map((p) => (
              <p key={p.id} className="break-all">
                {OPERATORS[p.operator]} · ID <strong>{p.txId}</strong> · {PAYMENT[p.status]}
              </p>
            ))}
            {dispute && (
              <p className="break-words text-muted">
                Motif : {dispute.reason}
                {dispute.note && ` · Note : ${dispute.note}`}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              {order.status === "to_verify" && pending && (
                <>
                  <ActionButton
                    action={acceptPayment}
                    id={pending.id}
                    label="Valider le paiement"
                    className={accent}
                    confirm="Le montant et l'ID sont bien sur votre relevé Mobile Money ?"
                  />
                  <ActionButton
                    action={rejectPayment}
                    id={pending.id}
                    label="Refuser"
                    className="bg-chip"
                    confirm="Refuser ce paiement ?"
                  />
                </>
              )}
              {order.status === "paid" && (
                <ActionButton
                  action={markDelivered}
                  id={order.id}
                  label="Marquer livrée"
                  className={accent}
                  confirm="Le compte a bien été remis à l'acheteur ?"
                />
              )}
              {["awaiting_payment", "to_verify", "paid"].includes(order.status) && (
                <ActionButton
                  action={cancelOrder}
                  id={order.id}
                  label="Annuler la commande"
                  className="bg-chip"
                  confirm={
                    order.status === "paid"
                      ? "Annuler cette commande payée ? Le remboursement se fait à la main et l'annonce redevient disponible."
                      : "Annuler cette commande ?"
                  }
                />
              )}
            </div>
            {dispute?.status === "open" && <DisputeForm orderId={order.id} open />}
            {!dispute &&
              order.status === "delivered" &&
              order.deliveredAt &&
              canOpenDispute(order.deliveredAt, now) && (
                <DisputeForm orderId={order.id} open={false} />
              )}
          </li>
        );
      })}
    </ul>
  );
}

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-10">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-muted">
        ← Annonces
      </Link>
      <h1 className="text-xl font-bold">Commandes</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Chargement…</p>}>
        <Orders />
      </Suspense>
    </div>
  );
}
