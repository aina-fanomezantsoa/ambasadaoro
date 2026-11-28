import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ListingCard } from "@/components/listing-card";
import { db } from "@/db";
import { publicListings } from "@/db/listings";
import { param, type Params } from "@/lib/catalogue";
import { FavoritesSync } from "./favorites-sync";

export const metadata: Metadata = { title: "Mes favoris", robots: { index: false } };

const skeleton = <div className="mt-4 h-96 animate-pulse rounded-3xl bg-surface" />;

/** The ids come from the browser through the URL; the cards are the catalogue's own. */
async function Favorites({ searchParams }: { searchParams: Promise<Params> }) {
  const ids = param(await searchParams, "ids").split(",");
  await connection(); // statuses depend on the time of the request
  const found = (await publicListings(db(), new Date())).filter((l) => ids.includes(l.id));
  if (found.length === 0) {
    return <p className="mt-4 text-muted">Aucun de vos favoris n&apos;est en vente.</p>;
  }
  return (
    <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {found.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </ul>
  );
}

export default function FavoritesPage({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <h1 className="text-xl font-bold">Mes favoris</h1>
      <p className="text-muted">Conservés sur cet appareil.</p>
      <Suspense fallback={skeleton}>
        <FavoritesSync>
          <Suspense fallback={skeleton}>
            <Favorites searchParams={searchParams} />
          </Suspense>
        </FavoritesSync>
      </Suspense>
    </div>
  );
}
