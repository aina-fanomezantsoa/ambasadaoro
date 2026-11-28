"use client";

import { useState } from "react";

type Shot = { id: string; src: string; thumb: string; alt: string };

/** One large photo, the others as thumbnails; the tapped one takes its place (F04). */
export function Gallery({ shots }: { shots: Shot[] }) {
  const [index, setIndex] = useState(0);
  const shown = shots[index] ?? shots[0];
  return (
    <div className="mt-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shown.src}
        alt={shown.alt}
        width={960}
        height={600}
        className="aspect-[16/10] w-full rounded-3xl bg-black object-cover"
      />
      {shots.length > 1 && (
        <ul aria-label="Autres photos" className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {shots.map((shot, i) => (
            <li key={shot.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Afficher la photo ${i + 1}`}
                aria-pressed={shot === shown}
                className="block w-full overflow-hidden rounded-xl border-2 border-transparent aria-pressed:border-accent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.thumb}
                  alt=""
                  width={160}
                  height={100}
                  loading="lazy"
                  className="aspect-[16/10] w-full bg-black object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
