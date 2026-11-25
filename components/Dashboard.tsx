"use client";



import Link from "next/link";

import {

  useCallback,

  useEffect,

  useMemo,

  useRef,

  useState,

  type CSSProperties,

} from "react";

import {

  DEFAULT_LOCATION,

  buildWeatherBlurb,

  dailyMaxToWavePath,

  fetchForecast,

  fetchNearbyLocations,

  isToday,

  waveFillPath,

  type DashboardWeather,

  type GeoLocation,

} from "@/lib/open-meteo";

import {

  getWeatherBackground,

  type WeatherType,

} from "@/lib/weather-backgrounds";

import {

  heroFromCode,

  weatherCodeToLabel,

  weatherCodeToSprite,

  weatherCodeToType,

} from "@/lib/weather-code";

import { useLocation, useSettings } from "@/components/providers/AppProviders";
import {
  celsiusToDisplay,
  formatTemp,
  formatWindSpeed,
} from "@/lib/format-units";

import { useStageShell } from "@/components/shell/StageShellContext";



const GEO_PROMPT_KEY = "aurora-geo-prompted";



const STATIC_WAVE =

  "M0,79 C58,74 112,66 167,68 C225,70 281,62 334,65 C388,68 444,78 501,79 C558,80 614,56 668,56 C722,56 778,72 835,86";



type RailSnapshot = {

  location: GeoLocation;

  temperature: number;

  weatherCode: number;

};



export function Dashboard() {

  const { activeLocation, setActiveLocation } = useLocation();
  const { settings } = useSettings();
  const { setStageStyle, setLoading } = useStageShell();

  const [weather, setWeather] = useState<WeatherType>("storm");

  const [forecast, setForecast] = useState<DashboardWeather | null>(null);

  const [loading, setLoadingLocal] = useState(true);

  const [forecastError, setForecastError] = useState<string | null>(null);

  const [nearbyLocations, setNearbyLocations] = useState<GeoLocation[]>([]);

  const [railSnapshots, setRailSnapshots] = useState<RailSnapshot[]>([]);

  const loadSeq = useRef(0);

  const nearbySeq = useRef(0);



  const loadForecast = useCallback(async (loc: GeoLocation) => {

    const id = ++loadSeq.current;

    setLoadingLocal(true);

    setForecastError(null);

    try {

      const data = await fetchForecast(loc.latitude, loc.longitude, loc);

      if (id !== loadSeq.current) return;

      setForecast(data);

      setWeather(weatherCodeToType(data.current.weatherCode));

    } catch {

      if (id !== loadSeq.current) return;

      setForecast(null);

      setForecastError("Could not load weather for this location.");

    } finally {

      if (id === loadSeq.current) setLoadingLocal(false);

    }

  }, []);



  const loadNearby = useCallback((loc: GeoLocation) => {

    const id = ++nearbySeq.current;

    void fetchNearbyLocations(loc, 3)

      .then((near) => {

        if (id !== nearbySeq.current) return;

        setNearbyLocations(near);

      })

      .catch(() => {

        if (id !== nearbySeq.current) return;

        setNearbyLocations([]);

      });

  }, []);



  const handleLocationSelect = useCallback(

    (loc: GeoLocation) => {

      setActiveLocation(loc);

      void loadForecast(loc);

      loadNearby(loc);

    },

    [loadForecast, loadNearby, setActiveLocation]

  );



  useEffect(() => {

    void loadForecast(activeLocation);

    loadNearby(activeLocation);

  }, [activeLocation, loadForecast, loadNearby]);



  useEffect(() => {

    if (typeof window === "undefined") return;

    if (localStorage.getItem(GEO_PROMPT_KEY)) return;

    localStorage.setItem(GEO_PROMPT_KEY, "1");

    if (!navigator.geolocation) return;



    navigator.geolocation.getCurrentPosition(

      (pos) => {

        const loc: GeoLocation = {

          id: -1,

          name: "Your location",

          country: "",

          latitude: pos.coords.latitude,

          longitude: pos.coords.longitude,

        };

        handleLocationSelect(loc);

      },

      () => {

        /* keep default */

      },

      { timeout: 8000, maximumAge: 600_000 }

    );

  }, [handleLocationSelect]);



  useEffect(() => {

    const bg = getWeatherBackground(weather);

    setStageStyle({

      "--stage-bg-image": `url("${bg.url}")`,

      "--stage-bg-position": bg.backgroundPosition,

    } as CSSProperties);

  }, [weather, setStageStyle]);



  useEffect(() => {

    setLoading(loading);

  }, [loading, setLoading]);



  const secondaryLocations = useMemo(() => nearbyLocations, [nearbyLocations]);



  useEffect(() => {

    let cancelled = false;

    async function loadRails() {

      const snaps: RailSnapshot[] = [];

      for (const loc of secondaryLocations) {

        try {

          const data = await fetchForecast(

            loc.latitude,

            loc.longitude,

            loc

          );

          if (cancelled) return;

          snaps.push({

            location: loc,

            temperature: data.current.temperature,

            weatherCode: data.current.weatherCode,

          });

        } catch {

          /* skip failed rail */

        }

      }

      if (!cancelled) setRailSnapshots(snaps);

    }

    if (secondaryLocations.length) {

      void loadRails();

    } else {

      setRailSnapshots([]);

    }

    return () => {

      cancelled = true;

    };

  }, [secondaryLocations]);



  const hero = forecast

    ? heroFromCode(forecast.current.weatherCode)

    : { line1: "Strom", line2: "with Heavy Rain" };



  const blurb = useMemo(() => {

    if (forecastError) return forecastError;

    if (!forecast?.daily[0]) {

      return loading ? "Loading live conditions…" : "No forecast data.";

    }

    const today = forecast.daily[0];

    const label = weatherCodeToLabel(forecast.current.weatherCode);

    return buildWeatherBlurb(
      forecast.current.temperature,
      forecast.current.windSpeed,
      forecast.current.precipProbability,
      today,
      label,
      settings
    );
  }, [forecast, forecastError, loading, settings]);



  const lineD = useMemo(() => {

    if (!forecast?.daily.length) return STATIC_WAVE;

    return dailyMaxToWavePath(forecast.daily.map((d) => d.tempMax));

  }, [forecast]);



  const fillD = useMemo(() => waveFillPath(lineD), [lineD]);



  const dailyRows = forecast?.daily ?? [];

  const skeletonDays = 7;



  function isDailyForecast(

    day: (typeof dailyRows)[number] | undefined

  ): day is (typeof dailyRows)[number] {

    return Boolean(day?.date);

  }



  return (

    <>

      <section className="hero" aria-labelledby="hero-title">

        <p className="chip">Weather Forecast</p>

        <h1 id="hero-title">

          <span className="ln ln1">

            <span>{hero.line1}</span>

          </span>

          <span className="ln ln2">

            <span>{hero.line2}</span>

          </span>

        </h1>

        <p className="blurb" style={{ whiteSpace: "pre-line" }}>

          {blurb}

        </p>

      </section>



      <section className="forecast" aria-label="Seven day forecast">

        <div className="forecast-bar">

          <Link href="/hourly" className="chip hourly-link">

            Hourly forecast →

          </Link>

        </div>

        <ul className="temps temps--daily">

          {(dailyRows.length

            ? dailyRows

            : Array.from<undefined>({ length: skeletonDays })

          ).map((day, i) => {

            if (!isDailyForecast(day)) {

              return (

                <li key={`t-sk-${i}`} aria-hidden>

                  <span className="t">—</span>

                </li>

              );

            }

            return (

              <li key={day.date}>

                <span className="t">
                  {celsiusToDisplay(day.tempMax, settings.tempUnit)}°
                </span>

                <svg aria-hidden>

                  <use href={weatherCodeToSprite(day.weatherCode)} />

                </svg>

              </li>

            );

          })}

        </ul>

        <div className="chart-wrap">

          <svg

            className="chart"

            viewBox="0 0 835 230"

            preserveAspectRatio="none"

            aria-hidden

          >

            <g clipPath="url(#wclip)">

              <path

                className="wfill"

                fill="url(#wf)"

                mask="url(#wmask)"

                d={fillD}

              />

            </g>

            <path className="wline w3" pathLength={1} d={lineD} />

            <path className="wline w2" pathLength={1} d={lineD} />

            <path className="wline w1" pathLength={1} d={lineD} />

          </svg>

        </div>

        <ul className="days">

          {(dailyRows.length

            ? dailyRows

            : Array.from<undefined>({ length: skeletonDays })

          ).map((day, i) => {

            if (!isDailyForecast(day)) {

              return <li key={`d-sk-${i}`}>—</li>;

            }

            const on = forecast

              ? isToday(day.date, forecast.timezone)

              : false;

            return (

              <li key={day.date} className={on ? "on" : undefined}>

                {day.dayName}

              </li>

            );

          })}

        </ul>

      </section>



      <aside className="rail" aria-label="Regional conditions">

        <article className="card big is-active">

          <header className="place">

            <svg aria-hidden>

              <use href="#i-pin" />

            </svg>

            <span>{activeLocation.name}</span>

          </header>

          <p className="big-temp">

            {forecast ? (

              <>

                {formatTemp(forecast.current.temperature, settings.tempUnit)}

              </>

            ) : (

              <>—° <i>C</i></>

            )}

          </p>

          <ul className="metrics">

            <li>

              <svg aria-hidden>

                <use href="#i-wind" />

              </svg>

              <span>

                {forecast
                  ? formatWindSpeed(forecast.current.windSpeed, settings.windUnit)
                  : "—"}

              </span>

            </li>

            <li>

              <svg aria-hidden>

                <use href="#i-drop" />

              </svg>

              <span>

                {forecast ? `${forecast.current.precipProbability}%` : "—"}

              </span>

            </li>

            <li>

              <svg aria-hidden>

                <use href="#i-gust" />

              </svg>

              <span>

                {forecast
                  ? formatWindSpeed(forecast.current.windGusts, settings.windUnit)
                  : "—"}

              </span>

            </li>

          </ul>

        </article>

        {railSnapshots.map((snap) => (

          <article

            key={`${snap.location.latitude}-${snap.location.longitude}`}

            className="card row"

            role="button"

            tabIndex={0}

            onClick={() => {

              handleLocationSelect(snap.location);

            }}

            onKeyDown={(e) => {

              if (e.key === "Enter" || e.key === " ") {

                e.preventDefault();

                handleLocationSelect(snap.location);

              }

            }}

          >

            <div className="meta">

              <span className="country">{snap.location.country || "—"}</span>

              <span className="city">{snap.location.name}</span>

              <span className="cond">

                {weatherCodeToLabel(snap.weatherCode)}

              </span>

            </div>

            <div className="side">

              <span className="t">
                {celsiusToDisplay(snap.temperature, settings.tempUnit)}°
              </span>

              <svg aria-hidden>

                <use href={weatherCodeToSprite(snap.weatherCode)} />

              </svg>

            </div>

          </article>

        ))}

      </aside>

    </>

  );

}
