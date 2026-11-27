import { env } from "./env";

/** A resized, compressed delivery URL: slow mobile networks are the norm. */
export const photoUrl = (publicId: string, width: number, height: number) =>
  `https://res.cloudinary.com/${env("CLOUDINARY_CLOUD_NAME")}/image/upload/f_auto,q_auto,c_fill,w_${width},h_${height}/${publicId}`;
