import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { Photo } from "@/components/photo";
import { Status } from "@/components/status";
import { db } from "@/db";
import { photosOf } from "@/db/listings";
import { listings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { MAX_PHOTOS } from "@/lib/limits";
import { ActionButton } from "../action-button";
import { deletePhoto, markSold, publishListing, withdrawListing } from "../actions";
import { ListingFields } from "../listing-fields";
import { PhotoUpload } from "../photo-upload";

export const metadata: Metadata = { title: "Modifier l'annonce", robots: { index: false } };

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [listing] = await db().select().from(listings).where(eq(listings.id, id));
  if (!listing) notFound();
  const photos = await photosOf(db(), id);

  return (
    <>
      <div className="mt-3 flex flex-wrap items-start gap-3">
        <span className="flex h-11 items-center">
          <Status status={listing.status} />
        </span>
        {(listing.status === "draft" || listing.status === "withdrawn") && (
          <ActionButton
            action={publishListing}
            id={id}
            label="Publier"
            className="bg-accent text-on-accent"
          />
        )}
        {listing.status === "published" && (
          <ActionButton
            action={markSold}
            id={id}
            label="Marquer vendu"
            className="bg-accent text-on-accent"
            confirm="Marquer ce compte vendu ? Il ne pourra plus être remis en vente."
          />
        )}
        {(listing.status === "draft" || listing.status === "published") && (
          <ActionButton action={withdrawListing} id={id} label="Retirer" />
        )}
        {listing.status === "published" && (
          <Link
            href={`/annonces/${id}`}
            className="flex h-11 items-center font-semibold text-accent"
          >
            Voir la fiche
          </Link>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold">
        Photos ({photos.length}/{MAX_PHOTOS})
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.id} className="space-y-2">
            <Photo
              publicId={photo.publicId}
              alt={`Photo ${i + 1}`}
              width={320}
              height={200}
              className="w-full rounded-2xl bg-black"
            />
            <ActionButton action={deletePhoto} id={photo.id} label="Supprimer" />
          </li>
        ))}
      </ul>
      <PhotoUpload listingId={id} room={MAX_PHOTOS - photos.length} />

      <h2 className="mt-8 text-lg font-semibold">Informations</h2>
      <ListingFields listing={listing} />
    </>
  );
}

export default function EditListingPage({ params }: PageProps<"/admin/annonces/[id]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-muted">
        ← Annonces
      </Link>
      <h1 className="text-xl font-bold">Modifier l&apos;annonce</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Chargement…</p>}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}
