/** Supabase project URL (Dashboard → Settings → API). */
export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

/**
 * Browser-safe key (Dashboard → API → Publishable).
 * Falls back to legacy anon key name.
 */
export function getSupabasePublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    undefined
  );
}

/**
 * Server-only secret key (Dashboard → API → Secret). Never expose to the client.
 * Falls back to legacy service_role name. Optional — RLS + user session uses publishable only.
 */
export function getSupabaseSecretKey(): string | undefined {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    undefined
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseSecretKey());
}