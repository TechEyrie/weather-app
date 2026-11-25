# Supabase setup

1. Copy `.env.example` → `.env.local` with **Project URL** and **anon key** (Settings → API).
2. Authentication → Providers → enable **Email** (magic link / OTP).
3. Authentication → URL configuration → add redirect: `http://localhost:3000/auth/callback` (and your production URL).
4. SQL Editor → run `supabase/migrations/001_initial.sql` (profiles + `favorite_locations` + RLS).

**Routes:** `/login`, `/signup` (same OTP flow), `/account` (signed-in only when Supabase is configured; middleware redirects guests). Magic links hit `/auth/callback` then `/account`.

**Sync:** On first sign-in, local favorites/settings/active city merge to Postgres; while signed in, changes debounce-push to Supabase. Sign-out keeps local `localStorage` copy.

Without env vars the app stays **guest-only** (no crash).