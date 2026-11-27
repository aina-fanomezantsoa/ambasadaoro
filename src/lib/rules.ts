import { randomInt } from "node:crypto";

export const HEROES = {
  barbarianKing: "Roi des barbares",
  archerQueen: "Reine des archers",
  grandWarden: "Grand gardien",
  royalChampion: "Championne royale",
  minionPrince: "Prince gargouille",
} as const; // BR-05

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

export const isAdminUser = (
  user: { email: string; emailVerified: boolean } | undefined,
  adminEmail: string,
) => !!user?.emailVerified && user.email.toLowerCase() === adminEmail.toLowerCase();
