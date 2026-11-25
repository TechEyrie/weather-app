"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LocationSearch } from "@/components/LocationSearch";
import {
  buildCompareSearchParams,
  parseCompareSlots,
} from "@/lib/compare-url";
import {
  fetchForecast,
  type DashboardWeather,
  type GeoLocation,
} from "@/lib/open-meteo";
import {
  celsiusToDisplay,
  formatWindSpeed,
} from "@/lib/format-units";
import { weatherCodeToLabel } from "@/lib/weather-code";
import { useLocation, useSettings } from "@/components/providers/AppProviders";

function slotLabel(loc: GeoLocation): string {
  return loc.country ? `${loc.name}, ${loc.country}` : loc.name;
}

function locationKey(loc: GeoLocation): string {
  return `${loc.latitude},${loc.longitude}`;
}

function mergeCityChoices(
  active: GeoLocation,
  favorites: GeoLocation[],
  slots: (GeoLocation | null)[]
): GeoLocation[] {
  const map = new Map<string, GeoLocation>();
  const add = (loc: GeoLocation) => map.set(locationKey(loc), loc);
  add(active);
  for (const f of favorites) add(f);
  for (const s of slots) {
    if (s) add(s);
  }
  return [...map.values()];
}

export function ComparePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { favorites, activeLocation } = useLocation();
  const { settings } = useSettings();

  const [slots, setSlots] = useState<(GeoLocation | null)[]>([
    activeLocation,
    null,
    null,
  ]);
  const [rows, setRows] = useState<(DashboardWeather | null)[]>([
    null,
    null,
    null,
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadSeq = useRef(0);
  const hydratedUrl = useRef(false);

  const filled = useMemo(
    () => slots.filter((s): s is GeoLocation => Boolean(s)),
    [slots]
  );

  const cityChoices = useMemo(
    () => mergeCityChoices(activeLocation, favorites, slots),
    [activeLocation, favorites, slots]
  );

  const syncUrl = useCallback(
    (next: (GeoLocation | null)[]) => {
      const qs = buildCompareSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const loadCompare = useCallback(async (nextSlots: (GeoLocation | null)[]) => {
    const id = ++loadSeq.current;
    if (!nextSlots.some(Boolean)) {
      setRows([null, null, null]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const padded: (DashboardWeather | null)[] = [null, null, null];
      await Promise.all(
        nextSlots.map(async (slot, i) => {
          if (!slot) return;
          padded[i] = await fetchForecast(
            slot.latitude,
            slot.longitude,
            slot
          );
        })
      );
      if (id !== loadSeq.current) return;
      setRows(padded);
    } catch {
      if (id !== loadSeq.current) return;
      setError("Could not load one or more forecasts.");
      setRows([null, null, null]);
    } finally {
      if (id === loadSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hydratedUrl.current) return;
    const fromUrl = parseCompareSlots(searchParams);
    if (fromUrl.some(Boolean)) {
      hydratedUrl.current = true;
      setSlots(fromUrl);
      void loadCompare(fromUrl);
      return;
    }
    hydratedUrl.current = true;
    void loadCompare([activeLocation, null, null]);
  }, [searchParams, activeLocation, loadCompare]);

  function setSlot(index: number, loc: GeoLocation | null) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = loc;
      syncUrl(next);
      void loadCompare(next);
      return next;
    });
  }

  function copyShareLink() {
    void navigator.clipboard?.writeText(window.location.href);
  }

  const dayHeaders = rows[0]?.daily ?? rows.find(Boolean)?.daily ?? [];

  return (
    <section className="page-panel compare-page" aria-labelledby="compare-title">
      <h1 id="compare-title" className="page-title">
        Compare cities
      </h1>
      <p className="page-lead">
        Pick up to three cities — search per slot or choose from saved locations.
        The URL updates as you go; copy the link to share.
      </p>

      <div className="compare-toolbar">
        <button
          type="button"
          className="chip"
          onClick={copyShareLink}
          disabled={filled.length < 1}
        >
          Copy link
        </button>
      </div>

      <ul className="compare-slots">
        {slots.map((slot, i) => (
          <li key={`slot-${i}`}>
            <div className="compare-slot-heading">
              <span>City {i + 1}</span>
              {slot ? (
                <button
                  type="button"
                  className="compare-clear"
                  onClick={() => setSlot(i, null)}
                >
                  Clear
                </button>
              ) : null}
            </div>
            {slot ? (
              <p className="compare-slot-current">{slotLabel(slot)}</p>
            ) : null}
            <LocationSearch
              className="compare-slot-search"
              placeholder={`Search city ${i + 1}`}
              onSelect={(loc) => setSlot(i, loc)}
            />
            <label className="compare-slot-label">
              Saved / recent
              <select
                className="glass-select"
                value={slot ? locationKey(slot) : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) {
                    setSlot(i, null);
                    return;
                  }
                  const loc =
                    cityChoices.find((c) => locationKey(c) === v) ?? null;
                  if (loc) setSlot(i, loc);
                }}
              >
                <option value="">Choose saved city…</option>
                {cityChoices.map((c) => (
                  <option
                    key={`${c.id}-${locationKey(c)}`}
                    value={locationKey(c)}
                  >
                    {locationKey(c) === locationKey(activeLocation)
                      ? `Active: ${slotLabel(c)}`
                      : slotLabel(c)}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>

      {loading ? <p className="page-lead">Loading forecasts…</p> : null}
      {error ? <p className="explore-error">{error}</p> : null}

      {filled.length > 0 && !loading ? (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col">Metric</th>
                {slots.map((slot, i) => (
                  <th key={`h-${i}`} scope="col">
                    {slot
                      ? slotLabel(rows[i]?.location ?? slot)
                      : "—"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Now</th>
                {rows.map((row, i) => (
                  <td key={`now-${i}`}>
                    {row
                      ? `${celsiusToDisplay(row.current.temperature, settings.tempUnit)}°`
                      : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Condition</th>
                {rows.map((row, i) => (
                  <td key={`cond-${i}`}>
                    {row
                      ? weatherCodeToLabel(row.current.weatherCode)
                      : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Wind</th>
                {rows.map((row, i) => (
                  <td key={`wind-${i}`}>
                    {row
                      ? formatWindSpeed(
                          row.current.windSpeed,
                          settings.windUnit
                        )
                      : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Precip</th>
                {rows.map((row, i) => (
                  <td key={`precip-${i}`}>
                    {row ? `${row.current.precipProbability}%` : "—"}
                  </td>
                ))}
              </tr>
              {dayHeaders.slice(0, 7).map((day, dayIndex) => (
                <tr key={day.date}>
                  <th scope="row">{day.dayName.slice(0, 3)}</th>
                  {rows.map((row, i) => {
                    const d = row?.daily[dayIndex];
                    if (!d) return <td key={`${day.date}-${i}`}>—</td>;
                    return (
                      <td key={`${day.date}-${i}`}>
                        {celsiusToDisplay(d.tempMax, settings.tempUnit)}° /{" "}
                        {celsiusToDisplay(d.tempMin, settings.tempUnit)}°
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}