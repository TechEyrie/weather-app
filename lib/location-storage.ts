import { DEFAULT_LOCATION, type GeoLocation } from "@/lib/open-meteo";

export const LOCATION_KEY = "aurora-active-location";

export function saveActiveLocation(loc: GeoLocation): void {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
  } catch {
    /* quota / private mode */
  }
}

export function readActiveLocation(): GeoLocation {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return DEFAULT_LOCATION;
    const parsed = JSON.parse(raw) as GeoLocation;
    if (
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCATION;
}