import {
  celsiusToDisplay,
  formatTemp,
  formatWindSpeed,
} from "@/lib/format-units";
import type { AuroraSettings } from "@/lib/settings-storage";

export type GeoLocation = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

export type DailyForecast = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  dayName: string;
};

export type HourlyForecast = {
  time: string;
  temperature: number;
  weatherCode: number;
};

export type DashboardWeather = {
  timezone: string;
  location: GeoLocation;
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    windGusts: number;
    precipProbability: number;
  };
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  hourlyByDay: HourlyDayGroup[];
};

export const DEFAULT_LOCATION: GeoLocation = {
  id: 0,
  name: "Central Jakarta",
  country: "Indonesia",
  admin1: "Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
};

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

const FORECAST_PARAMS = new URLSearchParams({
  current:
    "temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,precipitation_probability",
  hourly: "temperature_2m,weather_code",
  daily: "weather_code,temperature_2m_max,temperature_2m_min",
  forecast_days: "7",
  timezone: "auto",
  wind_speed_unit: "mph",
});

type GeocodeResponse = {
  results?: Array<{
    id: number;
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
};

type ForecastResponse = {
  timezone: string;
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    precipitation_probability: number;
  };
};

const NEARBY_DEG = 2;

function formatDayName(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function todayInTimezone(timezone: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
}

function currentHourSlot(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const y = get("year");
  const m = get("month");
  const d = get("day");
  let h = get("hour");
  if (h === "24") h = "00";
  return `${y}-${m}-${d}T${h}:00`;
}

function parseTodayHourly(
  data: NonNullable<ForecastResponse["hourly"]>,
  timezone: string
): HourlyForecast[] {
  const today = todayInTimezone(timezone);
  const nowSlot = currentHourSlot(timezone);
  const rows: HourlyForecast[] = [];

  const pushSlot = (i: number) => {
    const t = data.time[i];
    if (!t?.startsWith(today)) return;
    rows.push({
      time: t,
      temperature: Math.round(data.temperature_2m[i] ?? 0),
      weatherCode: data.weather_code[i] ?? 0,
    });
  };

  for (let i = 0; i < data.time.length; i++) {
    const t = data.time[i];
    if (!t.startsWith(today)) continue;
    if (t < nowSlot) continue;
    pushSlot(i);
    if (rows.length >= 24) break;
  }

  if (!rows.length) {
    for (let i = 0; i < data.time.length; i++) {
      pushSlot(i);
      if (rows.length >= 24) break;
    }
  }

  return rows;
}

export type HourlyDayGroup = {
  date: string;
  dayName: string;
  hours: HourlyForecast[];
};

export function groupHourlyByDay(
  data: NonNullable<ForecastResponse["hourly"]>,
  timezone?: string
): HourlyDayGroup[] {
  const map = new Map<string, HourlyForecast[]>();
  for (let i = 0; i < data.time.length; i++) {
    const t = data.time[i];
    if (!t) continue;
    const date = t.slice(0, 10);
    const list = map.get(date) ?? [];
    list.push({
      time: t,
      temperature: Math.round(data.temperature_2m[i] ?? 0),
      weatherCode: data.weather_code[i] ?? 0,
    });
    map.set(date, list);
  }
  const today = timezone ? todayInTimezone(timezone) : null;
  const nowSlot = timezone ? currentHourSlot(timezone) : null;

  return [...map.entries()].slice(0, 3).map(([date, hours]) => {
    const trimmed =
      today && nowSlot && date === today
        ? hours.filter((h) => h.time >= nowSlot)
        : hours;
    return {
      date,
      dayName: formatDayName(date),
      hours: trimmed,
    };
  });
}

async function enrichLocationFromCoords(
  loc: GeoLocation
): Promise<GeoLocation> {
  if (
    (loc.admin1?.trim().length ?? 0) >= 2 ||
    (loc.country?.trim().length ?? 0) >= 2
  ) {
    return loc;
  }
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": "TechEyrieWeatherPortfolio/0.1" },
    });
    if (!res.ok) return loc;
    const data = (await res.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
      };
    };
    const addr = data.address;
    if (!addr) return loc;
    return {
      ...loc,
      name:
        addr.city ?? addr.town ?? addr.village ?? loc.name,
      country: addr.country ?? loc.country,
      admin1: addr.state ?? loc.admin1,
    };
  } catch {
    return loc;
  }
}

export async function fetchNearbyLocations(
  center: GeoLocation,
  limit = 3
): Promise<GeoLocation[]> {
  const enriched = await enrichLocationFromCoords(center);
  const query =
    (enriched.admin1?.trim() || enriched.country?.trim()) ?? "";
  if (query.length < 2) return [];

  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=20&language=en`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as GeocodeResponse;
  const results =
    data.results?.map((r) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
    })) ?? [];
  return results
    .filter((r) => {
      const samePlace =
        Math.abs(r.latitude - enriched.latitude) < 0.05 &&
        Math.abs(r.longitude - enriched.longitude) < 0.05;
      if (samePlace) return false;
      return (
        Math.abs(r.latitude - enriched.latitude) <= NEARBY_DEG &&
        Math.abs(r.longitude - enriched.longitude) <= NEARBY_DEG
      );
    })
    .slice(0, limit);
}

export function hourSlotMatchesNow(
  isoHour: string,
  timezone: string
): boolean {
  return isoHour === currentHourSlot(timezone);
}

export async function searchLocations(
  query: string,
  options?: { countryCode?: string; count?: number }
): Promise<GeoLocation[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({
    name: q,
    count: String(options?.count ?? 6),
    language: "en",
  });
  const code = options?.countryCode?.trim();
  if (code) params.set("country_code", code);

  const url = `${GEOCODE_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Location search failed");
  }
  const data = (await res.json()) as GeocodeResponse;
  if (!data.results?.length) return [];

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  location: GeoLocation
): Promise<DashboardWeather> {
  const params = new URLSearchParams(FORECAST_PARAMS);
  params.set("latitude", String(latitude));
  params.set("longitude", String(longitude));

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Forecast request failed");
  }
  const data = (await res.json()) as ForecastResponse;

  const daily: DailyForecast[] = data.daily.time.map((date, i) => ({
    date,
    weatherCode: data.daily.weather_code[i] ?? 0,
    tempMax: Math.round(data.daily.temperature_2m_max[i] ?? 0),
    tempMin: Math.round(data.daily.temperature_2m_min[i] ?? 0),
    dayName: formatDayName(date),
  }));

  const hourly = data.hourly
    ? parseTodayHourly(data.hourly, data.timezone)
    : [];
  const hourlyByDay = data.hourly
    ? groupHourlyByDay(data.hourly, data.timezone)
    : [];

  return {
    timezone: data.timezone,
    location,
    current: {
      temperature: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code,
      windSpeed: Math.round(data.current.wind_speed_10m),
      windGusts: Math.round(data.current.wind_gusts_10m),
      precipProbability: Math.round(
        data.current.precipitation_probability ?? 0
      ),
    },
    daily,
    hourly,
    hourlyByDay,
  };
}

export async function fetchForecasts(
  locations: GeoLocation[]
): Promise<DashboardWeather[]> {
  return Promise.all(
    locations.map((loc) => fetchForecast(loc.latitude, loc.longitude, loc))
  );
}

export function isToday(date: string, timezone: string): boolean {
  return date === todayInTimezone(timezone);
}

export function buildWeatherBlurb(
  currentTemp: number,
  windMph: number,
  precipPct: number,
  today: DailyForecast,
  conditionLabel: string,
  units?: Pick<AuroraSettings, "tempUnit" | "windUnit">
): string {
  const tempUnit = units?.tempUnit ?? "C";
  const windUnit = units?.windUnit ?? "mph";
  const high = celsiusToDisplay(today.tempMax, tempUnit);
  const low = celsiusToDisplay(today.tempMin, tempUnit);
  const precipLine =
    precipPct > 0
      ? `Precipitation chance is ${precipPct}%.`
      : "Little to no precipitation expected.";
  return [
    `${conditionLabel} with highs near ${high}°${tempUnit} and lows around ${low}°${tempUnit}.`,
    `Currently ${formatTemp(currentTemp, tempUnit)}. Wind around ${formatWindSpeed(windMph, windUnit)} (gusts may be higher).`,
    precipLine,
  ].join("\n");
}

const WAVE_TOP = 56;
const WAVE_BOTTOM = 86;

export function dailyMaxToWavePath(
  maxTemps: number[],
  width = 835,
  height = 230
): string {
  const n = maxTemps.length;
  if (n < 2) {
    return "M0,79 C58,74 112,66 167,68 C225,70 281,62 334,65 C388,68 444,78 501,79 C558,80 614,56 668,56 C722,56 778,72 835,86";
  }

  const minT = Math.min(...maxTemps);
  const maxT = Math.max(...maxTemps);
  const span = maxT - minT || 1;
  const usable = height - WAVE_TOP - WAVE_BOTTOM;

  const pts = maxTemps.map((t, i) => ({
    x: (i / (n - 1)) * width,
    y: WAVE_TOP + ((maxT - t) / span) * usable,
  }));

  let d = `M${pts[0].x},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cx = (prev.x + curr.x) / 2;
    d += ` C${cx},${prev.y.toFixed(1)} ${cx},${curr.y.toFixed(1)} ${curr.x},${curr.y.toFixed(1)}`;
  }
  return d;
}

export function waveFillPath(linePath: string, width = 835, height = 230): string {
  return `${linePath} L${width},${height} L0,${height} Z`;
}