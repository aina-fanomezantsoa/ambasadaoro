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

export const ORDER_STATUS = {
  awaiting_payment: "En attente de paiement",
  to_verify: "Paiement à vérifier",
  paid: "Payée",
  delivered: "Livrée",
  cancelled: "Annulée",
  expired: "Expirée",
} as const;
export const OPERATORS = { mvola: "MVola", orange: "Orange Money" } as const;
export const DISPUTE_STATUS = {
  open: "Litige ouvert",
  refunded: "Remboursé",
  exchanged: "Échangé",
  rejected: "Litige rejeté",
} as const; // BR-32
