"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, type FormEvent } from "react";
import { remember } from "@/lib/order-history";
import { createOrder } from "../../suivi/actions";

const field = "mt-1 block h-11 w-full rounded-2xl border border-white/15 bg-field px-4";

export function OrderForm({ listingId, title }: { listingId: string; title: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(async (_: unknown, form: FormData) => {
    const result = await createOrder(null, form);
    if (result.ok) {
      remember({ ...result.data, title });
      router.push(`/suivi?code=${result.data.code}`);
    }
    return result;
  }, null);

  // Submitting by hand keeps what was typed after an error.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => formAction(form));
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 rounded-3xl bg-surface p-5">
      <h2 className="text-lg font-semibold">Commander ce compte</h2>
      <p className="text-muted">
        Il vous est réservé 1 heure, le temps de payer par MVola ou Orange Money.
      </p>
      <input type="hidden" name="listingId" value={listingId} />
      <label className="block font-medium">
        Votre nom
        <input
          name="name"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
          className={field}
        />
      </label>
      <label className="block font-medium">
        Votre numéro de téléphone
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="034 12 345 67"
          maxLength={30}
          required
          className={field}
        />
      </label>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" name="rules" required className="size-5 shrink-0" />
        <span>
          J&apos;accepte les{" "}
          <Link href="/regles" target="_blank" className="font-semibold text-accent underline">
            règles, risques et garantie
          </Link>
        </span>
      </label>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" name="adult" required className="size-5 shrink-0" />
        <span>J&apos;ai 18 ans ou l&apos;accord d&apos;un parent</span>
      </label>
      {state && !state.ok && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      <button
        disabled={pending || state?.ok}
        className="h-11 w-full rounded-3xl bg-accent font-medium text-on-accent disabled:opacity-60"
      >
        {pending ? "Réservation…" : "Réserver ce compte"}
      </button>
    </form>
  );
}
