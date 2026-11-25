"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

export const THEME_KEY = "aurora-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const initial: Theme = stored === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  }

  return (
    <button
      type="button"
      className="tool"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      <svg aria-hidden>
        <use href={theme === "dark" ? "#i-sun" : "#i-moon"} />
      </svg>
    </button>
  );
}