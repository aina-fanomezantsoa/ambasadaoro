import { afterEach, describe, expect, it, vi } from "vitest";
import { parseFavorites } from "../src/lib/favorites";
import { whatsappHref } from "../src/lib/whatsapp";

afterEach(() => vi.unstubAllEnvs());

describe("favorites and WhatsApp", () => {
  it("F09: keeps only listing ids from what the device stored", () => {
    const id = "0b9c3c1e-1111-4222-8333-444455556666";
    expect(parseFavorites(JSON.stringify([id, "x,y", 3, null]))).toEqual([id]);
    expect(parseFavorites("{oops")).toEqual([]);
    expect(parseFavorites('{"a":1}')).toEqual([]);
  });

  it("F10: prefills the message, and shows nothing without a number", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+261 34 00 000 00");
    expect(whatsappHref("A & B")).toBe("https://wa.me/261340000000?text=A%20%26%20B");
    for (const other of ["034 00 000 00", "00261340000000"]) {
      vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", other);
      expect(whatsappHref()).toBe("https://wa.me/261340000000");
    }
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    expect(whatsappHref("x")).toBeNull();
  });
});
