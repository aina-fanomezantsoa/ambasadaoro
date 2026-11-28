import Link from "next/link";
import { connection } from "next/server";
import { ListingCard } from "@/components/listing-card";
import { db } from "@/db";
import { publicListings } from "@/db/listings";
import { catalogueHref, param, PRICES, searchCatalogue, SORTS, type Params } from "@/lib/catalogue";
import { HEROES } from "@/lib/rules";
import { AutoSelect } from "./auto-select";
import { ChevronDown, Search, Shield } from "./icons";

const ariary = new Intl.NumberFormat("fr-FR");
const TOWN_HALLS = Array.from({ length: 10 }, (_, i) => String(17 - i));
// The text repeats the filter name so a chosen value stays readable in its pill.
const atLeast = (name: string, values: number[]) =>
  values.map((v) => [String(v), `${name} ${ariary.format(v)}+`] as const);

type Option = readonly [value: string, text: string];
const PILLS: [name: string, label: string, options: readonly Option[]][] = [
  ["hdv", "Niveau HDV", TOWN_HALLS.map((v) => [v, `HDV ${v}`] as const)],
  ...Object.entries(HEROES).map(
    ([key, label]) =>
      [key, label, atLeast(label, [10, 25, 40, 55, 70, 85])] as [string, string, Option[]],
  ),
  ["nbheros", "Nombre de héros", atLeast("Héros :", [1, 2, 3, 4, 5])],
  ["trophees", "Trophées", atLeast("Trophées", [1000, 2000, 3000, 4000, 5000])],
  ["mdo", "Maison des ouvriers", atLeast("MDO", [3, 5, 7, 9, 10])],
  ["prix", "Prix", PRICES],
];

function Pill({
  name,
  label,
  options,
  value,
}: {
  name: string;
  label: string;
  options: readonly Option[];
  value: string;
}) {
  return (
    <span className="relative shrink-0">
      <AutoSelect
        name={name}
        aria-label={label}
        defaultValue={value}
        className={`h-11 min-w-36 appearance-none rounded-full border bg-surface pr-9 pl-4 ${
          value ? "border-accent text-foreground" : "border-transparent text-muted"
        }`}
      >
        <option value="">{label}</option>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </AutoSelect>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
    </span>
  );
}

export async function Catalogue({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  await connection(); // the "sold 7 days ago" rule needs the time of the request
  const now = new Date();
  const listed = await publicListings(db(), now);
  const { items, available, total, page, pages } = searchCatalogue(listed, params, now);
  const hall = param(params, "hdv");

  return (
    <>
      {/* The key resets the fields when a link changes the URL. */}
      <form action="/" key={catalogueHref(params, {})} className="mt-4">
        <div className="-m-1 flex gap-2 overflow-x-auto p-1 md:flex-wrap">
          {PILLS.map(([name, label, options]) => (
            <Pill
              key={name}
              name={name}
              label={label}
              options={options}
              value={param(params, name)}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex h-[42px] items-center gap-3 rounded-[60px] border border-white/15 bg-field px-5 lg:w-72">
            <Search className="size-4 shrink-0 text-muted" />
            <span className="sr-only">Rechercher un compte</span>
            <input
              type="search"
              name="q"
              defaultValue={param(params, "q")}
              placeholder="Rechercher"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
            />
          </label>
          <nav
            aria-label="Raccourcis par HDV"
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto"
          >
            {TOWN_HALLS.map((h) => (
              <Link
                key={h}
                href={catalogueHref(params, { hdv: hall === h ? "" : h })}
                aria-current={hall === h ? "true" : undefined}
                className="group flex min-h-11 shrink-0 items-center"
              >
                <span className="flex h-6 items-center rounded-full bg-chip px-3 text-chip-text group-aria-[current]:bg-accent group-aria-[current]:text-on-accent">
                  HDV {h}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-muted">
            <strong className="font-semibold text-foreground">{available}</strong> disponible
            {available > 1 && "s"}
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-surface px-4 py-2 font-medium sm:flex">
              <Shield className="size-4 text-accent" />
              Garantie 7 jours
            </span>
            <span className="relative shrink-0">
              <AutoSelect
                name="tri"
                aria-label="Trier par"
                defaultValue={param(params, "tri") || "recommended"}
                className="h-11 appearance-none bg-transparent pr-6 font-semibold"
              >
                {Object.entries(SORTS).map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </AutoSelect>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2" />
            </span>
          </div>
        </div>
        {/* Enter in the search field submits; also the fallback when JavaScript is off. */}
        <button className="sr-only focus:not-sr-only">Appliquer les filtres</button>
      </form>

      {total === 0 ? (
        <div className="mt-4 rounded-3xl bg-surface p-10 text-center">
          <p>Aucun compte ne correspond.</p>
          <Link href="/" className="mt-2 inline-block min-h-11 py-3 font-semibold text-accent">
            Effacer les filtres
          </Link>
        </div>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={catalogueHref(params, { page: String(page - 1) })}
              className="flex min-h-11 items-center rounded-full bg-surface px-5"
            >
              Précédent
            </Link>
          )}
          <span className="text-muted">
            Page {page} sur {pages}
          </span>
          {page < pages && (
            <Link
              href={catalogueHref(params, { page: String(page + 1) })}
              className="flex min-h-11 items-center rounded-full bg-surface px-5"
            >
              Suivant
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
