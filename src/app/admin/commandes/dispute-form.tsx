"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { DISPUTE_STATUS } from "@/lib/limits";
import { closeDispute, openDispute } from "./actions";

const box = "mt-1 block w-full rounded-2xl border border-white/15 bg-field px-4";

export function DisputeForm({ orderId, open }: { orderId: string; open: boolean }) {
  const [state, formAction, pending] = useActionState(open ? closeDispute : openDispute, null);

  // Submitting by hand keeps what was typed after an error.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => formAction(form));
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <input type="hidden" name="id" value={orderId} />
      {open ? (
        <>
          <label className="block font-medium">
            Issue du litige
            <select name="outcome" required defaultValue="" className={`${box} h-11`}>
              <option value="" disabled>
                Choisir
              </option>
              {(["refunded", "exchanged", "rejected"] as const).map((key) => (
                <option key={key} value={key}>
                  {DISPUTE_STATUS[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="block font-medium">
            Note (facultative)
            <textarea name="note" rows={2} maxLength={1000} className={`${box} py-3`} />
          </label>
        </>
      ) : (
        <label className="block font-medium">
          Motif du litige
          <textarea
            name="reason"
            rows={2}
            minLength={3}
            maxLength={1000}
            required
            className={`${box} py-3`}
          />
        </label>
      )}
      {state && !state.ok && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="h-11 rounded-3xl bg-chip px-5 font-medium disabled:opacity-60"
      >
        {open ? "Clore le litige" : "Ouvrir un litige"}
      </button>
    </form>
  );
}
