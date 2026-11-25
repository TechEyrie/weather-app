export type AuroraSettings = {
  tempUnit: "C" | "F";
  windUnit: "mph" | "kmh";
};

export const SETTINGS_KEY = "aurora-settings";

export const DEFAULT_SETTINGS: AuroraSettings = {
  tempUnit: "C",
  windUnit: "mph",
};

function storageAvailable(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readSettings(): AuroraSettings {
  if (!storageAvailable()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AuroraSettings>;
    return {
      tempUnit: parsed.tempUnit === "F" ? "F" : "C",
      windUnit: parsed.windUnit === "kmh" ? "kmh" : "mph",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: AuroraSettings): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* quota / private mode */
  }
}