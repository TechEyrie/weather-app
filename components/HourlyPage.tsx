"use client";



import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {

  fetchForecast,

  hourSlotMatchesNow,

  type DashboardWeather,

} from "@/lib/open-meteo";

import {

  getWeatherBackground,

  type WeatherType,

} from "@/lib/weather-backgrounds";

import {

  weatherCodeToLabel,

  weatherCodeToSprite,

  weatherCodeToType,

} from "@/lib/weather-code";

import { useLocation, useSettings } from "@/components/providers/AppProviders";
import { celsiusToDisplay } from "@/lib/format-units";

import { useStageShell } from "@/components/shell/StageShellContext";



function formatHourLabel(iso: string): string {

  const h = Number.parseInt(iso.slice(11, 13), 10);

  if (Number.isNaN(h)) return "";

  if (h === 0) return "12:00 AM";

  if (h < 12) return `${h}:00 AM`;

  if (h === 12) return "12:00 PM";

  return `${h - 12}:00 PM`;

}



export function HourlyPage() {

  const { activeLocation: location } = useLocation();
  const { settings } = useSettings();

  const { setStageStyle, setStageClassName } = useStageShell();

  const [forecast, setForecast] = useState<DashboardWeather | null>(null);

  const [weather, setWeather] = useState<WeatherType>("storm");

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    setStageClassName("hourly-stage");

    return () => setStageClassName(undefined);

  }, [setStageClassName]);



  useEffect(() => {

    const bg = getWeatherBackground(weather);

    setStageStyle({

      "--stage-bg-image": `url("${bg.url}")`,

      "--stage-bg-position": bg.backgroundPosition,

    } as CSSProperties);

  }, [weather, setStageStyle]);



  useEffect(() => {

    let cancelled = false;

    void fetchForecast(location.latitude, location.longitude, location)

      .then((data) => {

        if (cancelled) return;

        setForecast(data);

        setWeather(weatherCodeToType(data.current.weatherCode));

      })

      .catch(() => {

        if (cancelled) return;

        setError("Could not load hourly forecast.");

      });

    return () => {

      cancelled = true;

    };

  }, [location]);



  const groups = useMemo(

    () => forecast?.hourlyByDay ?? [],

    [forecast?.hourlyByDay]

  );



  return (

    <>

      <header className="hourly-header">

        <h1 className="hourly-title">

          Hourly · {location.name}

          {location.country ? `, ${location.country}` : ""}

        </h1>

      </header>



      <section className="hourly-panel" aria-label="Hourly forecast">

        {error ? <p className="hourly-error">{error}</p> : null}

        {!error && !forecast ? (

          <p className="hourly-loading">Loading hourly forecast…</p>

        ) : null}

        {groups.map((group) => (

          <div key={group.date} className="hourly-day-group">

            <h2 className="hourly-day-name">{group.dayName}</h2>

            <ul className="hourly-list">

              {group.hours.map((slot) => {

                const isNow =

                  forecast &&

                  hourSlotMatchesNow(slot.time, forecast.timezone);

                return (

                  <li

                    key={slot.time}

                    className={isNow ? "hourly-row is-now" : "hourly-row"}

                  >

                    <span className="hourly-time">

                      {isNow ? "Now" : formatHourLabel(slot.time)}

                    </span>

                    <span className="hourly-cond">

                      {weatherCodeToLabel(slot.weatherCode)}

                    </span>

                    <span className="hourly-temp">
                      {celsiusToDisplay(slot.temperature, settings.tempUnit)}°
                    </span>

                    <svg aria-hidden className="hourly-icon">

                      <use href={weatherCodeToSprite(slot.weatherCode)} />

                    </svg>

                  </li>

                );

              })}

            </ul>

          </div>

        ))}

      </section>

    </>

  );

}
