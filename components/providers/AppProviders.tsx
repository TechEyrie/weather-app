"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_LOCATION, type GeoLocation } from "@/lib/open-meteo";
import { readActiveLocation, saveActiveLocation } from "@/lib/location-storage";
import {
  addFavoriteToList,
  moveFavoriteInList,
  readFavorites,
  removeFavoriteFromList,
  writeFavorites,
} from "@/lib/favorites-storage";
import {
  DEFAULT_SETTINGS,
  readSettings,
  writeSettings,
  type AuroraSettings,
} from "@/lib/settings-storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  hydrateUserData,
  pushFavorites,
  pushProfileSettings,
} from "@/lib/supabase/sync";

type LocationContextValue = {
  activeLocation: GeoLocation;
  setActiveLocation: (loc: GeoLocation) => void;
  favorites: GeoLocation[];
  addFavorite: (loc: GeoLocation) => void;
  removeFavorite: (id: number) => void;
  moveFavorite: (id: number, direction: "up" | "down") => void;
  replaceFavorites: (list: GeoLocation[]) => void;
  dataReady: boolean;
  syncError: string | null;
};

type SettingsContextValue = {
  settings: AuroraSettings;
  setSettings: (next: AuroraSettings) => void;
};

type AuthContextValue = {
  user: User | null;
  email: string | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);
const SettingsContext = createContext<SettingsContextValue | null>(null);
const AuthContext = createContext<AuthContextValue | null>(null);

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation requires AppProviders");
  return ctx;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings requires AppProviders");
  return ctx;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth requires AppProviders");
  return ctx;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshSession = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setUser(null);
      return;
    }
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
  }, []);

  useEffect(() => {
    void refreshSession();
    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const email = user?.email ?? null;

  const value = useMemo(
    () => ({ user, email, signOut, refreshSession }),
    [user, email, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

type UserDataBridgeProps = {
  children: ReactNode;
};

/** Loads guest localStorage or signed-in Supabase; writes go to the active store. */
function UserDataBridge({ children }: UserDataBridgeProps) {
  const { user } = useAuth();
  const [activeLocation, setActiveLocationState] =
    useState<GeoLocation>(DEFAULT_LOCATION);
  const [favorites, setFavorites] = useState<GeoLocation[]>([]);
  const [settings, setSettingsState] = useState<AuroraSettings>(DEFAULT_SETTINGS);
  const [dataReady, setDataReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const hydrateGen = useRef(0);

  const persistFavoritesRemote = useCallback(
    async (list: GeoLocation[]) => {
      if (!user?.id || !isSupabaseConfigured()) return;
      const supabase = createClient();
      if (!supabase) return;
      await pushFavorites(supabase, user.id, list);
      writeFavorites(list);
    },
    [user?.id]
  );

  const persistProfileRemote = useCallback(
    async (patch: {
      auroraSettings?: AuroraSettings;
      activeLocation?: GeoLocation;
    }) => {
      if (!user?.id || !isSupabaseConfigured()) return;
      const supabase = createClient();
      if (!supabase) return;
      await pushProfileSettings(supabase, user.id, patch);
      if (patch.auroraSettings) writeSettings(patch.auroraSettings);
      if (patch.activeLocation) saveActiveLocation(patch.activeLocation);
    },
    [user?.id]
  );

  useEffect(() => {
    const gen = ++hydrateGen.current;
    setDataReady(false);
    setSyncError(null);

    async function run() {
      if (!user?.id || !isSupabaseConfigured()) {
        setActiveLocationState(readActiveLocation());
        setFavorites(readFavorites());
        setSettingsState(readSettings());
        if (gen === hydrateGen.current) setDataReady(true);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        if (gen === hydrateGen.current) setDataReady(true);
        return;
      }

      try {
        const merged = await hydrateUserData(
          supabase,
          user.id,
          readFavorites(),
          readSettings(),
          readActiveLocation()
        );
        if (gen !== hydrateGen.current) return;
        setFavorites(merged.favorites);
        setSettingsState(merged.settings);
        setActiveLocationState(merged.activeLocation);
        setSyncError(null);
      } catch {
        if (gen !== hydrateGen.current) return;
        setSyncError(
          "Could not load your saved data from the cloud. Check Supabase connection and RLS."
        );
        setActiveLocationState(readActiveLocation());
        setFavorites(readFavorites());
        setSettingsState(readSettings());
      } finally {
        if (gen === hydrateGen.current) setDataReady(true);
      }
    }

    void run();
  }, [user?.id]);

  const setActiveLocation = useCallback(
    (loc: GeoLocation) => {
      setActiveLocationState(loc);
      if (user?.id) {
        void persistProfileRemote({
          activeLocation: loc,
          auroraSettings: settings,
        }).catch(() =>
          setSyncError("Failed to save active location to your account.")
        );
      } else {
        saveActiveLocation(loc);
      }
    },
    [user?.id, settings, persistProfileRemote]
  );

  const setSettings = useCallback(
    (next: AuroraSettings) => {
      setSettingsState(next);
      if (user?.id) {
        void persistProfileRemote({
          auroraSettings: next,
          activeLocation,
        }).catch(() => setSyncError("Failed to save settings to your account."));
      } else {
        writeSettings(next);
      }
    },
    [user?.id, activeLocation, persistProfileRemote]
  );

  const commitFavorites = useCallback(
    (next: GeoLocation[]) => {
      setFavorites(next);
      if (user?.id) {
        void persistFavoritesRemote(next).catch(() =>
          setSyncError("Failed to save favorites to your account.")
        );
      } else {
        writeFavorites(next);
      }
    },
    [user?.id, persistFavoritesRemote]
  );

  const addFavorite = useCallback(
    (loc: GeoLocation) => {
      commitFavorites(addFavoriteToList(favorites, loc));
    },
    [favorites, commitFavorites]
  );

  const removeFavorite = useCallback(
    (id: number) => {
      commitFavorites(removeFavoriteFromList(favorites, id));
    },
    [favorites, commitFavorites]
  );

  const moveFavorite = useCallback(
    (id: number, direction: "up" | "down") => {
      commitFavorites(moveFavoriteInList(favorites, id, direction));
    },
    [favorites, commitFavorites]
  );

  const replaceFavorites = useCallback(
    (list: GeoLocation[]) => {
      commitFavorites(list);
    },
    [commitFavorites]
  );

  const locationValue = useMemo(
    () => ({
      activeLocation,
      setActiveLocation,
      favorites,
      addFavorite,
      removeFavorite,
      moveFavorite,
      replaceFavorites,
      dataReady,
      syncError,
    }),
    [
      activeLocation,
      setActiveLocation,
      favorites,
      addFavorite,
      removeFavorite,
      moveFavorite,
      replaceFavorites,
      dataReady,
      syncError,
    ]
  );

  const settingsValue = useMemo(
    () => ({ settings, setSettings }),
    [settings, setSettings]
  );

  return (
    <SettingsContext.Provider value={settingsValue}>
      <LocationContext.Provider value={locationValue}>
        {children}
      </LocationContext.Provider>
    </SettingsContext.Provider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UserDataBridge>{children}</UserDataBridge>
    </AuthProvider>
  );
}