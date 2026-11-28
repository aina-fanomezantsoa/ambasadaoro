import { HEROES } from "./limits.ts";

/** A WhatsApp chat link with the shop, optionally prefilled; null while no number is set. */
export function whatsappHref(message?: string) {
  // wa.me needs the international form: a local 03… number would open the wrong chat.
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "").replace(
    /^(00261|0)/,
    "261",
  );
  if (!number) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

const number = new Intl.NumberFormat("fr-FR");
const optional = (value: number | null) => (value === null ? null : number.format(value));

type Account = {
  title: string;
  priceAr: number;
  townHall: number;
  builderHall: number | null;
  trophies: number | null;
  league: string | null;
  gems: number | null;
  xpLevel: number | null;
  heroes: Record<string, number>;
  skins: string | null;
  decorations: string | null;
};

/** F04: the characteristics shown on the listing page, empty ones left out. */
export const accountDetails = (a: Account) =>
  [
    ["Niveau HDV", String(a.townHall)],
    ["Maison des ouvriers", optional(a.builderHall)],
    ["Trophées", optional(a.trophies)],
    ["Ligue", a.league],
    ["Gemmes", optional(a.gems)],
    ["Niveau XP", optional(a.xpLevel)],
    ...Object.entries(HEROES).map(([key, label]) => [
      label,
      a.heroes[key] ? `niveau ${a.heroes[key]}` : "non débloqué",
    ]),
  ].filter((row): row is [string, string] => !!row[1]);

/** F10: the draft the buyer finds in WhatsApp. */
export const accountMessage = (a: Account, url: string) =>
  [
    "Bonjour, je suis intéressé par ce compte :",
    a.title,
    `Prix : ${number.format(a.priceAr)} Ar`,
    "",
    ...accountDetails(a).map(([label, value]) => `${label} : ${value}`),
    ...(a.skins ? [`Skins : ${a.skins}`] : []),
    ...(a.decorations ? [`Décors : ${a.decorations}`] : []),
    "",
    url,
  ].join("\n");
