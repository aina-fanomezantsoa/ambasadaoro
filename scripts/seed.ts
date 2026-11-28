// Demo listings. Never adds listings to a database that already has some.
// `npm run db:seed -- <dossier>` also gives the demo listings that have no photo the images of that folder.
import { and, eq, notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { listingPhotos, listings } from "../src/db/schema.ts";
import { demoListings } from "../src/lib/demo-listings.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manquante (voir .env.example)");
const db = drizzle(process.env.DATABASE_URL);

if ((await db.$count(listings)) > 0) {
  console.log("La base contient déjà des annonces : aucune annonce ajoutée.");
} else {
  await db.insert(listings).values(demoListings(new Date()));
  console.log("120 annonces de démonstration ajoutées.");
}

async function upload(file: string, publicId: string) {
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key } = process.env;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) throw new Error("Clés CLOUDINARY_* manquantes");
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHash("sha256")
    .update(`public_id=${publicId}&timestamp=${timestamp}${secret}`)
    .digest("hex");
  const body = new FormData();
  body.set("file", new Blob([await readFile(file)]));
  for (const [name, value] of Object.entries({ public_id: publicId, timestamp, signature }))
    body.set(name, value);
  body.set("api_key", key);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body,
  });
  if (!response.ok) throw new Error(`Cloudinary : ${response.status} ${await response.text()}`);
  return publicId;
}

const folder = process.argv[2];
if (folder) {
  const bare = await db
    .select({ id: listings.id })
    .from(listings)
    .where(
      and(
        eq(listings.description, demoListings(new Date())[0].description), // never a real listing
        notInArray(listings.id, db.select({ id: listingPhotos.listingId }).from(listingPhotos)),
      ),
    );
  const files = (await readdir(folder)).filter((name) => /\.(jpe?g|png|webp)$/i.test(name)).sort();
  if (!files.length) throw new Error(`Aucune image dans ${folder}`);
  if (bare.length) {
    // shortcut: demo listings share these assets, so deleting one photo in the admin removes the
    // image from all of them; upload one copy per listing if the demo ever needs to survive that.
    const ids: string[] = [];
    for (const [i, name] of files.entries())
      ids.push(await upload(join(folder, name), `ambasadaoro/demo/${i + 1}`));
    await db.insert(listingPhotos).values(
      bare.flatMap(({ id }, n) =>
        ids.map((_, position) => ({
          listingId: id,
          publicId: ids[(n + position) % ids.length], // the cover changes from card to card
          position,
        })),
      ),
    );
  }
  console.log(`Photos ajoutées à ${bare.length} annonces de démonstration.`);
}
await db.$client.end();
