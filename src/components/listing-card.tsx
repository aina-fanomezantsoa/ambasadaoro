import Link from "next/link";
import { Image as PhotoIcon, Shield } from "@/app/icons";
import type { CatalogueListing } from "@/lib/catalogue";
import { HEROES } from "@/lib/limits";
import { FavoriteButton } from "./favorite-button";
import { Photo } from "./photo";
import { Status } from "./status";

const ariary = new Intl.NumberFormat("fr-FR");

type Listed = CatalogueListing & { id: string; cover: string | null };

export function ListingCard({ listing }: { listing: Listed }) {
  const sold = listing.status === "sold";
  return (
    <li>
      <article className="relative flex h-full flex-col rounded-3xl bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Android et iOS{listing.featured && !sold && " · À la une"}
          </p>
          {/* Above the stretched title link, so a tap does not open the listing. */}
          <FavoriteButton id={listing.id} title={listing.title} className="relative z-10" />
        </div>
        <h2 className="mt-2 line-clamp-2 min-h-12 text-base leading-6 font-medium">
          {/* The pseudo-element makes the whole card clickable. */}
          <Link href={`/annonces/${listing.id}`} className="after:absolute after:inset-0">
            {listing.title}
          </Link>
        </h2>
        {listing.cover ? (
          <Photo
            publicId={listing.cover}
            alt={listing.title}
            width={640}
            height={400}
            className="mt-3 aspect-[16/10] w-full rounded-2xl bg-black object-cover"
          />
        ) : (
          <div className="mt-3 flex aspect-[16/10] flex-col items-center justify-center gap-1 rounded-2xl bg-black text-xs text-muted">
            <PhotoIcon className="size-6" />
            Photo à venir
          </div>
        )}
        <ul className="mt-4 flex flex-wrap gap-2">
          <li className="flex h-6 items-center rounded-full bg-chip px-3 text-chip-text">
            HDV {listing.townHall}
          </li>
          {Object.entries(HEROES).map(
            ([key, label]) =>
              listing.heroes[key] > 0 && (
                <li
                  key={key}
                  className="flex h-6 items-center rounded-full bg-chip px-3 text-chip-text"
                >
                  {label} {listing.heroes[key]}
                </li>
              ),
          )}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <p className={`text-2xl leading-6 font-bold ${sold ? "text-muted line-through" : ""}`}>
            {ariary.format(listing.priceAr)} Ar
          </p>
          <Status status={listing.status} reserved={listing.reserved} />
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-dashed border-line pt-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-chip">
            <Shield className="size-5 text-accent" />
          </span>
          <span>
            <span className="block font-medium">Ambasadaoro</span>
            <span className="block text-xs font-medium text-muted">Garantie 7 jours</span>
          </span>
        </div>
      </article>
    </li>
  );
}
