"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchForecast,
  type DashboardWeather,
} from "@/lib/open-meteo";
import { fetchSameDayClimate, type SameDayClimate } from "@/lib/climate";
import { celsiusToDisplay } from "@/lib/format-units";
import { useLocation, useSettings } from "@/components/providers/AppProviders";

function todayIsoLocal(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function ClimatePage() {
  const { activeLocation } = useLocation();
  const { settings } = useSettings();
  const [forecast, setForecast] = useState<DashboardWeather | null>(null);
  const [climate, setClimate] = useState<SameDayClimate | null>(null);
  const [climateError, setClimateError] = useState<string | null>(null);
  const [compareDate, setCompareDate] = useState(todayIsoLocal());
  const [loadingClimate, setLoadingClimate] = useState(false);

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
        setForecast(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeLocation]);

  useEffect(() => {
    let cancelled = false;
    setLoadingClimate(true);
    setClimateError(null);
    void fetchSameDayClimate(
      activeLocation.latitude,
      activeLocation.longitude,
      compareDate
    )
      .then((data) => {
        if (cancelled) return;
        setClimate(data);
        if (!data) setClimateError("No historical samples for this date.");
      })
      .catch(() => {
        if (cancelled) return;
        setClimate(null);
        setClimateError("Historical archive unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoadingClimate(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeLocation, compareDate]);

  const todayHigh = useMemo(() => {
    const day = forecast?.daily.find((d) => d.date === compareDate);
    return day?.tempMax ?? forecast?.current.temperature ?? null;
  }, [forecast, compareDate]);

  const delta = useMemo(() => {
    if (todayHigh == null || !climate) return null;
    return todayHigh - climate.meanMaxC;
  }, [todayHigh, climate]);

  return (
    <section className="page-panel climate-page" aria-labelledby="climate-title">
      <h1 id="climate-title" className="page-title">
        Climate · {activeLocation.name}
      </h1>
      <p className="page-lead">
        Compare a forecast day to the average high on that calendar date from
        past years (Open-Meteo ERA5 archive).
      </p>

      <label className="settings-row calendar-field-row climate-date-row">
        <span>Date</span>
        <input
          type="date"
          className="login-input glass-input"
          value={compareDate}
          max={forecast?.daily[forecast.daily.length - 1]?.date ?? compareDate}
          min={forecast?.daily[0]?.date ?? compareDate}
          onChange={(e) => setCompareDate(e.target.value)}
        />
      </label>

      {loadingClimate ? <p className="page-lead">Loading history…</p> : null}
      {climateError ? <p className="explore-error">{climateError}</p> : null}

      {climate && todayHigh != null ? (
        <div className="climate-compare">
          <div className="climate-stat">
            <span className="climate-label">Forecast high</span>
            <span className="climate-value">
              {celsiusToDisplay(todayHigh, settings.tempUnit)}°
            </span>
          </div>
          <div className="climate-stat">
            <span className="climate-label">
              Avg high on {climate.monthDay} ({climate.sampleYears} yrs)
            </span>
            <span className="climate-value">
              {celsiusToDisplay(climate.meanMaxC, settings.tempUnit)}°
            </span>
          </div>
          <p className="climate-delta">
            {delta === null
              ? ""
              : delta === 0
                ? "Right on the historical average for this date."
                : delta > 0
                  ? `${celsiusToDisplay(delta, settings.tempUnit)}° warmer than the historical average.`
                  : `${celsiusToDisplay(Math.abs(delta), settings.tempUnit)}° cooler than the historical average.`}
          </p>
          <p className="page-lead climate-range">
            Past highs on this date ranged{" "}
            {celsiusToDisplay(climate.minMaxC, settings.tempUnit)}° –{" "}
            {celsiusToDisplay(climate.maxMaxC, settings.tempUnit)}°.
          </p>
        </div>
      ) : null}
      {climate && todayHigh == null ? (
        <p className="page-lead">
          Historical average high{" "}
          {celsiusToDisplay(climate.meanMaxC, settings.tempUnit)}° on{" "}
          {climate.monthDay} ({climate.sampleYears} samples). Pick a date in the
          7-day forecast to compare.
        </p>
      ) : null}
    </section>
  );
}