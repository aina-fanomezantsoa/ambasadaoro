"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { favoritesText, parseFavorites, subscribeFavorites } from "@/lib/favorites";

/** Keeps ?ids= equal to what the device remembers, so the server can render those listings. */
export function FavoritesSync({ children }: { children: ReactNode }) {
  const router = useRouter();
  const shown = useSearchParams().get("ids") ?? "";
  // null on the server and during hydration: the device's list is not known yet.
  const text = useSyncExternalStore(subscribeFavorites, favoritesText, () => null);
  const wanted = text === null ? null : parseFavorites(text).join(",");

  useEffect(() => {
    if (wanted && wanted !== shown) router.replace(`/favoris?ids=${wanted}`, { scroll: false });
  }, [wanted, shown, router]);

  if (wanted === null) return null;
  if (!wanted) {
    return (
      <div className="mt-4 rounded-3xl bg-surface p-10 text-center">
        <p>Aucun favori.</p>
        <Link href="/" className="mt-2 inline-block min-h-11 py-3 font-semibold text-accent">
          Voir les comptes
        </Link>
      </div>
    );
  }
  return children;
}
