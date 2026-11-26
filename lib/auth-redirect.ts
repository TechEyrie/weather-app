const DEFAULT_AFTER_AUTH = "/account";

/** Safe internal path only — blocks open redirects. */
export function sanitizeAuthNext(next: string | null | undefined): string {
  if (!next) return DEFAULT_AFTER_AUTH;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_AFTER_AUTH;
  }
  if (trimmed.includes("\\") || trimmed.includes("\0") || trimmed.includes(":")) {
    return DEFAULT_AFTER_AUTH;
  }
  return trimmed;
}

/** Origin for magic-link `emailRedirectTo` in the browser. */
export function getClientAuthRedirectOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }
  return getConfiguredSiteUrl() ?? "http://localhost:3000";
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth: "Sign-in was cancelled or denied. Try again.",
  missing_code: "This sign-in link is incomplete or expired. Request a new magic link.",
  exchange: "We could not finish sign-in. Request a new magic link.",
  config: "Supabase is not configured on the server.",
};

export function authErrorMessage(
  code: string | null,
  reason: string | null
): string | null {
  if (!code) return null;
  if (code === "exchange" || code === "oauth") {
    return reason?.trim() || AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.exchange;
  }
  return AUTH_ERROR_MESSAGES[code] ?? "Something went wrong. Try again.";
}

export function buildAuthCallbackUrl(
  origin: string,
  next: string = DEFAULT_AFTER_AUTH
): string {
  const base = origin.replace(/\/$/, "");
  const url = new URL("/auth/callback", base);
  url.searchParams.set("next", sanitizeAuthNext(next));
  return url.toString();
}

/** Request origin behind Vercel / proxies (for route handlers). */
export function resolveRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    if (host) {
      const proto = forwardedProto?.split(",")[0]?.trim() || "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }
  const configured = getConfiguredSiteUrl();
  if (configured) return configured;
  return url.origin.replace(/\/$/, "");
}

export function getConfiguredSiteUrl(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
      : undefined);
  return raw?.replace(/\/$/, "") || undefined;
}