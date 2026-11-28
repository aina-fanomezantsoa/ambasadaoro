import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { db } from "@/db";
import { deliveredOrders } from "@/db/orders";
import { requireAdmin } from "@/lib/auth";
import { monthlyStats } from "@/lib/rules";

export const metadata: Metadata = { title: "Statistiques", robots: { index: false } };

const month = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

async function Stats() {
  await requireAdmin();
  await connection(); // figures change with every order
  const months = monthlyStats(await deliveredOrders(db()));
  if (months.length === 0) return <p className="mt-6 text-muted">Aucune vente livrée.</p>;

  return (
    <ul className="mt-6 space-y-3">
      {months.map((m) => (
        <li key={m.month} className="rounded-3xl bg-surface p-5">
          <h2 className="font-semibold capitalize">{month.format(new Date(`${m.month}-01`))}</h2>
          <dl className="mt-2 grid gap-2 sm:grid-cols-3">
            <div>
              <dt className="text-muted">Chiffre d&apos;affaires</dt>
              <dd className="text-lg font-bold">{m.revenueAr.toLocaleString("fr-FR")} Ar</dd>
            </div>
            <div>
              <dt className="text-muted">Ventes livrées</dt>
              <dd className="text-lg font-bold">{m.sales}</dd>
            </div>
            <div>
              <dt className="text-muted">Taux de litige</dt>
              <dd className="text-lg font-bold">
                {m.disputeRate.toLocaleString("fr-FR", {
                  style: "percent",
                  maximumFractionDigits: 1,
                })}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-10">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-muted">
        ← Annonces
      </Link>
      <h1 className="text-xl font-bold">Statistiques</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Chargement…</p>}>
        <Stats />
      </Suspense>
    </div>
  );
}
