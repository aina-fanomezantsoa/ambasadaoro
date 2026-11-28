"use client";

import type { FormEvent } from "react";

/** F11: sent through the tracker, which already holds the code and the phone. */
export function ReviewForm({
  code,
  phone,
  submit,
  pending,
}: {
  code: string;
  phone: string;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
}) {
  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="phone" value={phone} />
      <label className="block font-semibold">
        Votre note
        <select
          name="rating"
          required
          defaultValue=""
          className="mt-1 block h-11 w-full rounded-2xl border border-white/15 bg-field px-4"
        >
          <option value="" disabled>
            Choisir une note
          </option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} sur 5
            </option>
          ))}
        </select>
      </label>
      <label className="block font-semibold">
        Commentaire (facultatif, publié sur le site)
        <textarea
          name="comment"
          rows={3}
          maxLength={500}
          className="mt-1 block w-full rounded-2xl border border-white/15 bg-field px-4 py-3 font-normal"
        />
      </label>
      <button
        disabled={pending}
        className="h-11 w-full rounded-3xl bg-accent font-medium text-on-accent disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Publier mon avis"}
      </button>
    </form>
  );
}
