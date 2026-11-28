import { connection } from "next/server";
import { db } from "@/db";
import { heroImage } from "@/db/settings";
import { photoUrl } from "@/lib/cloudinary";

/** F18: decoration behind the title and filters; its failure must not take the catalogue down. */
export async function HeroImage() {
  await connection();
  const publicId = await heroImage(db()).catch((error) => {
    console.error(error);
    return null;
  });
  if (!publicId) return null;
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-72 lg:h-96">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl(publicId, 1600, 500)}
        srcSet={`${photoUrl(publicId, 800, 500)} 800w, ${photoUrl(publicId, 1600, 500)} 1600w`}
        sizes="100vw"
        alt=""
        className="size-full object-cover"
      />
      {/* Darkened so the title and filters stay readable on any picture. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
    </div>
  );
}
