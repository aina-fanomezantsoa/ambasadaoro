import { connection } from "next/server";
import { Rating } from "@/components/rating";
import { db } from "@/db";
import { publicReviews } from "@/db/reviews";

const date = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeZone: "Indian/Antananarivo",
});

/** F11: the shop's average and latest reviews; nothing until the first one. */
export async function Reviews() {
  await connection();
  const { count, average, latest } = await publicReviews(db());
  if (count === 0) return null;
  return (
    <section id="avis" className="mt-10 scroll-mt-40">
      <h2 className="text-xl font-bold">Avis des acheteurs</h2>
      <p className="mt-1">
        <Rating value={average} /> <span className="text-muted">sur {count} avis</span>
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map((review) => (
          <li key={review.id} className="rounded-3xl bg-surface p-5">
            <Rating value={review.rating} />
            {review.comment && (
              <p className="mt-2 leading-6 break-words whitespace-pre-line">{review.comment}</p>
            )}
            <p className="mt-2 text-xs text-muted">{date.format(review.createdAt)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
