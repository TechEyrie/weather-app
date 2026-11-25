import { FAVORITES_KEY } from "@/lib/favorites-storage";
import { LOCATION_KEY } from "@/lib/location-storage";
import { SETTINGS_KEY } from "@/lib/settings-storage";

const EXTRA_KEYS = ["aurora-theme", "aurora-geo-prompted"] as const;

export function clearAuroraLocalData(): void {
  try {
    localStorage.removeItem(LOCATION_KEY);
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    for (const key of EXTRA_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    /* private mode */
  }
}