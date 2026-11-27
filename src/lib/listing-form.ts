import { z } from "zod";
import { HEROES } from "./limits.ts";

const int = (min: number, max: number) => z.coerce.number().int().min(min).max(max);
/** An empty field means "not given", not zero. */
const optionalInt = (max: number) =>
  z.preprocess((v) => (v === "" ? null : v), int(0, max).nullable());
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

type Hero = keyof typeof HEROES;
const heroFields = Object.fromEntries(
  Object.keys(HEROES).map((key) => [key, optionalInt(200)]),
) as Record<Hero, ReturnType<typeof optionalInt>>;

/** The admin listing form: one flat field per input, heroes included. */
export const listingForm = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(4000),
    priceAr: int(1000, 100_000_000), // BR-03
    townHall: int(1, 18),
    builderHall: optionalInt(10),
    trophies: optionalInt(100_000),
    league: optionalText(60),
    gems: optionalInt(10_000_000),
    xpLevel: optionalInt(1000),
    skins: optionalText(1000),
    decorations: optionalText(1000),
    featured: z
      .literal("on")
      .optional()
      .transform((v) => v === "on"),
    ...heroFields,
  })
  .transform(
    ({ barbarianKing, archerQueen, grandWarden, royalChampion, minionPrince, ...rest }) => {
      const levels = { barbarianKing, archerQueen, grandWarden, royalChampion, minionPrince };
      // BR-05: an empty level means the hero is not unlocked.
      const heroes: Record<string, number> = {};
      for (const [key, level] of Object.entries(levels)) if (level) heroes[key] = level;
      return { ...rest, heroes };
    },
  );
