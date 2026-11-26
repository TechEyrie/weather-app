"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { searchLocations, type GeoLocation } from "@/lib/open-meteo";

type LocationSearchProps = {
  onSelect: (location: GeoLocation) => void;
  placeholder?: string;
  className?: string;
  /** Header pill vs full-width modal search */
  layout?: "compact" | "modal";
  autoFocus?: boolean;
};

function locationLabel(loc: GeoLocation): string {
  const region = loc.admin1 ? `, ${loc.admin1}` : "";
  return `${loc.name}${region}${loc.country ? `, ${loc.country}` : ""}`;
}

export function LocationSearch({
  onSelect,
  placeholder = "Search city",
  className,
  layout = "compact",
  autoFocus = false,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchSeq = useRef(0);
  const listId = useId();

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLocalError(null);
      return;
    }
    const id = ++searchSeq.current;
    setSearching(true);
    setLocalError(null);
    setOpen(true);
    try {
      const found = await searchLocations(q);
      if (id !== searchSeq.current) return;
      setResults(found);
      if (!found.length) setLocalError("No locations found");
    } catch {
      if (id !== searchSeq.current) return;
      setLocalError("Search unavailable");
      setResults([]);
    } finally {
      if (id === searchSeq.current) setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void runSearch(query);
    }, 320);
    return () => window.clearTimeout(t);
  }, [query, runSearch]);

  useEffect(() => {
    if (layout !== "compact") return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [layout]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [autoFocus]);

  function pick(loc: GeoLocation) {
    onSelect(loc);
    setQuery("");
    setOpen(false);
    setResults([]);
    setLocalError(null);
  }

  const showModalPanel = layout === "modal" && query.trim().length >= 2;
  const showCompactDropdown = layout === "compact" && open && results.length > 0;

  if (layout === "modal") {
    return (
      <div
        className={["location-search-modal", className].filter(Boolean).join(" ")}
        ref={wrapRef}
      >
        <label className="location-search-modal-label" htmlFor={`${listId}-input`}>
          City name
        </label>
        <div className="location-search-modal-field">
          <svg aria-hidden className="location-search-modal-icon">
            <use href="#i-search" />
          </svg>
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            className="location-search-modal-input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            aria-label="Search locations"
            aria-describedby={`${listId}-hint`}
            aria-controls={showModalPanel ? `${listId}-list` : undefined}
          />
          {searching ? (
            <span className="location-search-modal-busy" aria-hidden />
          ) : null}
        </div>
        <p id={`${listId}-hint`} className="location-search-modal-hint">
          Type at least 2 characters. Results update as you type.
        </p>

        {showModalPanel ? (
          <div className="location-search-modal-results" role="region" aria-live="polite">
            {searching && results.length === 0 ? (
              <p className="location-search-modal-status">Searching…</p>
            ) : null}
            {!searching && localError ? (
              <p className="location-search-modal-status location-search-modal-status--err">
                {localError}
              </p>
            ) : null}
            {!searching && results.length > 0 ? (
              <ul id={`${listId}-list`} className="location-search-modal-list" role="listbox">
                {results.map((loc) => (
                  <li key={loc.id || `${loc.latitude}-${loc.longitude}`}>
                    <button
                      type="button"
                      role="option"
                      className="location-search-modal-option"
                      onClick={() => pick(loc)}
                    >
                      <span className="location-search-modal-option-name">{loc.name}</span>
                      <span className="location-search-modal-option-meta">
                        {[loc.admin1, loc.country].filter(Boolean).join(" · ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={["tool tool-search", className].filter(Boolean).join(" ")}
      ref={wrapRef}
    >
      <svg aria-hidden className="tool-search-icon">
        <use href="#i-search" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        className="tool-search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length) setOpen(true);
        }}
        aria-label="Search locations"
        aria-controls={showCompactDropdown ? listId : undefined}
        autoComplete="off"
      />
      {searching ? <span className="tool-search-busy" aria-hidden /> : null}
      {showCompactDropdown ? (
        <ul id={listId} className="search-dropdown" role="listbox">
          {results.map((loc) => (
            <li key={loc.id || `${loc.latitude}-${loc.longitude}`}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => pick(loc)}
              >
                {locationLabel(loc)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {localError && query.length >= 2 ? (
        <p className="search-error" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  );
}