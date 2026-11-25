"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchForecast,
  type DashboardWeather,
} from "@/lib/open-meteo";
import {
  formatTemp,
  formatWindSpeed,
} from "@/lib/format-units";
import { weatherCodeToLabel } from "@/lib/weather-code";
import { useLocation, useSettings } from "@/components/providers/AppProviders";
import { useStageShell } from "@/components/shell/StageShellContext";
import { getWeatherBackground } from "@/lib/weather-backgrounds";
import { weatherCodeToType } from "@/lib/weather-code";
import type { CSSProperties } from "react";

function osmEmbedUrl(lat: number, lon: number): string {
  const padLon = 0.22;
  const padLat = 0.16;
  const minLon = lon - padLon;
  const minLat = lat - padLat;
  const maxLon = lon + padLon;
  const maxLat = lat + padLat;
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
  const marker = `${lat}%2C${lon}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

export function MapPage() {
  const { activeLocation } = useLocation();
  const { settings } = useSettings();
  const { setStageStyle } = useStageShell();
  const [forecast, setForecast] = useState<DashboardWeather | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapSrc = useMemo(
    () =>
      osmEmbedUrl(activeLocation.latitude, activeLocation.longitude),
    [activeLocation.latitude, activeLocation.longitude]
  );

  useEffect(() => {
    let cancelled = false;
    setError(null);
    void fetchForecast(
      activeLocation.latitude,
      activeLocation.longitude,
      activeLocation
    )
      .then((data) => {
        if (cancelled) return;
        setForecast(data);
        const bg = getWeatherBackground(
          weatherCodeToType(data.current.weatherCode)
        );
        setStageStyle({
          "--stage-bg-image": `url("${bg.url}")`,
          "--stage-bg-position": bg.backgroundPosition,
        } as CSSProperties);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load conditions for this map.");
        setForecast(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeLocation, setStageStyle]);

  const externalOsm = `https://www.openstreetmap.org/?mlat=${activeLocation.latitude}&mlon=${activeLocation.longitude}#map=12/${activeLocation.latitude}/${activeLocation.longitude}`;

  return (
    <section className="page-panel map-page" aria-labelledby="map-title">
      <h1 id="map-title" className="page-title">
        Map · {activeLocation.name}
      </h1>
      <p className="page-lead">
        Centered on your active location. Radar tiles need a map SDK later — this
        uses OpenStreetMap embed (no extra packages).
      </p>

      <div className="map-layout">
        <div className="map-frame-wrap">
          <iframe
            title={`Map near ${activeLocation.name}`}
            className="map-frame"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <aside className="map-sidebar" aria-label="Conditions at pin">
          {error ? <p className="explore-error">{error}</p> : null}
          {!error && !forecast ? (
            <p className="page-lead">Loading conditions…</p>
          ) : null}
          {forecast ? (
            <>
              <p className="map-cond">
                {weatherCodeToLabel(forecast.current.weatherCode)}
              </p>
              <p className="map-temp">
                {formatTemp(forecast.current.temperature, settings.tempUnit)}
              </p>
              <ul className="map-metrics">
                <li>
                  Wind:{" "}
                  {formatWindSpeed(
                    forecast.current.windSpeed,
                    settings.windUnit
                  )}
                </li>
                <li>Precip chance: {forecast.current.precipProbability}%</li>
              </ul>
              <Link href="/alerts" className="chip hourly-link">
                View advisories →
              </Link>
            </>
          ) : null}
          <a
            href={externalOsm}
            target="_blank"
            rel="noopener noreferrer"
            className="map-ext-link"
          >
            Open full map
          </a>
        </aside>
      </div>
    </section>
  );
}