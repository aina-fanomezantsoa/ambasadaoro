// Demo listings. Refuses to touch a database that already has listings.
import { drizzle } from "drizzle-orm/node-postgres";
import { listings } from "../src/db/schema.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manquante (voir .env.example)");
const db = drizzle(process.env.DATABASE_URL);

if ((await db.$count(listings)) > 0) {
  console.log("La base contient déjà des annonces : rien n'a été ajouté.");
} else {
  const statuses = ["published", "published", "published", "published", "draft", "sold"] as const;
  await db.insert(listings).values(
    Array.from({ length: 120 }, (_, i) => {
      const townHall = 8 + (i % 10);
      const status = statuses[i % statuses.length];
      return {
        title: `Compte de démonstration HDV ${townHall} n° ${i + 1}`,
        description: "Annonce fictive créée par le script de données de test.",
        priceAr: 20_000 + townHall * 15_000 + (i % 7) * 5_000,
        townHall,
        builderHall: 1 + (i % 10),
        trophies: 1_000 + ((i * 137) % 4_500),
        gems: (i * 53) % 2_000,
        xpLevel: 60 + ((i * 7) % 200),
        heroes: { barbarianKing: townHall * 5, archerQueen: townHall * 5 },
        featured: i % 15 === 0,
        status,
        soldAt: status === "sold" ? new Date() : null,
        views: (i * 31) % 500,
      };
    }),
  );
  console.log("120 annonces de démonstration ajoutées.");
}
await db.$client.end();
