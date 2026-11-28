"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { saveHome } from "./actions";

const box = "mt-1 block w-full rounded-2xl border border-white/15 bg-field px-4";

export function TextForm({ title, bio }: { title: string; bio: string }) {
  const [state, formAction, pending] = useActionState(saveHome, null);

  // Submitting by hand keeps what was typed: a form `action` would reset the fields.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => formAction(form));
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <label className="block font-medium">
        Titre
        <input name="title" defaultValue={title} maxLength={120} className={`${box} h-11`} />
      </label>
      <label className="block font-medium">
        Bio
        <textarea
          name="bio"
          defaultValue={bio}
          maxLength={1000}
          rows={5}
          className={`${box} py-3`}
        />
      </label>
      <p className="text-muted">
        Titre vide : le titre d&apos;origine revient. Bio vide : aucun paragraphe.
      </p>
      <button
        disabled={pending}
        className="h-11 rounded-3xl bg-accent px-5 font-medium text-on-accent disabled:opacity-60"
      >
        Enregistrer
      </button>
      {state && (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "" : "text-danger"}>
          {state.ok ? state.data : state.error}
        </p>
      )}
    </form>
  );
}
