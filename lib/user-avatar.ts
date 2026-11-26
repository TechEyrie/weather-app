import type { User } from "@supabase/supabase-js";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }
  const one = parts[0] ?? "";
  return (one.length >= 2 ? one.slice(0, 2) : one.slice(0, 1)).toUpperCase() || "?";
}

export function getUserAvatarUrl(user: User | null): string | null {
  if (!user?.user_metadata || typeof user.user_metadata !== "object") return null;
  const meta = user.user_metadata as Record<string, unknown>;
  const avatar =
    typeof meta.avatar_url === "string"
      ? meta.avatar_url
      : typeof meta.picture === "string"
        ? meta.picture
        : null;
  return avatar?.trim() || null;
}

export function getUserInitials(email: string | null, user: User | null): string {
  if (!email) return "?";
  const meta = user?.user_metadata;
  if (meta && typeof meta === "object" && typeof meta.full_name === "string") {
    const fromName = initialsFromName(meta.full_name);
    if (fromName !== "?") return fromName;
  }
  const prefix = email.split("@")[0]?.trim() ?? "";
  if (prefix.length >= 2) return prefix.slice(0, 2).toUpperCase();
  return prefix.slice(0, 1).toUpperCase() || "?";
}