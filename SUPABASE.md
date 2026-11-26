# Supabase setup

1. Copy `.env.example` → `.env.local` with **Project URL** and **Publishable** key (Settings → API). Add **Secret** key only if you add trusted server admin code — the app’s auth/sync uses the publishable key + user sessions.
2. Authentication → Providers → enable **Email** (magic link / OTP).
3. Authentication → URL configuration → add redirect: `http://localhost:3000/auth/callback` (and your production URL).
4. SQL Editor → run `supabase/migrations/001_initial.sql` (profiles + `favorite_locations` + RLS).

**Routes:** `/login`, `/signup` (same OTP flow), `/account` (signed-in only when Supabase is configured; middleware redirects guests). Magic links hit `/auth/callback` then `/account`.

**Sync:** Guests use `localStorage` only. When signed in, favorites (`favorite_locations`) and settings/active city (`profiles.settings`) load from Postgres and **every change is written to the database immediately** (localStorage is only a mirror after successful save). Run `supabase/migrations/001_initial.sql` in your project.

Without env vars the app stays **guest-only** (no crash).