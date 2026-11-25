import type { DashboardWeather } from "@/lib/open-meteo";
import { celsiusToDisplay, formatWindSpeed } from "@/lib/format-units";
import type { AuroraSettings } from "@/lib/settings-storage";
import { weatherCodeToLabel } from "@/lib/weather-code";

export function buildWeeklyReportText(
  forecast: DashboardWeather,
  settings: AuroraSettings
): string {
  const { location, daily, current } = forecast;
  const lines: string[] = [
    `Aurora Weather — 7-day outlook`,
    `${location.name}${location.country ? `, ${location.country}` : ""}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `Now: ${celsiusToDisplay(current.temperature, settings.tempUnit)}°${settings.tempUnit} · ${weatherCodeToLabel(current.weatherCode)}`,
    `Wind ${formatWindSpeed(current.windSpeed, settings.windUnit)} · Precip chance ${current.precipProbability}%`,
    "",
    "Daily forecast:",
  ];

  for (const day of daily) {
    const hi = celsiusToDisplay(day.tempMax, settings.tempUnit);
    const lo = celsiusToDisplay(day.tempMin, settings.tempUnit);
    lines.push(
      `  ${day.dayName} (${day.date}): ${hi}° / ${lo}° · ${weatherCodeToLabel(day.weatherCode)}`
    );
  }

  lines.push("", "Data: Open-Meteo · App estimate, not official.");
  return lines.join("\n");
}