import type { AuroraSettings } from "@/lib/settings-storage";

export function celsiusToDisplay(c: number, unit: AuroraSettings["tempUnit"]): number {
  if (unit === "F") return Math.round((c * 9) / 5 + 32);
  return Math.round(c);
}

export function mphToDisplay(mph: number, unit: AuroraSettings["windUnit"]): number {
  if (unit === "kmh") return Math.round(mph * 1.60934);
  return Math.round(mph);
}

export function formatTemp(c: number, unit: AuroraSettings["tempUnit"]): string {
  return `${celsiusToDisplay(c, unit)}°${unit}`;
}

export function formatWindSpeed(
  mph: number,
  unit: AuroraSettings["windUnit"]
): string {
  const v = mphToDisplay(mph, unit);
  return unit === "kmh" ? `${v} km/h` : `${v} mph`;
}