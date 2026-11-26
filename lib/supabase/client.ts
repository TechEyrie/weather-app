import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    return createBrowserClient(getSupabaseUrl()!, getSupabasePublishableKey()!);
  } catch {
    return null;
  }
}