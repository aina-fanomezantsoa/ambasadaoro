import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { connection } from "next/server";
import { Suspense } from "react";
import { z } from "zod";
import { FavoriteButton } from "@/components/favorite-button";
import { Rating } from "@/components/rating";
import { Status } from "@/components/status";
import { db } from "@/db";
import { publicListing } from "@/db/listings";
import { publicReviews } from "@/db/reviews";
import { photoUrl } from "@/lib/cloudinary";
import { accountDetails, accountMessage, whatsappHref } from "@/lib/whatsapp";
import { Chat, Shield } from "../../../icons";
import { CountView } from "./count-view";
import { Gallery } from "./gallery";

export const metadata: Metadata = { title: "Compte à vendre" };

const number = new Intl.NumberFormat("fr-FR");

async function Listing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection(); // statuses depend on the time of the request
  if (!z.uuid().safeParse(id).success) notFound();
  const listing = await publicListing(db(), id, new Date());
  if (!listing) notFound();

  const reviews = await publicReviews(db());
  const host = (await headers()).get("host");
  const whatsapp = whatsappHref(accountMessage(listing, `https://${host}/annonces/${id}`));
  const details = accountDetails(listing);

  const texts = [
    ["Description", listing.description],
    ["Skins", listing.skins],
    ["Décors", listing.decorations],
  ];

  return (
    <>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-xl font-bold break-words lg:text-3xl">{listing.title}</h1>
        <FavoriteButton id={id} title={listing.title} />
      </div>

      {listing.photos.length === 0 ? (
        <p className="mt-4 rounded-3xl bg-surface p-10 text-center text-muted">Photo à venir</p>
      ) : (
        <Gallery
          shots={listing.photos.map((photo, i) => ({
            id: photo.id,
            src: photoUrl(photo.publicId, 960, 600),
            thumb: photoUrl(photo.publicId, 160, 100),
            alt: `${listing.title}, photo ${i + 1} sur ${listing.photos.length}`,
          }))}
        />
      )}

      <div className="mt-4 rounded-3xl bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xl font-bold">{number.format(listing.priceAr)} Ar</p>
          <Status status={listing.status} reserved={listing.reserved} />
        </div>

        <dl className="mt-3 grid gap-x-6 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-white/5 py-2">
              <dt className="text-muted">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {whatsapp && listing.status === "published" && (
          <a
            href={whatsapp}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-3xl bg-accent text-base font-bold text-on-accent"
          >
            <Chat className="size-5" />
            Contacter sur WhatsApp
          </a>
        )}
        {listing.reserved && (
          <p className="mt-3 text-reserved">
            Un acheteur a réservé ce compte. S&apos;il ne paie pas, le compte revient en vente.
          </p>
        )}

        <Link href="/regles" className="mt-2 flex min-h-11 items-center gap-2 text-muted underline">
          <Shield className="size-5 text-accent" />
          Garantie 7 jours · règles et risques
        </Link>
        {reviews.count > 0 && (
          <Link href="/#avis" className="flex min-h-11 items-center gap-2 underline">
            <Rating value={reviews.average} />
            <span className="text-muted">sur {reviews.count} avis</span>
          </Link>
        )}
      </div>

      {texts.map(
        ([title, text]) =>
          text && (
            <section key={title} className="mt-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 leading-6 whitespace-pre-line text-muted">{text}</p>
            </section>
          ),
      )}
      <CountView id={id} />
    </>
  );
}

export default function ListingPage({ params }: PageProps<"/annonces/[id]">) {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-5">
      <Link href="/" className="inline-flex min-h-11 items-center text-muted">
        ← Tous les comptes
      </Link>
      <Suspense fallback={<div className="mt-4 h-96 animate-pulse rounded-3xl bg-surface" />}>
        <Listing params={params} />
      </Suspense>
    </div>
  );
}
