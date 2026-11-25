"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchLocations, type GeoLocation } from "@/lib/open-meteo";

type LocationSearchProps = {
  onSelect: (location: GeoLocation) => void;
  placeholder?: string;
  className?: string;
};

export function LocationSearch({
  onSelect,
  placeholder = "Search city",
  className,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchSeq = useRef(0);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const id = ++searchSeq.current;
    setSearching(true);
    setLocalError(null);
    try {
      const found = await searchLocations(q);
      if (id !== searchSeq.current) return;
      setResults(found);
      setOpen(found.length > 0);
      if (!found.length) {
        setLocalError("No locations found");
      }
    } catch {
      if (id !== searchSeq.current) return;
      setLocalError("Search unavailable");
      setResults([]);
      setOpen(false);
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
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(loc: GeoLocation) {
    onSelect(loc);
    setQuery("");
    setOpen(false);
    setResults([]);
  }

  function label(loc: GeoLocation) {
    const region = loc.admin1 ? `, ${loc.admin1}` : "";
    return `${loc.name}${region}, ${loc.country}`;
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
        type="search"
        className="tool-search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length) setOpen(true);
        }}
        aria-label="Search locations"
        aria-controls={open ? "location-search-list" : undefined}
        autoComplete="off"
      />
      {searching ? <span className="tool-search-busy" aria-hidden /> : null}
      {open && results.length > 0 ? (
        <ul id="location-search-list" className="search-dropdown" role="listbox">
          {results.map((loc) => (
            <li key={loc.id || `${loc.latitude}-${loc.longitude}`}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => pick(loc)}
              >
                {label(loc)}
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