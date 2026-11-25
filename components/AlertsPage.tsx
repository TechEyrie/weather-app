"use client";

import { useEffect, useMemo, useState } from "react";
import { advisoriesFromForecast, type Advisory } from "@/lib/advisories";
import { fetchForecast, type DashboardWeather } from "@/lib/open-meteo";
import { useLocation } from "@/components/providers/AppProviders";

function levelClass(level: Advisory["level"]): string {
  return `alert-level alert-level--${level}`;
}

export function AlertsPage() {
  const { activeLocation } = useLocation();
  const [forecast, setForecast] = useState<DashboardWeather | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load alerts for this location.");
        setForecast(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeLocation]);

  const advisories = useMemo(
    () => (forecast ? advisoriesFromForecast(forecast) : []),
    [forecast]
  );

  return (
    <section className="page-panel alerts-page" aria-labelledby="alerts-title">
      <h1 id="alerts-title" className="page-title">
        Alerts · {activeLocation.name}
      </h1>
      <p className="page-lead alerts-disclaimer">
        Derived from Open-Meteo conditions and WMO weather codes. Not official
        government warnings.
      </p>

      {error ? <p className="explore-error">{error}</p> : null}
      {!error && !forecast ? (
        <p className="page-lead">Loading advisories…</p>
      ) : null}

      <ul className="alerts-list">
        {advisories.map((a) => (
          <li key={a.id} className={levelClass(a.level)}>
            <div className="alerts-head">
              <span className="alerts-badge">{a.level}</span>
              <span className="alerts-when">{a.when}</span>
            </div>
            <h2 className="alerts-item-title">{a.title}</h2>
            <p className="alerts-detail">{a.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}