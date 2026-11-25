"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EXPLORE_COUNTRIES,
  FEATURED_BY_COUNTRY,
} from "@/lib/explore-catalog";
import { searchLocations, type GeoLocation } from "@/lib/open-meteo";
import { useLocation } from "@/components/providers/AppProviders";

function locationLabel(loc: GeoLocation): string {
  const region = loc.admin1 ? `, ${loc.admin1}` : "";
  return `${loc.name}${region}${loc.country ? `, ${loc.country}` : ""}`;
}

export function ExplorePage() {
  const router = useRouter();
  const { setActiveLocation, addFavorite } = useLocation();
  const [countryCode, setCountryCode] = useState("ID");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  const featured = useMemo(
    () => FEATURED_BY_COUNTRY[countryCode] ?? [],
    [countryCode]
  );

  const runSearch = useCallback(
    async (q: string, code: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setError(null);
        return;
      }
      const id = ++seq.current;
      setSearching(true);
      setError(null);
      try {
        const found = await searchLocations(q, {
          countryCode: code,
          count: 12,
        });
        if (id !== seq.current) return;
        setResults(found);
        if (!found.length) setError("No cities found for this country.");
      } catch {
        if (id !== seq.current) return;
        setResults([]);
        setError("Search unavailable.");
      } finally {
        if (id === seq.current) setSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      void runSearch(query, countryCode);
    }, 320);
    return () => window.clearTimeout(t);
  }, [query, countryCode, runSearch]);

  function pick(loc: GeoLocation, goDashboard: boolean) {
    addFavorite(loc);
    setActiveLocation(loc);
    if (goDashboard) router.push("/");
  }

  return (
    <section className="page-panel explore-page" aria-labelledby="explore-title">
      <h1 id="explore-title" className="page-title">
        Explore regions
      </h1>
      <p className="page-lead">
        Browse featured cities or search within a country. Picking a city saves
        it to favorites and sets your active location.
      </p>

      <label className="settings-row explore-country-row">
        <span>Country</span>
        <select
          className="glass-select"
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value);
            setQuery("");
            setResults([]);
          }}
        >
          {EXPLORE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {featured.length > 0 ? (
        <div className="explore-featured">
          <h2 className="explore-subhead">Featured</h2>
          <ul className="explore-chips">
            {featured.map((loc) => (
              <li key={`${loc.name}-${loc.latitude}`}>
                <button
                  type="button"
                  className="chip"
                  onClick={() => pick(loc, true)}
                >
                  {loc.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <label className="explore-search">
        <span className="explore-subhead">Search cities</span>
        <input
          type="search"
          className="login-input"
          placeholder="City name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </label>

      {searching ? <p className="page-lead">Searching…</p> : null}
      {error ? <p className="explore-error">{error}</p> : null}

      {results.length > 0 ? (
        <ul className="explore-results">
          {results.map((loc) => (
            <li key={`${loc.id}-${loc.latitude}`}>
              <span>{locationLabel(loc)}</span>
              <div className="explore-result-actions">
                <button
                  type="button"
                  className="chip"
                  onClick={() => pick(loc, false)}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="chip hourly-link"
                  onClick={() => pick(loc, true)}
                >
                  Open dashboard
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}