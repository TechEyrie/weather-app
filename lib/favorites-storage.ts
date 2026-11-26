import type { GeoLocation } from "@/lib/open-meteo";

export const FAVORITES_KEY = "aurora-favorites";

function storageAvailable(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readFavorites(): GeoLocation[] {
  if (!storageAvailable()) return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GeoLocation[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (loc) =>
        typeof loc.latitude === "number" && typeof loc.longitude === "number"
    );
  } catch {
    return [];
  }
}

export function writeFavorites(favorites: GeoLocation[]): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    /* quota / private mode */
  }
}

export function samePlace(a: GeoLocation, b: GeoLocation): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < 0.02 &&
    Math.abs(a.longitude - b.longitude) < 0.02
  );
}

export function addFavoriteToList(
  favorites: GeoLocation[],
  location: GeoLocation
): GeoLocation[] {
  if (favorites.some((f) => f.id === location.id || samePlace(f, location))) {
    return favorites;
  }
  return [...favorites, location];
}

export function moveFavoriteInList(
  favorites: GeoLocation[],
  id: number,
  direction: "up" | "down"
): GeoLocation[] {
  const i = favorites.findIndex((f) => f.id === id);
  if (i < 0) return favorites;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= favorites.length) return favorites;
  const next = [...favorites];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function removeFavoriteFromList(
  favorites: GeoLocation[],
  id: number
): GeoLocation[] {
  return favorites.filter((f) => f.id !== id);
}

/** Guest path: read → mutate → persist locally. */
export function addFavorite(location: GeoLocation): GeoLocation[] {
  const next = addFavoriteToList(readFavorites(), location);
  writeFavorites(next);
  return next;
}

export function moveFavorite(
  id: number,
  direction: "up" | "down"
): GeoLocation[] {
  const next = moveFavoriteInList(readFavorites(), id, direction);
  writeFavorites(next);
  return next;
}

export function removeFavorite(id: number): GeoLocation[] {
  const next = removeFavoriteFromList(readFavorites(), id);
  writeFavorites(next);
  return next;
}