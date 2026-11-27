// Constants shared with the browser, so they cannot live next to node:crypto.
export const MAX_PHOTOS = 8; // BR-04
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // BR-04
export const PHOTO_FORMATS = ["jpg", "png", "webp"]; // BR-04, as Cloudinary names them
export const HEROES = {
  barbarianKing: "Roi des barbares",
  archerQueen: "Reine des archers",
  grandWarden: "Grand gardien",
  royalChampion: "Championne royale",
  minionPrince: "Prince gargouille",
} as const; // BR-05
