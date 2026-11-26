"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LocationSearch } from "@/components/LocationSearch";
import type { GeoLocation } from "@/lib/open-meteo";
import { useLocation } from "@/components/providers/AppProviders";

type AddLocationModalProps = {
  open: boolean;
  onClose: () => void;
  setAsActive?: boolean;
};

export function AddLocationModal({
  open,
  onClose,
  setAsActive: defaultSetAsActive = true,
}: AddLocationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { addFavorite, setActiveLocation } = useLocation();
  const [setAsActive, setSetAsActive] = useState(defaultSetAsActive);
  const [searchKey, setSearchKey] = useState(0);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      setSetAsActive(defaultSetAsActive);
      setSearchKey(Date.now());
      el.showModal();
    }
    if (!open && el.open) el.close();
  }, [open, defaultSetAsActive]);

  function handlePick(loc: GeoLocation) {
    addFavorite(loc);
    if (setAsActive) setActiveLocation(loc);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="add-loc-dialog"
      aria-labelledby="add-loc-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="add-loc-panel">
        <header className="add-loc-header">
          <div>
            <p className="add-loc-eyebrow">Favorites</p>
            <h2 id="add-loc-title">Add location</h2>
          </div>
          <button
            type="button"
            className="add-loc-close"
            onClick={onClose}
            aria-label="Close"
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <p className="add-loc-lead">
          Search Open-Meteo geocoding and save a city to your list. Signed-in users
          sync to the cloud automatically.
        </p>

        <LocationSearch
          key={searchKey}
          layout="modal"
          autoFocus={open}
          placeholder="e.g. Tokyo, Paris, Denpasar"
          onSelect={handlePick}
        />

        <label className="add-loc-check">
          <input
            type="checkbox"
            checked={setAsActive}
            onChange={(e) => setSetAsActive(e.target.checked)}
          />
          <span>Set as active location after saving</span>
        </label>

        <footer className="add-loc-footer">
          <p className="add-loc-footer-hint">
            Or browse featured cities on{" "}
            <Link href="/explore" onClick={onClose}>
              Explore
            </Link>
            .
          </p>
          <button type="button" className="chip add-loc-cancel" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </dialog>
  );
}