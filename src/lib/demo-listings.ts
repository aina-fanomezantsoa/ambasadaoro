// Fictitious listings: used by the catalogue until the database is connected, and by the seed script.
const DAY = 86_400_000;
const STATUSES = ["published", "published", "published", "published", "draft", "sold"] as const;

export const demoListings = (now: Date) =>
  Array.from({ length: 120 }, (_, i) => {
    const townHall = 8 + (i % 10);
    const status = STATUSES[i % STATUSES.length];
    const heroes: Record<string, number> = {
      barbarianKing: townHall * 5,
      archerQueen: townHall * 5 - (i % 5),
    };
    if (townHall >= 11) heroes.grandWarden = (townHall - 10) * 10;
    if (townHall >= 13) heroes.royalChampion = (townHall - 12) * 9;
    return {
      title: `Compte de démonstration HDV ${townHall} n° ${i + 1}`,
      description: "Annonce fictive, ce compte n'existe pas.",
      priceAr: 20_000 + townHall * 15_000 + (i % 7) * 5_000,
      townHall,
      builderHall: 1 + (i % 10),
      trophies: 1_000 + ((i * 137) % 4_500),
      gems: (i * 53) % 2_000,
      xpLevel: 60 + ((i * 7) % 200),
      heroes,
      featured: i % 15 === 0,
      status,
      soldAt: status === "sold" ? new Date(now.getTime() - (i % 12) * DAY) : null,
      views: (i * 31) % 500,
      createdAt: new Date(now.getTime() - i * 3_600_000),
    };
  });
