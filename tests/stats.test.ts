import { describe, expect, it } from "vitest";
import { monthlyStats } from "../src/lib/rules";

const sale = (deliveredAt: string, priceAr: number, dispute: string | null = null) => ({
  deliveredAt: new Date(deliveredAt),
  priceAr,
  dispute,
});

describe("statistics", () => {
  it("BR-43, BR-44: revenue without refunds, rate without rejected disputes, per month", () => {
    expect(
      monthlyStats([
        sale("2026-11-10T10:00:00Z", 100_000),
        sale("2026-11-11T10:00:00Z", 200_000, "refunded"),
        sale("2026-11-12T10:00:00Z", 50_000, "exchanged"),
        sale("2026-11-13T10:00:00Z", 10_000, "rejected"),
        // 22:00 UTC on 30 November is already 1 December in Antananarivo.
        sale("2026-11-30T22:00:00Z", 70_000, "open"),
      ]),
    ).toEqual([
      { month: "2026-12", sales: 1, revenueAr: 70_000, disputeRate: 1 },
      { month: "2026-11", sales: 4, revenueAr: 160_000, disputeRate: 0.5 },
    ]);
    expect(monthlyStats([])).toEqual([]);
  });
});
