"use client";

import { useActionState } from "react";
import type { Result } from "@/lib/action";

/** A one-button form: publish, withdraw, delete a photo. */
export function ActionButton({
  action,
  id,
  label,
  className = "bg-surface",
}: {
  action: (state: unknown, form: FormData) => Promise<Result<string>>;
  id: string;
  label: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button
        disabled={pending}
        className={`h-11 rounded-3xl px-5 font-medium disabled:opacity-60 ${className}`}
      >
        {label}
      </button>
      {state && !state.ok && (
        <p role="alert" className="mt-2 text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
