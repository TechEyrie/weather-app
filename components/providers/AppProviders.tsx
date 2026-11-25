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
import type { GeoLocation } from "@/lib/open-meteo";
import { readActiveLocation, saveActiveLocation } from "@/lib/location-storage";
import {
  addFavorite,
  moveFavorite,
  readFavorites,
  removeFavorite,
  writeFavorites,
} from "@/lib/favorites-storage";
import {
  DEFAULT_SETTINGS,
  readSettings,
  writeSettings,
  type AuroraSettings,
} from "@/lib/settings-storage";
import { createClient } from "@/lib/supabase/client";
import {
  pushFavorites,
  pushProfileSettings,
  syncUserData,
} from "@/lib/supabase/sync";

type LocationContextValue = {
  activeLocation: GeoLocation;
  setActiveLocation: (loc: GeoLocation) => void;
  favorites: GeoLocation[];
  addFavorite: (loc: GeoLocation) => void;
  removeFavorite: (id: number) => void;
  moveFavorite: (id: number, direction: "up" | "down") => void;
  replaceFavorites: (list: GeoLocation[]) => void;
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

function LocationProvider({ children }: { children: ReactNode }) {
  const [activeLocation, setActiveLocationState] = useState<GeoLocation>(() =>
    readActiveLocation()
  );
  const [favorites, setFavorites] = useState<GeoLocation[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const setActiveLocation = useCallback((loc: GeoLocation) => {
    setActiveLocationState(loc);
    saveActiveLocation(loc);
  }, []);

  const handleAddFavorite = useCallback((loc: GeoLocation) => {
    setFavorites(addFavorite(loc));
  }, []);

  const handleRemoveFavorite = useCallback((id: number) => {
    setFavorites(removeFavorite(id));
  }, []);

  const handleMoveFavorite = useCallback(
    (id: number, direction: "up" | "down") => {
      setFavorites(moveFavorite(id, direction));
    },
    []
  );

  const replaceFavorites = useCallback((list: GeoLocation[]) => {
    writeFavorites(list);
    setFavorites(list);
  }, []);

  const value = useMemo(
    () => ({
      activeLocation,
      setActiveLocation,
      favorites,
      addFavorite: handleAddFavorite,
      removeFavorite: handleRemoveFavorite,
      moveFavorite: handleMoveFavorite,
      replaceFavorites,
    }),
    [
      activeLocation,
      setActiveLocation,
      favorites,
      handleAddFavorite,
      handleRemoveFavorite,
      handleMoveFavorite,
      replaceFavorites,
    ]
  );

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}

function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AuroraSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettingsState(readSettings());
  }, []);

  const setSettings = useCallback((next: AuroraSettings) => {
    setSettingsState(next);
    writeSettings(next);
  }, []);

  const value = useMemo(
    () => ({ settings, setSettings }),
    [settings, setSettings]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
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

function RemoteSyncEffects() {
  const { user } = useAuth();
  const {
    favorites,
    activeLocation,
    setActiveLocation,
    replaceFavorites,
  } = useLocation();
  const { settings, setSettings } = useSettings();
  const syncedUser = useRef<string | null>(null);
  const pushTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!user?.id) {
      syncedUser.current = null;
      return;
    }
    if (syncedUser.current === user.id) return;

    const supabase = createClient();
    if (!supabase) return;

    void syncUserData(
      supabase,
      user.id,
      readFavorites(),
      readSettings(),
      readActiveLocation()
    ).then((merged) => {
      replaceFavorites(merged.favorites);
      setSettings(merged.settings);
      setActiveLocation(merged.activeLocation);
      syncedUser.current = user.id;
    });
  }, [user?.id, replaceFavorites, setSettings, setActiveLocation]);

  useEffect(() => {
    if (!user?.id || syncedUser.current !== user.id) return;
    const supabase = createClient();
    if (!supabase) return;

    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(() => {
      void pushFavorites(supabase, user.id, favorites).catch(() => {
        /* offline */
      });
      void pushProfileSettings(supabase, user.id, {
        auroraSettings: settings,
        activeLocation,
      }).catch(() => {
        /* offline */
      });
    }, 400);

    return () => {
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    };
  }, [user?.id, favorites, settings, activeLocation]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <LocationProvider>
          <RemoteSyncEffects />
          {children}
        </LocationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}