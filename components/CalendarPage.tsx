"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchForecast,
  type DailyForecast,
  type DashboardWeather,
} from "@/lib/open-meteo";
import { celsiusToDisplay } from "@/lib/format-units";
import { weatherCodeToLabel, weatherCodeToSprite } from "@/lib/weather-code";
import { useLocation, useSettings } from "@/components/providers/AppProviders";

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function tripStats(days: DailyForecast[]) {
  if (!days.length) return null;
  const highs = days.map((d) => d.tempMax);
  const lows = days.map((d) => d.tempMin);
  return {
    warmest: Math.max(...highs),
    coldest: Math.min(...lows),
    days: days.length,
  };
}

export function CalendarPage() {
  const { activeLocation } = useLocation();
  const { settings } = useSettings();
  const [forecast, setForecast] = useState<DashboardWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickDate, setPickDate] = useState("");
  const [tripStart, setTripStart] = useState("");
  const [tripEnd, setTripEnd] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchForecast(
      activeLocation.latitude,
      activeLocation.longitude,
      activeLocation
    )
      .then((data) => {
        if (cancelled) return;
        setForecast(data);
        const first = data.daily[0]?.date ?? "";
        setPickDate(first);
        setTripStart(first);
        setTripEnd(data.daily[data.daily.length - 1]?.date ?? first);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load forecast for calendar.");
        setForecast(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeLocation]);

  const bounds = useMemo(() => {
    if (!forecast?.daily.length) return { min: "", max: "" };
    return {
      min: forecast.daily[0].date,
      max: forecast.daily[forecast.daily.length - 1].date,
    };
  }, [forecast]);

  const picked = useMemo(
    () => forecast?.daily.find((d) => d.date === pickDate),
    [forecast, pickDate]
  );

  const tripDays = useMemo(() => {
    if (!forecast || !tripStart || !tripEnd || tripStart > tripEnd) return [];
    return forecast.daily.filter((d) => inRange(d.date, tripStart, tripEnd));
  }, [forecast, tripStart, tripEnd]);

  const trip = useMemo(() => tripStats(tripDays), [tripDays]);

  return (
    <section className="page-panel calendar-page" aria-labelledby="cal-title">
      <h1 id="cal-title" className="page-title">
        Calendar · {activeLocation.name}
      </h1>
      <p className="page-lead">
        Pick a day within the 7-day forecast window, or plan a short trip range.
      </p>

      {error ? <p className="explore-error">{error}</p> : null}
      {!error && !forecast ? <p className="page-lead">Loading…</p> : null}

      {forecast ? (
        <div className="calendar-layout">
          <fieldset className="settings-block calendar-block">
            <legend>Day detail</legend>
            <label className="settings-row calendar-field-row">
              <span>Date</span>
              <input
                type="date"
                className="login-input glass-input"
                min={bounds.min}
                max={bounds.max}
                value={pickDate}
                onChange={(e) => setPickDate(e.target.value)}
              />
            </label>
            {picked ? (
              <div className="calendar-day-card">
                <p className="calendar-day-name">{picked.dayName}</p>
                <p className="calendar-day-temps">
                  {celsiusToDisplay(picked.tempMax, settings.tempUnit)}° /{" "}
                  {celsiusToDisplay(picked.tempMin, settings.tempUnit)}°
                </p>
                <p className="calendar-day-cond">
                  <svg aria-hidden className="calendar-day-icon">
                    <use href={weatherCodeToSprite(picked.weatherCode)} />
                  </svg>
                  {weatherCodeToLabel(picked.weatherCode)}
                </p>
              </div>
            ) : (
              <p className="page-lead">No forecast for that date.</p>
            )}
          </fieldset>

          <fieldset className="settings-block calendar-block">
            <legend>Trip mode (7-day window)</legend>
            <label className="settings-row calendar-field-row">
              <span>From</span>
              <input
                type="date"
                className="login-input glass-input"
                min={bounds.min}
                max={bounds.max}
                value={tripStart}
                onChange={(e) => setTripStart(e.target.value)}
              />
            </label>
            <label className="settings-row calendar-field-row">
              <span>To</span>
              <input
                type="date"
                className="login-input glass-input"
                min={bounds.min}
                max={bounds.max}
                value={tripEnd}
                onChange={(e) => setTripEnd(e.target.value)}
              />
            </label>
            {trip ? (
              <p className="calendar-trip-summary">
                {trip.days} day(s): warmest high{" "}
                {celsiusToDisplay(trip.warmest, settings.tempUnit)}°, coldest low{" "}
                {celsiusToDisplay(trip.coldest, settings.tempUnit)}°
              </p>
            ) : null}
            <ul className="calendar-trip-list">
              {tripDays.map((day) => (
                <li key={day.date}>
                  <span>{day.dayName}</span>
                  <span>
                    {celsiusToDisplay(day.tempMax, settings.tempUnit)}° /{" "}
                    {celsiusToDisplay(day.tempMin, settings.tempUnit)}°
                  </span>
                  <span>{weatherCodeToLabel(day.weatherCode)}</span>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
      ) : null}
    </section>
  );
}