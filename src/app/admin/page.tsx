import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

async function Dashboard() {
  await requireAdmin();

  return (
    <>
      <p className="mt-3 text-muted">La gestion des annonces arrive à la prochaine étape.</p>
      <form action={logout} className="mt-6">
        <button className="h-11 rounded-3xl bg-surface px-5 font-medium">Se déconnecter</button>
      </form>
    </>
  );
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <h1 className="text-xl font-bold">Administration</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Chargement…</p>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
