# Supabase setup

1. Copy `.env.example` → `.env.local` with **Project URL** and **Publishable** key (Settings → API). Add **Secret** key only if you add trusted server admin code — the app’s auth/sync uses the publishable key + user sessions.
2. Authentication → Providers → enable **Email** (magic link / OTP).
3. **Authentication → URL configuration** (this is why magic links sometimes say `localhost:3000`):
   - **Site URL** → your **live** app origin only, e.g. `https://your-app.vercel.app` (not `http://localhost:3000`).
   - **Redirect URLs** → add every callback you use (one per line):
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (and `3001`, `3023`, etc. if you dev on other ports)
   - If the redirect is missing from the list, Supabase **ignores** `emailRedirectTo` and falls back to **Site URL**. A Site URL still set to `localhost:3000` makes emails point there even when users sign in on production.
   - On **Vercel → Environment variables** (Production): `NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app` (same origin as Site URL; optional but recommended for callbacks behind proxies).
4. SQL Editor → run `supabase/migrations/001_initial.sql` (profiles + `favorite_locations` + RLS).
5. Redeploy after env changes. Request a **new** magic link (old emails keep the old URL).

**Routes:** `/login`, `/signup` (same OTP flow), `/account` (signed-in only when Supabase is configured; middleware redirects guests). Magic links hit `/auth/callback` then `/account`.

**Sync:** Guests use `localStorage` only. When signed in, favorites (`favorite_locations`) and settings/active city (`profiles.settings`) load from Postgres and **every change is written to the database immediately** (localStorage is only a mirror after successful save). Run `supabase/migrations/001_initial.sql` in your project.

Without env vars the app stays **guest-only** (no crash).