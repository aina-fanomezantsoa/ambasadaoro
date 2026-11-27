import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { HEROES, MAX_PHOTO_BYTES, MAX_PHOTOS, PHOTO_FORMATS } from "./limits.ts";

export { HEROES, MAX_PHOTO_BYTES, MAX_PHOTOS, PHOTO_FORMATS };

/** BR-13: returns 0XXXXXXXXX, or null when it is not a Malagasy mobile number. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s.()-]/g, "").replace(/^(\+|00)261/, "0");
  return /^03\d{8}$/.test(digits) ? digits : null;
}

/** BR-17: spaces and case never make a transaction ID "new". */
export const normalizeTxId = (input: string) => input.replace(/\s/g, "").toUpperCase();

// No 0/O or 1/I: buyers retype this code by hand.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** BR-31 */
export const orderCode = () =>
  Array.from({ length: 10 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");

const sameBytes = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

/** F13: "salt:hash" in hex; no "$", which .env files would expand. */
export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

export const verifyPassword = (password: string, stored: string) =>
  sameBytes(Buffer.from(hashPassword(password, stored.split(":")[0])), Buffer.from(stored));

export const SESSION_SECONDS = 7 * 86_400;

const sign = (value: string, key: string) =>
  createHmac("sha256", key).update(value).digest("base64url");

/** The admin session cookie: its expiry time and a signature of it. */
export function createSession(key: string, now = Date.now()) {
  const expires = String(now + SESSION_SECONDS * 1000);
  return `${expires}.${sign(expires, key)}`;
}

export function isValidSession(cookie: string | undefined, key: string, now = Date.now()) {
  const [expires, signature] = cookie?.split(".") ?? [];
  if (!signature || !(Number(expires) > now)) return false;
  return sameBytes(Buffer.from(signature), Buffer.from(sign(expires, key)));
}

/** BR-02: what still blocks publication, in French; empty when the listing can be published. */
export function publishErrors(
  listing: { title: string; priceAr: number; townHall: number },
  photos: number,
) {
  return [
    !listing.title.trim() && "un titre",
    !listing.priceAr && "un prix",
    !listing.townHall && "le niveau HDV",
    !photos && "au moins 1 photo",
  ].filter((missing) => missing !== false);
}

/** Cloudinary request signature: SHA-256 (accepted like SHA-1) of the sorted parameters followed by the API secret. */
export function cloudinarySignature(params: Record<string, string | number>, secret: string) {
  const text = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha256")
    .update(text + secret)
    .digest("hex");
}
