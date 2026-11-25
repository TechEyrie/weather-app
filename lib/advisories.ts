import type { DashboardWeather, DailyForecast } from "@/lib/open-meteo";
import { weatherCodeToLabel } from "@/lib/weather-code";

export type AdvisoryLevel = "severe" | "watch" | "advisory" | "info";

export type Advisory = {
  id: string;
  level: AdvisoryLevel;
  title: string;
  detail: string;
  when: string;
};

const THUNDER = (code: number) => code >= 95 && code <= 99;
const HEAVY_RAIN = (code: number) =>
  code >= 61 && code <= 67;
const RAIN_SHOWERS = (code: number) => code >= 80 && code <= 82;
const SNOW = (code: number) =>
  (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
const FOG = (code: number) => code === 45 || code === 48;

function push(
  list: Advisory[],
  item: Omit<Advisory, "id"> & { id?: string }
): void {
  const id = item.id ?? `${item.level}-${item.title}-${item.when}`;
  if (list.some((a) => a.id === id)) return;
  list.push({ ...item, id });
}

export function advisoriesFromForecast(
  forecast: DashboardWeather
): Advisory[] {
  const list: Advisory[] = [];
  const { current, daily } = forecast;

  if (THUNDER(current.weatherCode)) {
    push(list, {
      level: "severe",
      title: "Thunderstorm conditions",
      detail:
        "Lightning and heavy rain possible near your location. Seek shelter if storms approach.",
      when: "Now",
    });
  } else if (HEAVY_RAIN(current.weatherCode) || RAIN_SHOWERS(current.weatherCode)) {
    push(list, {
      level: "watch",
      title: "Rain likely",
      detail: `${weatherCodeToLabel(current.weatherCode)} with ${current.precipProbability}% precipitation chance.`,
      when: "Now",
    });
  }

  if (current.precipProbability >= 80 && !THUNDER(current.weatherCode)) {
    push(list, {
      level: "advisory",
      title: "High precipitation chance",
      detail: `About ${current.precipProbability}% chance of precipitation in the next hour.`,
      when: "Now",
    });
  }

  if (current.windSpeed >= 28 || current.windGusts >= 40) {
    push(list, {
      level: "watch",
      title: "Strong wind",
      detail: `Sustained ${current.windSpeed} mph, gusts to ${current.windGusts} mph (app reading).`,
      when: "Now",
    });
  }

  if (FOG(current.weatherCode)) {
    push(list, {
      level: "advisory",
      title: "Low visibility",
      detail: "Fog or depositing rime fog — use caution when driving.",
      when: "Now",
    });
  }

  if (SNOW(current.weatherCode)) {
    push(list, {
      level: "advisory",
      title: "Wintry conditions",
      detail: weatherCodeToLabel(current.weatherCode),
      when: "Now",
    });
  }

  for (const day of daily.slice(0, 7)) {
    scanDay(list, day);
  }

  if (!list.length) {
    push(list, {
      level: "info",
      title: "No elevated risks",
      detail: "Conditions look routine. These are app estimates, not official warnings.",
      when: "Today",
    });
  }

  return list.sort(
    (a, b) => levelRank(a.level) - levelRank(b.level)
  );
}

function scanDay(list: Advisory[], day: DailyForecast): void {
  const when = day.dayName;
  const code = day.weatherCode;

  if (THUNDER(code)) {
    push(list, {
      level: "severe",
      title: "Thunderstorm possible",
      detail: `${when}: thunderstorms in the forecast.`,
      when,
    });
    return;
  }
  if (SNOW(code)) {
    push(list, {
      level: "advisory",
      title: "Snow in forecast",
      detail: `${when}: ${weatherCodeToLabel(code)}, highs near ${day.tempMax}°C.`,
      when,
    });
  }
  if (HEAVY_RAIN(code) || RAIN_SHOWERS(code)) {
    push(list, {
      level: "advisory",
      title: "Rainy day ahead",
      detail: `${when}: ${weatherCodeToLabel(code)}.`,
      when,
    });
  }
}

function levelRank(level: AdvisoryLevel): number {
  switch (level) {
    case "severe":
      return 0;
    case "watch":
      return 1;
    case "advisory":
      return 2;
    default:
      return 3;
  }
}

// ponytail: rule-based only; upgrade path = national CAP / MeteoAlarm API proxy