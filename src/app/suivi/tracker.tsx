"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { DISPUTE_STATUS, OPERATORS, ORDER_STATUS } from "@/lib/limits";
import { historyText, parseHistory, type PastOrder } from "@/lib/order-history";
import { createReview, submitPayment, trackOrder, type OrderView } from "./actions";
import { ReviewForm } from "./review-form";

const field = "mt-1 block h-11 w-full rounded-2xl border border-white/15 bg-field px-4";
const button = "h-11 w-full rounded-3xl bg-accent font-medium text-on-accent disabled:opacity-60";
const ariary = new Intl.NumberFormat("fr-FR");
const time = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" });
const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

type Submit = (event: FormEvent<HTMLFormElement>) => void;
type State = { order: OrderView | null; phone: string; error: string | null };

async function run(previous: State, form: FormData): Promise<State> {
  const send = form.has("txId") ? submitPayment : form.has("rating") ? createReview : trackOrder;
  const result = await send(form);
  const phone = String(form.get("phone"));
  if (result.ok) return { order: result.data, phone, error: null };
  // A refused ID or review keeps the order on screen, to try again.
  return { order: send === trackOrder ? null : previous.order, phone, error: result.error };
}

function credentials({ code, phone }: PastOrder) {
  const form = new FormData();
  form.set("code", code);
  form.set("phone", phone);
  return form;
}

export function Tracker() {
  const wanted = useSearchParams().get("code");
  const past = parseHistory(useSyncExternalStore(subscribe, historyText, () => "[]"));
  const [{ order, phone, error }, send, pending] = useActionState(run, {
    order: null,
    phone: "",
    error: null,
  });

  // Just after ordering: open that order without asking for what this device already knows.
  useEffect(() => {
    const entry = parseHistory(historyText()).find((o) => o.code === wanted);
    if (entry) startTransition(() => send(credentials(entry)));
  }, [wanted, send]);

  // Submitting by hand keeps what was typed after an error.
  const submit: Submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => send(form));
  };

  return (
    <>
      <form onSubmit={submit} className="mt-4 space-y-4 rounded-3xl bg-surface p-5">
        <label className="block font-medium">
          Code de commande
          <input
            key={wanted}
            name="code"
            defaultValue={wanted ?? ""}
            autoCapitalize="characters"
            maxLength={20}
            required
            className={`${field} uppercase`}
          />
        </label>
        <label className="block font-medium">
          Numéro de téléphone
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            maxLength={30}
            required
            className={field}
          />
        </label>
        <button disabled={pending} className={button}>
          {pending ? "Recherche…" : "Voir ma commande"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-danger">
          {error}
        </p>
      )}
      {order && (
        <Order key={order.code} order={order} phone={phone} submit={submit} pending={pending} />
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Commandes passées sur cet appareil</h2>
        {past.length === 0 ? (
          <p className="mt-2 text-muted">Aucune commande pour le moment.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {past.map((entry) => (
              <li key={entry.code}>
                <button
                  type="button"
                  onClick={() => startTransition(() => send(credentials(entry)))}
                  className="min-h-14 w-full rounded-3xl bg-surface px-5 py-3 text-left"
                >
                  <span className="block font-medium">{entry.title}</span>
                  <span className="text-muted">Code {entry.code}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Order({
  order,
  phone,
  submit,
  pending,
}: {
  order: OrderView;
  phone: string;
  submit: Submit;
  pending: boolean;
}) {
  const operators = Object.entries(OPERATORS).flatMap(([key, label]) => {
    const number = order.numbers?.[key as keyof typeof OPERATORS];
    return number ? [{ key, label, number }] : [];
  });

  return (
    <section aria-live="polite" className="mt-4 rounded-3xl bg-surface p-5">
      <h2 className="text-lg font-semibold">{order.title}</h2>
      <p className="mt-2">
        Code de commande : <strong className="text-lg tracking-wider">{order.code}</strong>
      </p>
      <p className="text-muted">Notez-le : il sert à suivre votre achat.</p>
      <p className="mt-2 font-medium">
        {order.dispute ? DISPUTE_STATUS[order.dispute] : ORDER_STATUS[order.status]} ·{" "}
        {ariary.format(order.priceAr)} Ar
      </p>

      {order.status === "awaiting_payment" && (
        <>
          {order.rejections > 0 && (
            <p className="mt-3 text-danger">
              L&apos;ID envoyé a été refusé. Il vous reste un essai.
            </p>
          )}
          {order.expiresAt && (
            <p className="mt-3 text-reserved">
              Envoyez l&apos;ID avant {time.format(new Date(order.expiresAt))}, sinon la commande
              expire.
            </p>
          )}
          {operators.length === 0 ? (
            <p className="mt-3 text-muted">Contactez-nous pour obtenir le numéro de paiement.</p>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-4">
              <input type="hidden" name="code" value={order.code} />
              <input type="hidden" name="phone" value={phone} />
              <fieldset>
                <legend className="font-semibold">
                  1. Envoyez {ariary.format(order.priceAr)} Ar à l&apos;un de ces numéros
                </legend>
                {operators.map(({ key, label, number }, i) => (
                  <label key={key} className="flex min-h-11 items-center gap-3">
                    <input
                      type="radio"
                      name="operator"
                      value={key}
                      defaultChecked={i === 0}
                      className="size-5"
                    />
                    <span>
                      {label} : <strong>{number}</strong>
                    </span>
                  </label>
                ))}
              </fieldset>
              <label className="block font-semibold">
                2. Saisissez l&apos;ID de la transaction
                <input name="txId" maxLength={60} required autoComplete="off" className={field} />
              </label>
              <button disabled={pending} className={button}>
                {pending ? "Envoi…" : "Envoyer l'ID"}
              </button>
            </form>
          )}
        </>
      )}
      {order.status === "to_verify" && (
        <p className="mt-3 text-muted">
          Nous vérifions votre paiement. Le compte reste réservé jusqu&apos;à notre réponse.
        </p>
      )}
      {order.status === "paid" && (
        <p className="mt-3 text-muted">
          Paiement validé. Nous vous remettons le compte par WhatsApp ou par appel.
        </p>
      )}
      {order.status === "delivered" && (
        <p className="mt-3 text-muted">
          Garantie 7 jours à partir de la livraison.{" "}
          <Link href="/regles" className="font-semibold text-accent underline">
            Voir les conditions
          </Link>
        </p>
      )}
      {order.status === "delivered" &&
        (order.reviewed ? (
          <p className="mt-3 font-medium">Merci pour votre avis.</p>
        ) : (
          <ReviewForm code={order.code} phone={phone} submit={submit} pending={pending} />
        ))}
    </section>
  );
}
