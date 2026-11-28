import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Rating } from "@/components/rating";
import { db } from "@/db";
import { adminReviews } from "@/db/reviews";
import { requireAdmin } from "@/lib/auth";
import { ActionButton } from "../annonces/action-button";
import { hideReview, showReview } from "./actions";

export const metadata: Metadata = { title: "Avis", robots: { index: false } };

async function Reviews() {
  await requireAdmin();
  const rows = await adminReviews(db());
  if (rows.length === 0) return <p className="mt-6 text-muted">Rien à traiter.</p>;

  return (
    <ul className="mt-6 space-y-3">
      {rows.map(({ review, title, code }) => (
        <li key={review.id} className="rounded-3xl bg-surface p-5">
          <h2 className="font-semibold">{title}</h2>
          <p className="text-muted">
            Commande {code} · {review.hidden ? "Masqué" : "Visible"}
          </p>
          <p>
            <Rating value={review.rating} />
          </p>
          {review.comment && <p className="break-words whitespace-pre-line">{review.comment}</p>}
          <div className="mt-3">
            <ActionButton
              action={review.hidden ? showReview : hideReview}
              id={review.id}
              label={review.hidden ? "Réafficher" : "Masquer"}
              className="bg-chip"
              confirm={review.hidden ? undefined : "Masquer cet avis du site ?"}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-10">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-muted">
        ← Annonces
      </Link>
      <h1 className="text-xl font-bold">Avis</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Chargement…</p>}>
        <Reviews />
      </Suspense>
    </div>
  );
}
