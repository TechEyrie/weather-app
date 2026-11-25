import type { GeoLocation } from "@/lib/open-meteo";

export const FAVORITES_KEY = "aurora-favorites";

export function readFavorites(): GeoLocation[] {
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
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    /* quota / private mode */
  }
}

function samePlace(a: GeoLocation, b: GeoLocation): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < 0.02 &&
    Math.abs(a.longitude - b.longitude) < 0.02
  );
}

export function addFavorite(location: GeoLocation): GeoLocation[] {
  const favorites = readFavorites();
  if (
    favorites.some((f) => f.id === location.id || samePlace(f, location))
  ) {
    return favorites;
  }
  const next = [...favorites, location];
  writeFavorites(next);
  return next;
}

export function moveFavorite(
  id: number,
  direction: "up" | "down"
): GeoLocation[] {
  const favorites = readFavorites();
  const i = favorites.findIndex((f) => f.id === id);
  if (i < 0) return favorites;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= favorites.length) return favorites;
  const next = [...favorites];
  [next[i], next[j]] = [next[j], next[i]];
  writeFavorites(next);
  return next;
}

export function removeFavorite(id: number): GeoLocation[] {
  const next = readFavorites().filter((f) => f.id !== id);
  writeFavorites(next);
  return next;
}