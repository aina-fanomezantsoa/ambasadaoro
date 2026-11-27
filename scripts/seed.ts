// Demo listings. Refuses to touch a database that already has listings.
import { drizzle } from "drizzle-orm/node-postgres";
import { listings } from "../src/db/schema.ts";
import { demoListings } from "../src/lib/demo-listings.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manquante (voir .env.example)");
const db = drizzle(process.env.DATABASE_URL);

if ((await db.$count(listings)) > 0) {
  console.log("La base contient déjà des annonces : rien n'a été ajouté.");
} else {
  await db.insert(listings).values(demoListings(new Date()));
  console.log("120 annonces de démonstration ajoutées.");
}
await db.$client.end();
