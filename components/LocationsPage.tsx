"use client";

import Link from "next/link";
import { useLocation } from "@/components/providers/AppProviders";
import type { GeoLocation } from "@/lib/open-meteo";

function locationLabel(loc: GeoLocation): string {
  const region = loc.admin1 ? `, ${loc.admin1}` : "";
  return `${loc.name}${region}${loc.country ? `, ${loc.country}` : ""}`;
}

export function LocationsPage() {
  const {
    favorites,
    activeLocation,
    setActiveLocation,
    removeFavorite,
    moveFavorite,
  } = useLocation();

  return (
    <section className="page-panel locations-page" aria-labelledby="locations-title">
      <h1 id="locations-title" className="page-title">
        Saved locations
      </h1>
      {favorites.length === 0 ? (
        <p className="page-lead">
          No favorites yet. Use the <strong>+</strong> button in the header or{" "}
          <Link href="/">search</Link> on the dashboard.
        </p>
      ) : (
        <ul className="locations-list">
          {favorites.map((loc, index) => {
            const active =
              loc.id === activeLocation.id ||
              (Math.abs(loc.latitude - activeLocation.latitude) < 0.02 &&
                Math.abs(loc.longitude - activeLocation.longitude) < 0.02);
            return (
              <li key={`${loc.id}-${loc.latitude}`} className={active ? "is-active" : ""}>
                <button
                  type="button"
                  className="locations-pick"
                  onClick={() => setActiveLocation(loc)}
                >
                  {locationLabel(loc)}
                  {active ? <span className="locations-badge">Active</span> : null}
                </button>
                <div className="locations-actions">
                  <button
                    type="button"
                    className="locations-move"
                    disabled={index === 0}
                    aria-label={`Move ${loc.name} up`}
                    onClick={() => moveFavorite(loc.id, "up")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="locations-move"
                    disabled={index === favorites.length - 1}
                    aria-label={`Move ${loc.name} down`}
                    onClick={() => moveFavorite(loc.id, "down")}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="locations-remove"
                    aria-label={`Remove ${loc.name}`}
                    onClick={() => removeFavorite(loc.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}