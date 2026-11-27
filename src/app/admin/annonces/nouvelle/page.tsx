import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { ListingFields } from "../listing-fields";

export const metadata: Metadata = { title: "Nouvelle annonce", robots: { index: false } };

async function NewListing() {
  await requireAdmin();
  return <ListingFields />;
}

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold">Nouvelle annonce</h1>
      <p className="mt-2 text-muted">Les photos s&apos;ajoutent après l&apos;enregistrement.</p>
      <Suspense fallback={<p className="mt-3 text-muted">Chargement…</p>}>
        <NewListing />
      </Suspense>
    </div>
  );
}
