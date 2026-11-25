const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

export type SameDayClimate = {
  monthDay: string;
  sampleYears: number;
  meanMaxC: number;
  minMaxC: number;
  maxMaxC: number;
  samples: Array<{ date: string; tempMax: number }>;
};

/** Same calendar day (month-day) over prior years at this lat/lon. */
export async function fetchSameDayClimate(
  latitude: number,
  longitude: number,
  isoDate: string
): Promise<SameDayClimate | null> {
  const y = Number.parseInt(isoDate.slice(0, 4), 10);
  if (Number.isNaN(y)) return null;
  const monthDay = isoDate.slice(5);
  if (!/^\d{2}-\d{2}$/.test(monthDay)) return null;

  const start = `${Math.max(y - 15, 1990)}-01-01`;
  const end = isoDate;

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: start,
    end_date: end,
    daily: "temperature_2m_max",
    timezone: "auto",
  });

  const res = await fetch(`${ARCHIVE_URL}?${params.toString()}`);
  if (!res.ok) return null;

  const data = (await res.json()) as {
    daily?: { time: string[]; temperature_2m_max: number[] };
  };
  const times = data.daily?.time;
  const maxes = data.daily?.temperature_2m_max;
  if (!times?.length || !maxes?.length) return null;

  const samples: Array<{ date: string; tempMax: number }> = [];
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    if (!t || t >= isoDate) continue;
    if (t.slice(5) !== monthDay) continue;
    const v = maxes[i];
    if (typeof v !== "number" || Number.isNaN(v)) continue;
    samples.push({ date: t, tempMax: Math.round(v) });
  }
  if (!samples.length) return null;

  const values = samples.map((s) => s.tempMax);
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    monthDay,
    sampleYears: samples.length,
    meanMaxC: Math.round(sum / values.length),
    minMaxC: Math.min(...values),
    maxMaxC: Math.max(...values),
    samples,
  };
}

// ponytail: one archive round-trip; upgrade = dedicated climate normals API