import { DEFAULT_LOCATION, type GeoLocation } from "@/lib/open-meteo";

export const LOCATION_KEY = "aurora-active-location";

function storageAvailable(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function saveActiveLocation(loc: GeoLocation): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
  } catch {
    /* quota / private mode */
  }
}

export function readActiveLocation(): GeoLocation {
  if (!storageAvailable()) return DEFAULT_LOCATION;
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