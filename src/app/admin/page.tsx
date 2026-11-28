import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Status } from "@/components/status";
import { db } from "@/db";
import { countToVerify } from "@/db/orders";
import { listings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

async function Dashboard() {
  await requireAdmin();
  // shortcut: every listing on one page; paginate past a few hundred.
  const rows = await db().select().from(listings).orderBy(desc(listings.createdAt));

  const toVerify = await countToVerify(db());

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/admin/annonces/nouvelle"
          className="flex h-11 items-center rounded-3xl bg-accent px-5 font-medium text-on-accent"
        >
          Nouvelle annonce
        </Link>
        <Link
          href="/admin/commandes"
          className="flex h-11 items-center rounded-3xl bg-surface px-5 font-medium"
        >
          Commandes{toVerify > 0 && ` (${toVerify} à vérifier)`}
        </Link>
        <Link
          href="/admin/avis"
          className="flex h-11 items-center rounded-3xl bg-surface px-5 font-medium"
        >
          Avis
        </Link>
        <form action={logout}>
          <button className="h-11 rounded-3xl bg-surface px-5 font-medium">Se déconnecter</button>
        </form>
      </div>
      {rows.length === 0 ? (
        <p className="mt-6 text-muted">Rien à traiter.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {rows.map((l) => (
            <li key={l.id}>
              <Link
                href={`/admin/annonces/${l.id}`}
                className="flex min-h-14 items-center justify-between gap-3 rounded-3xl bg-surface px-5 py-3"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{l.title}</span>
                  <span className="text-muted">
                    HDV {l.townHall} · {l.priceAr.toLocaleString("fr-FR")} Ar
                    {l.featured && " · à la une"}
                  </span>
                </span>
                <Status status={l.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <h1 className="text-xl font-bold">Annonces</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Chargement…</p>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
