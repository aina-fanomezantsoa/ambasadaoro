import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { z } from "zod";
import { Photo } from "@/components/photo";
import { Status } from "@/components/status";
import { db } from "@/db";
import { publicListing } from "@/db/listings";
import { HEROES } from "@/lib/limits";
import { Shield } from "../../icons";
import { CountView } from "./count-view";
import { OrderForm } from "./order-form";

export const metadata: Metadata = { title: "Compte à vendre" };

const number = new Intl.NumberFormat("fr-FR");
const optional = (value: number | null) => (value === null ? null : number.format(value));

async function Listing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection(); // statuses depend on the time of the request
  if (!z.uuid().safeParse(id).success) notFound();
  const listing = await publicListing(db(), id, new Date());
  if (!listing) notFound();

  const details = [
    ["Niveau HDV", String(listing.townHall)],
    ["Maison des ouvriers", optional(listing.builderHall)],
    ["Trophées", optional(listing.trophies)],
    ["Ligue", listing.league],
    ["Gemmes", optional(listing.gems)],
    ["Niveau XP", optional(listing.xpLevel)],
    ...Object.entries(HEROES).map(([key, label]) => [
      label,
      listing.heroes[key] ? `niveau ${listing.heroes[key]}` : "non débloqué",
    ]),
  ].filter(([, value]) => value !== null);

  const texts = [
    ["Description", listing.description],
    ["Skins", listing.skins],
    ["Décors", listing.decorations],
  ];

  return (
    <>
      <h1 className="mt-3 text-xl font-bold lg:text-3xl">{listing.title}</h1>

      {listing.photos.length === 0 ? (
        <p className="mt-4 rounded-3xl bg-surface p-10 text-center text-muted">Photo à venir</p>
      ) : (
        // Swipe sideways on a phone; focusable so the keyboard can scroll it too.
        <ul
          tabIndex={0}
          aria-label="Photos du compte"
          className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto"
        >
          {listing.photos.map((photo, i) => (
            <li key={photo.id} className="w-full shrink-0 snap-center md:w-2/3">
              <Photo
                publicId={photo.publicId}
                alt={`${listing.title}, photo ${i + 1} sur ${listing.photos.length}`}
                width={960}
                height={600}
                className="w-full rounded-3xl bg-black"
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-surface p-5">
        <p className="text-2xl font-bold">{number.format(listing.priceAr)} Ar</p>
        <Status status={listing.status} reserved={listing.reserved} />
        <Link
          href="/regles"
          className="flex min-h-11 w-full items-center gap-2 text-muted underline"
        >
          <Shield className="size-5 text-accent" />
          Garantie 7 jours · règles et risques
        </Link>
      </div>

      {listing.status === "published" &&
        (listing.reserved ? (
          <p className="mt-4 rounded-3xl bg-surface p-5 text-reserved">
            Un acheteur a réservé ce compte. S&apos;il ne paie pas, le compte revient en vente.
          </p>
        ) : (
          <OrderForm listingId={listing.id} title={listing.title} />
        ))}

      <dl className="mt-4 grid gap-x-6 rounded-3xl bg-surface p-5 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 border-b border-white/5 py-2">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

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
