"use client";

import { startTransition, useActionState, type ComponentProps, type FormEvent } from "react";
import type { listings } from "@/db/schema";
import { HEROES } from "@/lib/limits";
import { saveListing } from "./actions";

type Listing = typeof listings.$inferSelect;

const box = "mt-1 block w-full rounded-2xl border border-white/15 bg-field px-4";

function Field({ label, ...props }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="block font-medium">
      {label}
      <input className={`${box} h-11`} {...props} />
    </label>
  );
}

function Area({ label, ...props }: { label: string } & ComponentProps<"textarea">) {
  return (
    <label className="block font-medium">
      {label}
      <textarea rows={3} className={`${box} py-3`} {...props} />
    </label>
  );
}

export function ListingFields({ listing }: { listing?: Listing }) {
  const [state, formAction, pending] = useActionState(saveListing, null);

  // Submitting by hand keeps what was typed: a form `action` would reset every field.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => formAction(form));
  }

  type NumberKey = "priceAr" | "townHall" | "builderHall" | "trophies" | "gems" | "xpLevel";
  const number = (name: NumberKey, min: number, max: number) => ({
    name,
    type: "number",
    min,
    max,
    defaultValue: listing?.[name] ?? "",
  });
  const text = (name: "title" | "league" | "description" | "skins" | "decorations") => ({
    name,
    defaultValue: listing?.[name] ?? "",
  });

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <input type="hidden" name="id" value={listing?.id ?? ""} />
      <Field label="Titre" {...text("title")} maxLength={120} required />
      <Area label="Description" {...text("description")} maxLength={4000} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prix en ariary" {...number("priceAr", 1000, 100_000_000)} required />
        <Field label="Niveau HDV" {...number("townHall", 1, 18)} required />
        <Field label="Maison des ouvriers" {...number("builderHall", 0, 10)} />
        <Field label="Trophées" {...number("trophies", 0, 100_000)} />
        <Field label="Ligue" {...text("league")} maxLength={60} />
        <Field label="Gemmes" {...number("gems", 0, 10_000_000)} />
        <Field label="Niveau XP" {...number("xpLevel", 0, 1000)} />
      </div>
      <fieldset>
        <legend className="font-semibold">Héros (vide = non débloqué)</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {Object.entries(HEROES).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              name={key}
              type="number"
              min={0}
              max={200}
              defaultValue={listing?.heroes[key] ?? ""}
            />
          ))}
        </div>
      </fieldset>
      <Area label="Skins" {...text("skins")} maxLength={1000} />
      <Area label="Décors" {...text("decorations")} maxLength={1000} />
      <label className="flex min-h-11 items-center gap-3 font-medium">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={listing?.featured}
          className="size-5"
        />
        À la une
      </label>
      {state && (
        <p
          role={state.ok ? "status" : "alert"}
          className={state.ok ? "text-available" : "text-danger"}
        >
          {state.ok ? state.data : state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="h-11 w-full rounded-3xl bg-accent font-medium text-on-accent disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
