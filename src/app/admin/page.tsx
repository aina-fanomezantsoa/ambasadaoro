import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Photo } from "@/components/photo";
import { Status } from "@/components/status";
import { db } from "@/db";
import { adminListings, coverPhotos } from "@/db/listings";
import { requireAdmin } from "@/lib/auth";
import { PAGE_SIZE, param, type Params } from "@/lib/catalogue";
import { Search } from "../icons";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

const href = (q: string, page: number) =>
  `/admin?${new URLSearchParams({ ...(q && { q }), page: String(page) })}`;
const pageLink = "flex min-h-11 items-center rounded-full bg-surface px-5";

async function Dashboard({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = param(params, "q");
  const { rows, total, page, pages } = await adminListings(
    db(),
    q,
    Number(param(params, "page")),
    PAGE_SIZE,
  );

  const covers = await coverPhotos(db());

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
          href="/admin/apparence"
          className="flex h-11 items-center rounded-3xl bg-surface px-5 font-medium"
        >
          Accueil
        </Link>
        <Link
          href="/admin/avis"
          className="flex h-11 items-center rounded-3xl bg-surface px-5 font-medium"
        >
          Avis
        </Link>
        <Link
          href="/admin/statistiques"
          className="flex h-11 items-center rounded-3xl bg-surface px-5 font-medium"
        >
          Statistiques
        </Link>
        <form action={logout}>
          <button className="h-11 rounded-3xl bg-surface px-5 font-medium">Se déconnecter</button>
        </form>
      </div>
      {/* The key resets the field when the search is cleared by a link. */}
      <form action="/admin" key={q} role="search" className="mt-4 flex flex-wrap gap-3">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-white/15 bg-field px-5 sm:max-w-sm">
          <Search className="size-4 shrink-0 text-muted" />
          <span className="sr-only">Rechercher une annonce par titre</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Rechercher un titre"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
          />
        </label>
        <button className="h-11 rounded-3xl bg-surface px-5 font-medium">Rechercher</button>
        {q && (
          <Link href="/admin" className="flex h-11 items-center font-semibold text-accent">
            Effacer
          </Link>
        )}
      </form>
      <p role="status" className="mt-4 text-muted">
        {total} annonce{total > 1 && "s"}
      </p>
      {rows.length === 0 ? (
        <p className="mt-6 text-muted">{q ? "Aucune annonce ne correspond." : "Rien à traiter."}</p>
      ) : (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((l) => {
            const cover = covers.get(l.id);
            return (
              <li key={l.id}>
                <Link
                  href={`/admin/annonces/${l.id}`}
                  className="flex h-full flex-col gap-3 rounded-3xl bg-surface p-4"
                >
                  {cover ? (
                    <Photo
                      publicId={cover}
                      alt=""
                      width={480}
                      height={300}
                      className="aspect-[16/10] w-full rounded-2xl bg-black object-cover"
                    />
                  ) : (
                    <span className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-field text-muted">
                      Pas de photo
                    </span>
                  )}
                  <span className="line-clamp-2 font-medium break-words">{l.title}</span>
                  <span className="text-muted">
                    HDV {l.townHall}
                    {l.featured && " · à la une"}
                  </span>
                  <span className="mt-auto flex items-center justify-between gap-3">
                    <strong className="text-base">{l.priceAr.toLocaleString("fr-FR")} Ar</strong>
                    <Status status={l.status} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link href={href(q, page - 1)} className={pageLink}>
              Précédent
            </Link>
          )}
          <span className="text-muted">
            Page {page} sur {pages}
          </span>
          {page < pages && (
            <Link href={href(q, page + 1)} className={pageLink}>
              Suivant
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <h1 className="text-xl font-bold">Annonces</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Chargement…</p>}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
