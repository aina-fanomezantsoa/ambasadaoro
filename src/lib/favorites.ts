// F09: favourite listing ids, kept in the browser only.
const KEY = "favoris";
const CHANGED = "favoris";
const UUID = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;

export function favoritesText() {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]"; // storage blocked
  }
}

/** Anything that is not a list of listing ids is ignored. */
export function parseFavorites(text: string): string[] {
  try {
    const list: unknown = JSON.parse(text);
    return Array.isArray(list) ? list.filter((id) => typeof id === "string" && UUID.test(id)) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(id: string) {
  const ids = parseFavorites(favoritesText());
  const next = ids.includes(id) ? ids.filter((other) => other !== id) : [id, ...ids].slice(0, 50);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return; // storage blocked: the heart stays empty
  }
  window.dispatchEvent(new Event(CHANGED));
}

/** For useSyncExternalStore: "storage" covers other tabs, the custom event this one. */
export function subscribeFavorites(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}
