"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSettings } from "@/components/providers/AppProviders";
import { clearAuroraLocalData } from "@/lib/clear-local-data";
import { DEFAULT_SETTINGS, type AuroraSettings } from "@/lib/settings-storage";

export function SettingsPage() {
  const router = useRouter();
  const { settings, setSettings } = useSettings();
  function patch(partial: Partial<AuroraSettings>) {
    setSettings({ ...settings, ...partial });
  }

  function handleClear() {
    if (
      !window.confirm(
        "Clear saved locations, settings, and theme from this browser?"
      )
    ) {
      return;
    }
    clearAuroraLocalData();
    setSettings(DEFAULT_SETTINGS);
    router.refresh();
    window.location.href = "/";
  }

  return (
    <section className="page-panel settings-page" aria-labelledby="settings-title">
      <h1 id="settings-title" className="page-title">
        Settings
      </h1>

      <div className="settings-layout">
        <fieldset className="settings-block">
          <legend>Appearance</legend>
          <div className="settings-row">
            <span>Theme</span>
            <ThemeToggle />
          </div>
        </fieldset>

        <fieldset className="settings-block">
          <legend>Units</legend>
          <label className="settings-row settings-unit-row">
            <span>Temperature</span>
            <select
              className="glass-select"
              value={settings.tempUnit}
              onChange={(e) =>
                patch({ tempUnit: e.target.value === "F" ? "F" : "C" })
              }
            >
              <option value="C">Celsius (°C)</option>
              <option value="F">Fahrenheit (°F)</option>
            </select>
          </label>
          <label className="settings-row settings-unit-row">
            <span>Wind</span>
            <select
              className="glass-select"
              value={settings.windUnit}
              onChange={(e) =>
                patch({ windUnit: e.target.value === "kmh" ? "kmh" : "mph" })
              }
            >
              <option value="mph">mph</option>
              <option value="kmh">km/h</option>
            </select>
          </label>
        </fieldset>
      </div>

      <div className="settings-footer-block">
        <p className="settings-credit">
          Forecast data from{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open-Meteo
          </a>
          . Geocoding via Open-Meteo; no API key required.
        </p>
        <button
          type="button"
          className="chip settings-danger"
          onClick={handleClear}
        >
          Clear local data
        </button>
      </div>
    </section>
  );
}