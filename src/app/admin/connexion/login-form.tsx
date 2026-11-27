"use client";

import { useActionState } from "react";
import { login } from "../actions";

const field = "mt-1 block h-11 w-full rounded-2xl border border-white/15 bg-field px-4";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block font-medium">
        E-mail
        <input
          type="email"
          name="email"
          autoComplete="username"
          defaultValue={state?.email}
          required
          className={field}
        />
      </label>
      <label className="block font-medium">
        Mot de passe
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </label>
      {state && !state.ok && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="h-11 w-full rounded-3xl bg-accent font-medium text-on-accent disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
