import type { GeoLocation } from "@/lib/open-meteo";
import type { AuroraSettings } from "@/lib/settings-storage";
import { writeFavorites } from "@/lib/favorites-storage";
import { writeSettings } from "@/lib/settings-storage";
import { saveActiveLocation } from "@/lib/location-storage";
import type { SupabaseClient } from "@supabase/supabase-js";

type FavoriteRow = {
  geocode_id: number;
  name: string;
  country: string;
  admin1: string | null;
  latitude: number;
  longitude: number;
  sort_order: number;
};

function rowToLoc(row: FavoriteRow): GeoLocation {
  return {
    id: row.geocode_id,
    name: row.name,
    country: row.country,
    admin1: row.admin1 ?? undefined,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

function locToRow(loc: GeoLocation, sortOrder: number): FavoriteRow {
  return {
    geocode_id: loc.id,
    name: loc.name,
    country: loc.country ?? "",
    admin1: loc.admin1 ?? null,
    latitude: loc.latitude,
    longitude: loc.longitude,
    sort_order: sortOrder,
  };
}

export async function pullFavorites(
  supabase: SupabaseClient,
  userId: string
): Promise<GeoLocation[]> {
  const { data, error } = await supabase
    .from("favorite_locations")
    .select(
      "geocode_id, name, country, admin1, latitude, longitude, sort_order"
    )
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => rowToLoc(row as FavoriteRow));
}

export async function pushFavorites(
  supabase: SupabaseClient,
  userId: string,
  favorites: GeoLocation[]
): Promise<void> {
  await supabase.from("favorite_locations").delete().eq("user_id", userId);
  if (!favorites.length) return;
  const rows = favorites.map((loc, i) => ({
    user_id: userId,
    ...locToRow(loc, i),
  }));
  const { error } = await supabase.from("favorite_locations").insert(rows);
  if (error) throw error;
}

export type ProfileSettings = {
  auroraSettings?: AuroraSettings;
  activeLocation?: GeoLocation;
};

export async function pullProfileSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileSettings | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data?.settings) return null;
  return data.settings as ProfileSettings;
}

export async function pushProfileSettings(
  supabase: SupabaseClient,
  userId: string,
  patch: ProfileSettings
): Promise<void> {
  const existing = (await pullProfileSettings(supabase, userId)) ?? {};
  const next = { ...existing, ...patch };
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, settings: next }, { onConflict: "id" });
  if (error) throw error;
}

/** Signed-in hydrate: DB is source of truth; local guest data is merged in once. */
export async function hydrateUserData(
  supabase: SupabaseClient,
  userId: string,
  localFavorites: GeoLocation[],
  localSettings: AuroraSettings,
  localActive: GeoLocation
): Promise<{
  favorites: GeoLocation[];
  settings: AuroraSettings;
  activeLocation: GeoLocation;
}> {
  const remoteFavorites = await pullFavorites(supabase, userId);
  const remoteProfile = await pullProfileSettings(supabase, userId);

  const favorites =
    remoteFavorites.length > 0 ? remoteFavorites : localFavorites;

  const settings = remoteProfile?.auroraSettings ?? localSettings;
  const activeLocation = remoteProfile?.activeLocation ?? localActive;

  if (remoteFavorites.length === 0 && localFavorites.length > 0) {
    await pushFavorites(supabase, userId, favorites);
  }

  const hadRemoteProfile = Boolean(
    remoteProfile?.auroraSettings || remoteProfile?.activeLocation
  );
  if (!hadRemoteProfile) {
    await pushProfileSettings(supabase, userId, {
      auroraSettings: settings,
      activeLocation,
    });
  }

  writeFavorites(favorites);
  writeSettings(settings);
  saveActiveLocation(activeLocation);

  return { favorites, settings, activeLocation };
}

/** @deprecated Use hydrateUserData */
export const syncUserData = hydrateUserData;