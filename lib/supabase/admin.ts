import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseSecretKey,
  getSupabaseUrl,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/env";

/**
 * Service-role client — bypasses RLS. Use only in trusted server code
 * (scripts, webhooks). The main app uses the publishable key + user sessions.
 */
export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }
  try {
    return createClient(getSupabaseUrl()!, getSupabaseSecretKey()!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch {
    return null;
  }
}