import { describe, expect, it } from "vitest";
import { z } from "zod";
import { action, UserError } from "../src/lib/action";
import { isAdminUser, normalizePhone, normalizeTxId, orderCode } from "../src/lib/rules";

describe("rules", () => {
  it("BR-13: accepts Malagasy mobiles only", () => {
    expect(normalizePhone("+261 34 12 345 67")).toBe("0341234567");
    expect(normalizePhone("032.12.345.67")).toBe("0321234567");
    expect(normalizePhone("0612345678")).toBeNull();
    expect(normalizePhone("034123")).toBeNull();
  });

  it("BR-17: normalizes transaction IDs", () => {
    expect(normalizeTxId(" ab 12cd ")).toBe("AB12CD");
  });

  it("BR-31: order codes are long and differ", () => {
    const codes = new Set(Array.from({ length: 200 }, orderCode));
    expect(codes.size).toBe(200);
    for (const code of codes) expect(code).toMatch(/^[A-HJ-NP-Z2-9]{10}$/);
  });

  it("F13: only the verified admin e-mail passes", () => {
    const admin = "admin@example.com";
    expect(isAdminUser({ email: "Admin@example.com", emailVerified: true }, admin)).toBe(true);
    expect(isAdminUser({ email: admin, emailVerified: false }, admin)).toBe(false);
    expect(isAdminUser({ email: "x@example.com", emailVerified: true }, admin)).toBe(false);
    expect(isAdminUser(undefined, admin)).toBe(false);
  });

  it("action: validates, and hides unexpected errors", async () => {
    const run = action(z.string(), async (value) => {
      if (value === "user") throw new UserError("Déjà réservé.");
      return value;
    });
    expect(await run(1)).toEqual({ ok: false, error: "Champs invalides." });
    expect(await run("user")).toEqual({ ok: false, error: "Déjà réservé." });
    expect(await run("ok")).toEqual({ ok: true, data: "ok" });
  });
});
