"use client";

import { useState, type ChangeEvent } from "react";
import { MAX_PHOTO_BYTES } from "@/lib/limits";
import { addPhoto, signUpload } from "./actions";

const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Sends one file straight to Cloudinary, then records it; returns the error message, if any. */
async function upload(listingId: string, file: File) {
  if (!TYPES.includes(file.type) || file.size > MAX_PHOTO_BYTES) {
    return `${file.name} : JPEG, PNG ou WebP de 5 Mo au maximum.`;
  }
  const signed = await signUpload({ id: listingId });
  if (!signed.ok) return signed.error;
  const body = new FormData();
  for (const [key, value] of Object.entries(signed.data.fields)) body.set(key, String(value));
  body.set("file", file);
  const response = await fetch(signed.data.url, { method: "POST", body });
  if (!response.ok) return `${file.name} : envoi refusé.`;
  const added = await addPhoto({ id: listingId, publicId: signed.data.fields.public_id });
  return added.ok ? "" : added.error;
}

export function PhotoUpload({ listingId, room }: { listingId: string; room: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    setBusy(true);
    setError("");
    const errors: string[] = [];
    try {
      for (const file of files.slice(0, room)) errors.push(await upload(listingId, file));
      if (files.length > room) errors.push(`Il ne reste que ${room} place(s).`);
    } catch {
      errors.push("Envoi interrompu. Vérifiez la connexion et réessayez.");
    }
    setError(errors.filter(Boolean).join(" "));
    setBusy(false);
    input.value = "";
  }

  return (
    <div className="mt-4">
      <label className="block font-medium">
        Ajouter des photos
        <input
          type="file"
          accept={TYPES.join(",")}
          multiple
          disabled={busy || room <= 0}
          onChange={choose}
          className="mt-1 block min-h-11 w-full file:mr-3 file:h-11 file:rounded-3xl file:border-0 file:bg-surface file:px-5 file:text-foreground"
        />
      </label>
      {busy && <p role="status">Envoi en cours…</p>}
      {error && (
        <p role="alert" className="mt-2 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
