"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchForecast,
  type DashboardWeather,
} from "@/lib/open-meteo";
import { buildWeeklyReportText } from "@/lib/weekly-report";
import { celsiusToDisplay, formatWindSpeed } from "@/lib/format-units";
import { weatherCodeToLabel, weatherCodeToSprite } from "@/lib/weather-code";
import { useLocation, useSettings } from "@/components/providers/AppProviders";

export function ReportsPage() {
  const { activeLocation } = useLocation();
  const { settings } = useSettings();
  const [forecast, setForecast] = useState<DashboardWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load data for weekly report.");
        setForecast(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeLocation]);

  const reportText = useMemo(
    () => (forecast ? buildWeeklyReportText(forecast, settings) : ""),
    [forecast, settings]
  );

  function handleCopy() {
    void navigator.clipboard?.writeText(reportText).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <section
      className="page-panel reports-page"
      aria-labelledby="reports-title"
    >
      <h1 id="reports-title" className="page-title">
        Weekly report · {activeLocation.name}
      </h1>
      <p className="page-lead">
        Shareable summary from the current 7-day forecast. Copy puts plain text
        on your clipboard for email or chat; print uses your browser.
      </p>

      <div className="reports-actions no-print">
        <button type="button" className="chip" onClick={handleCopy} disabled={!reportText}>
          {copied ? "Copied" : "Copy report"}
        </button>
        <button
          type="button"
          className="chip hourly-link"
          onClick={handlePrint}
          disabled={!forecast}
        >
          Print
        </button>
      </div>

      {error ? <p className="explore-error">{error}</p> : null}
      {!error && !forecast ? <p className="page-lead">Loading…</p> : null}

      {forecast ? (
        <article className="report-card" id="weekly-report-print">
          <header className="report-head">
            <h2 className="report-loc">
              {forecast.location.name}
              {forecast.location.country
                ? `, ${forecast.location.country}`
                : ""}
            </h2>
            <p className="report-meta">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </header>
          <div className="report-now-block">
            <p className="report-now">
              Now{" "}
              {celsiusToDisplay(forecast.current.temperature, settings.tempUnit)}
              ° · {weatherCodeToLabel(forecast.current.weatherCode)}
            </p>
            <ul className="report-stats">
              <li>
                <span className="report-stat-label">Wind</span>
                <span className="report-stat-value">
                  {formatWindSpeed(
                    forecast.current.windSpeed,
                    settings.windUnit
                  )}
                </span>
              </li>
              <li>
                <span className="report-stat-label">Precip chance</span>
                <span className="report-stat-value">
                  {forecast.current.precipProbability}%
                </span>
              </li>
            </ul>
          </div>
          <ul className="report-days">
            {forecast.daily.map((day) => (
              <li key={day.date}>
                <div className="report-day-name">
                  <svg aria-hidden className="report-day-icon">
                    <use href={weatherCodeToSprite(day.weatherCode)} />
                  </svg>
                  <span>{day.dayName}</span>
                </div>
                <span className="report-day-temps">
                  {celsiusToDisplay(day.tempMax, settings.tempUnit)}° /{" "}
                  {celsiusToDisplay(day.tempMin, settings.tempUnit)}°
                </span>
                <span className="report-day-cond">
                  {weatherCodeToLabel(day.weatherCode)}
                </span>
              </li>
            ))}
          </ul>
          <footer className="report-footer no-print">
            <p className="report-footnote">
              Estimate from Open-Meteo — not an official forecast. Generated{" "}
              {new Date().toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              .
            </p>
          </footer>
        </article>
      ) : null}
    </section>
  );
}