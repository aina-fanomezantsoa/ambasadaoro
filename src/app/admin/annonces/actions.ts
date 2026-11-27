"use server";

import { count, eq, max } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/db";
import { isReserved } from "@/db/listings";
import { listingPhotos, listings } from "@/db/schema";
import { action, UserError } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { listingForm } from "@/lib/listing-form";
import {
  cloudinarySignature,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  PHOTO_FORMATS,
  publishErrors,
} from "@/lib/rules";

const cloudinaryApi = (path: string) =>
  `https://api.cloudinary.com/v1_1/${env("CLOUDINARY_CLOUD_NAME")}/${path}`;

const timestamp = () => Math.floor(Date.now() / 1000);

async function findListing(id: string) {
  const [listing] = await db().select().from(listings).where(eq(listings.id, id));
  if (!listing) throw new UserError("Annonce introuvable.");
  return listing;
}

async function photoStats(listingId: string) {
  const [row] = await db()
    .select({ n: count(), last: max(listingPhotos.position) })
    .from(listingPhotos)
    .where(eq(listingPhotos.listingId, listingId));
  return row;
}

async function roomForOne(listingId: string) {
  const stats = await photoStats(listingId);
  if (stats.n >= MAX_PHOTOS) throw new UserError(`${MAX_PHOTOS} photos au maximum.`);
  return stats;
}

async function destroyImage(publicId: string) {
  const params = { public_id: publicId, timestamp: timestamp() };
  const response = await fetch(cloudinaryApi("image/destroy"), {
    method: "POST",
    body: new URLSearchParams({
      public_id: publicId,
      timestamp: String(params.timestamp),
      api_key: env("CLOUDINARY_API_KEY"),
      signature: cloudinarySignature(params, env("CLOUDINARY_API_SECRET")),
    }),
  });
  if (!response.ok) throw new Error(`Cloudinary destroy : ${response.status}`);
}

const save = action(
  z.object({ id: z.uuid().or(z.literal("")), fields: listingForm }),
  async ({ id, fields }) => {
    if (!id) {
      const [created] = await db().insert(listings).values(fields).returning({ id: listings.id });
      redirect(`/admin/annonces/${created.id}`);
    }
    await findListing(id);
    await db().update(listings).set(fields).where(eq(listings.id, id)); // BR-14: orders keep their price
    refresh();
    return "Annonce enregistrée.";
  },
);

export async function saveListing(_state: unknown, form: FormData) {
  await requireAdmin();
  return save({ id: form.get("id"), fields: Object.fromEntries(form) });
}

const byId = z.object({ id: z.uuid() });

const publish = action(byId, async ({ id }) => {
  const listing = await findListing(id);
  if (listing.status === "sold") throw new UserError("Un compte vendu ne peut pas être republié.");
  const missing = publishErrors(listing, (await photoStats(id)).n);
  if (missing.length) throw new UserError(`Il manque ${missing.join(", ")}.`);
  await db().update(listings).set({ status: "published" }).where(eq(listings.id, id));
  refresh();
  return "Annonce publiée.";
});

export async function publishListing(_state: unknown, form: FormData) {
  await requireAdmin();
  return publish(Object.fromEntries(form));
}

const withdraw = action(byId, async ({ id }) => {
  const listing = await findListing(id);
  if (listing.status === "sold") throw new UserError("Un compte vendu ne peut pas être retiré.");
  if (await isReserved(db(), id, new Date())) {
    throw new UserError("Une commande est en cours sur ce compte : annulez-la d'abord.");
  }
  await db().update(listings).set({ status: "withdrawn" }).where(eq(listings.id, id));
  refresh();
  return "Annonce retirée.";
});

export async function withdrawListing(_state: unknown, form: FormData) {
  await requireAdmin();
  return withdraw(Object.fromEntries(form));
}

const sign = action(byId, async ({ id }) => {
  await findListing(id);
  await roomForOne(id);
  const params = {
    allowed_formats: PHOTO_FORMATS.join(","),
    public_id: `ambasadaoro/${id}/${randomUUID()}`, // chosen here, checked again in addPhoto
    timestamp: timestamp(),
  };
  return {
    url: cloudinaryApi("image/upload"),
    fields: {
      ...params,
      api_key: env("CLOUDINARY_API_KEY"),
      signature: cloudinarySignature(params, env("CLOUDINARY_API_SECRET")),
    },
  };
});

export async function signUpload(input: unknown) {
  await requireAdmin();
  return sign(input);
}

const add = action(
  z.object({ id: z.uuid(), publicId: z.string().regex(/^ambasadaoro\/[0-9a-f-]+\/[0-9a-f-]+$/) }),
  async ({ id, publicId }) => {
    if (!publicId.startsWith(`ambasadaoro/${id}/`)) throw new UserError("Photo refusée.");
    await findListing(id);
    // The browser cannot be trusted about size or format: ask Cloudinary what it received.
    const credentials = `${env("CLOUDINARY_API_KEY")}:${env("CLOUDINARY_API_SECRET")}`;
    const response = await fetch(cloudinaryApi(`resources/image/upload/${publicId}`), {
      headers: { authorization: `Basic ${Buffer.from(credentials).toString("base64")}` },
      cache: "no-store",
    });
    if (!response.ok) throw new UserError("Photo introuvable chez l'hébergeur d'images.");
    const image = z.object({ bytes: z.number(), format: z.string() }).parse(await response.json());
    if (image.bytes > MAX_PHOTO_BYTES || !PHOTO_FORMATS.includes(image.format)) {
      await destroyImage(publicId);
      throw new UserError("Photo refusée : JPEG, PNG ou WebP de 5 Mo au maximum.");
    }
    const { last } = await roomForOne(id);
    await db()
      .insert(listingPhotos)
      .values({ listingId: id, publicId, position: (last ?? -1) + 1 });
    refresh();
    return null;
  },
);

export async function addPhoto(input: unknown) {
  await requireAdmin();
  return add(input);
}

const remove = action(byId, async ({ id }) => {
  const [photo] = await db().select().from(listingPhotos).where(eq(listingPhotos.id, id));
  if (!photo) throw new UserError("Photo introuvable.");
  const listing = await findListing(photo.listingId);
  if (listing.status === "published" && (await photoStats(listing.id)).n === 1) {
    throw new UserError("Une annonce publiée garde au moins 1 photo : retirez-la d'abord."); // BR-02
  }
  await destroyImage(photo.publicId);
  await db().delete(listingPhotos).where(eq(listingPhotos.id, id));
  refresh();
  return "Photo supprimée.";
});

export async function deletePhoto(_state: unknown, form: FormData) {
  await requireAdmin();
  return remove(Object.fromEntries(form));
}
