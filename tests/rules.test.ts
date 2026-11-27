import { describe, expect, it } from "vitest";
import { z } from "zod";
import { action, UserError } from "../src/lib/action";
import {
  createSession,
  hashPassword,
  isValidSession,
  normalizePhone,
  normalizeTxId,
  orderCode,
  SESSION_SECONDS,
  verifyPassword,
} from "../src/lib/rules";

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

  it("F13: only the right password matches its hash", () => {
    const stored = hashPassword("correct horse");
    expect(verifyPassword("correct horse", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
    expect(verifyPassword("correct horse", "")).toBe(false);
  });

  it("F13: a session expires and cannot be forged", () => {
    const cookie = createSession("key", 0);
    expect(isValidSession(cookie, "key", 1)).toBe(true);
    expect(isValidSession(cookie, "other key", 1)).toBe(false);
    expect(isValidSession(cookie, "key", SESSION_SECONDS * 1000)).toBe(false);
    expect(isValidSession(`9${cookie}`, "key", 1)).toBe(false);
    expect(isValidSession(undefined, "key", 1)).toBe(false);
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
