import type { Metadata } from "next";
import { Suspense } from "react";
import { Tracker } from "./tracker";

export const metadata: Metadata = { title: "Suivre ma commande", robots: { index: false } };

export default function TrackingPage() {
  return (
    <div className="mx-auto max-w-[560px] px-4 py-8">
      <h1 className="text-xl font-bold">Suivre ma commande</h1>
      <Suspense fallback={<p className="mt-4 text-muted">Chargement…</p>}>
        <Tracker />
      </Suspense>
    </div>
  );
}
