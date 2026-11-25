"use client";

import { useState } from "react";
import Link from "next/link";
import { AddLocationModal } from "@/components/AddLocationModal";
import { LocationSearch } from "@/components/LocationSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth, useLocation } from "@/components/providers/AppProviders";

function displayName(email: string | null): string {
  if (!email) return "Guest";
  const prefix = email.split("@")[0]?.trim();
  return prefix || "Guest";
}

export function AppHeader() {
  const { email } = useAuth();
  const { setActiveLocation } = useLocation();
  const who = displayName(email);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <header className="header">
      <div className="greet">
        <p className="hello">Welcome</p>
        <p className="who">{who}</p>
      </div>
      <div className="tools">
        <button
          type="button"
          className="tool tool-btn"
          aria-label="Add location"
          onClick={() => setAddOpen(true)}
        >
          <svg aria-hidden>
            <use href="#i-plus" />
          </svg>
        </button>
        <LocationSearch onSelect={setActiveLocation} />
        <ThemeToggle />
        <Link
          className={`tool avatar-wrap${email ? "" : " guest-avatar"}`}
          href={email ? "/account" : "/login"}
          aria-label={email ? "Account" : "Sign in"}
        >
          <svg
            className="avatar-fallback avatar-fallback-only"
            aria-hidden
          >
            <use href="#i-avatar" />
          </svg>
        </Link>
      </div>
      <AddLocationModal open={addOpen} onClose={() => setAddOpen(false)} />
    </header>
  );
}