"use client";

import { useEffect, useRef } from "react";
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
  setAsActive = true,
}: AddLocationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { addFavorite, setActiveLocation } = useLocation();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  function handlePick(loc: GeoLocation) {
    addFavorite(loc);
    if (setAsActive) setActiveLocation(loc);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="add-loc-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <form method="dialog" className="add-loc-form">
        <h2 id="add-loc-title">Add location</h2>
        <p className="add-loc-hint">Search and save to your favorites.</p>
        <LocationSearch onSelect={handlePick} />
        <button type="button" className="chip add-loc-cancel" onClick={onClose}>
          Cancel
        </button>
      </form>
    </dialog>
  );
}