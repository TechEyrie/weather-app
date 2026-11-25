import type { GeoLocation } from "@/lib/open-meteo";

const SLOT_KEYS = ["a", "b", "c"] as const;

export function geoFromCoords(lat: number, lon: number): GeoLocation {
  return {
    id: 0,
    name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    country: "",
    latitude: lat,
    longitude: lon,
  };
}

export function parseCompareSlots(
  params: URLSearchParams
): (GeoLocation | null)[] {
  return SLOT_KEYS.map((key) => {
    const raw = params.get(key);
    if (!raw) return null;
    const parts = raw.split(",").map((p) => Number.parseFloat(p.trim()));
    if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
    return geoFromCoords(parts[0], parts[1]);
  });
}

export function buildCompareSearchParams(
  slots: (GeoLocation | null)[]
): URLSearchParams {
  const params = new URLSearchParams();
  slots.forEach((loc, i) => {
    if (!loc) return;
    const key = SLOT_KEYS[i];
    if (!key) return;
    params.set(key, `${loc.latitude},${loc.longitude}`);
  });
  return params;
}