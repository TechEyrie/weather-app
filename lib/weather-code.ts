import type { WeatherType } from "./weather-backgrounds";

export type WeatherSpriteId =
  | "#i-sun"
  | "#i-cloud"
  | "#i-cloud2"
  | "#i-hail";

export type ConditionMeta = {
  spriteId: WeatherSpriteId;
  weatherType: WeatherType;
  label: string;
  heroLine1: string;
  heroLine2: string;
};

const STORM_HERO: Pick<ConditionMeta, "heroLine1" | "heroLine2"> = {
  heroLine1: "Strom",
  heroLine2: "with Heavy Rain",
};

function meta(
  spriteId: WeatherSpriteId,
  weatherType: WeatherType,
  label: string,
  heroLine1: string,
  heroLine2: string
): ConditionMeta {
  return { spriteId, weatherType, label, heroLine1, heroLine2 };
}

export function weatherCodeToMeta(code: number): ConditionMeta {
  if (code === 0) {
    return meta("#i-sun", "sunny", "Clear", "Clear", "Skies Today");
  }
  if (code === 1) {
    return meta("#i-sun", "sunny", "Mostly Clear", "Mostly", "Clear Skies");
  }
  if (code === 2) {
    return meta("#i-cloud2", "cloudy", "Partly Cloudy", "Partly", "Cloudy Skies");
  }
  if (code === 3) {
    return meta("#i-cloud", "cloudy", "Overcast", "Overcast", "Gray Skies");
  }
  if (code === 45 || code === 48) {
    return meta("#i-cloud", "cloudy", "Foggy", "Foggy", "Low Visibility");
  }
  if (code >= 51 && code <= 57) {
    return meta("#i-cloud2", "heavy-rain", "Drizzle", "Light", "Drizzle");
  }
  if (code >= 61 && code <= 67) {
    return meta("#i-cloud", "heavy-rain", "Rain", "Rain", "Showers Expected");
  }
  if (code >= 71 && code <= 77) {
    return meta("#i-hail", "snow", "Snow", "Snow", "Showers Likely");
  }
  if (code >= 80 && code <= 82) {
    return meta("#i-cloud", "heavy-rain", "Rain Showers", "Rain", "Showers Ahead");
  }
  if (code >= 85 && code <= 86) {
    return meta("#i-hail", "snow", "Snow Showers", "Snow", "Showers Ahead");
  }
  if (code >= 95 && code <= 99) {
    return {
      spriteId: "#i-hail",
      weatherType: "storm",
      label: "Thunderstorm",
      ...STORM_HERO,
    };
  }
  return meta("#i-cloud2", "cloudy", "Cloudy", "Cloudy", "Conditions");
}

export function weatherCodeToType(code: number): WeatherType {
  return weatherCodeToMeta(code).weatherType;
}

export function weatherCodeToSprite(code: number): WeatherSpriteId {
  return weatherCodeToMeta(code).spriteId;
}

export function weatherCodeToLabel(code: number): string {
  return weatherCodeToMeta(code).label;
}

export function heroFromCode(code: number): { line1: string; line2: string } {
  const m = weatherCodeToMeta(code);
  return { line1: m.heroLine1, line2: m.heroLine2 };
}