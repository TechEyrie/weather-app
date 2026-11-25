export type WeatherType =
  | "storm"
  | "heavy-rain"
  | "cloudy"
  | "sunny"
  | "snow";

export const DEFAULT_WEATHER: WeatherType = "storm";

/** Remote Unsplash backgrounds; swap via API later using the same keys. */
/** Verified 200 via HEAD (Nov 2026). */
export const WEATHER_BACKGROUNDS: Record<
  WeatherType,
  { url: string; backgroundPosition: string }
> = {
  storm: {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80&auto=format&fit=crop",
    backgroundPosition: "center 25%",
  },
  "heavy-rain": {
    url: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=1920&q=80&auto=format&fit=crop",
    backgroundPosition: "center center",
  },
  cloudy: {
    url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80&auto=format&fit=crop",
    backgroundPosition: "center center",
  },
  sunny: {
    url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80&auto=format&fit=crop",
    backgroundPosition: "center 30%",
  },
  snow: {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop",
    backgroundPosition: "center center",
  },
};

export function getWeatherBackground(weather: WeatherType = DEFAULT_WEATHER) {
  return WEATHER_BACKGROUNDS[weather];
}