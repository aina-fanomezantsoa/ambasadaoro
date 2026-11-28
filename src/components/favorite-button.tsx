"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "@/app/icons";
import { favoritesText, parseFavorites, subscribeFavorites, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({
  id,
  title,
  className = "",
}: {
  id: string;
  title: string;
  className?: string;
}) {
  const text = useSyncExternalStore(subscribeFavorites, favoritesText, () => "[]");
  const active = parseFavorites(text).includes(id);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`Favori : ${title}`}
      onClick={() => toggleFavorite(id)}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-chip ${
        active ? "text-accent" : "text-muted"
      } ${className}`}
    >
      <Heart className={`size-5 ${active ? "fill-current" : ""}`} />
    </button>
  );
}
