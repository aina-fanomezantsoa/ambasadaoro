import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Photo } from "@/components/photo";
import { db } from "@/db";
import { heroImage, homeText } from "@/db/settings";
import { requireAdmin } from "@/lib/auth";
import { removeBackground } from "../annonces/actions";
import { PhotoUpload } from "../annonces/photo-upload";
import { TextForm } from "./text-form";

export const metadata: Metadata = { title: "Accueil", robots: { index: false } };

async function Editor() {
  await requireAdmin();
  const current = await heroImage(db());
  const text = await homeText(db());

  async function remove() {
    "use server";
    await removeBackground(); // checks the session itself
  }

  return (
    <>
      <h2 className="mt-4 text-lg font-semibold">Titre et bio</h2>
      <TextForm {...text} />
      <h2 className="mt-10 text-lg font-semibold">Image de fond</h2>
      {current ? (
        <>
          <Photo
            publicId={current}
            alt="Image de fond actuelle"
            width={1600}
            height={500}
            className="mt-4 w-full rounded-3xl bg-black"
          />
          <form action={remove}>
            <button className="mt-3 h-11 rounded-3xl bg-surface px-5 font-medium">
              Retirer l&apos;image
            </button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-muted">Aucune image : l&apos;accueil garde son fond uni.</p>
      )}
      <PhotoUpload room={1} />
      <p className="mt-2 text-muted">Image large conseillée (1600 × 500), 5 Mo au maximum.</p>
    </>
  );
}

export default function AppearancePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-muted">
        ← Annonces
      </Link>
      <h1 className="text-xl font-bold">Accueil</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Chargement…</p>}>
        <Editor />
      </Suspense>
    </div>
  );
}
