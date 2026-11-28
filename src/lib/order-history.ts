// F08: the orders placed from this device, kept in the browser only.
export type PastOrder = { code: string; phone: string; title: string };

const KEY = "commandes";

/** The stored text, stable between reads, as useSyncExternalStore needs. */
export function historyText() {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]"; // storage blocked
  }
}

export function parseHistory(text: string): PastOrder[] {
  try {
    const list: unknown = JSON.parse(text);
    return Array.isArray(list) ? list.filter((o) => o?.code && o?.phone) : [];
  } catch {
    return [];
  }
}
