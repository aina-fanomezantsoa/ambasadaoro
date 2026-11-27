import { photoUrl } from "@/lib/cloudinary";

/** Cloudinary already resizes and compresses, so no second image pipeline. */
export function Photo({
  publicId,
  alt,
  width,
  height,
  className,
}: {
  publicId: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(publicId, width, height)}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className={className}
    />
  );
}
