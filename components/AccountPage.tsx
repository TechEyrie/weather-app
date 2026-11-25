"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AppProviders";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function AccountPage() {
  const { user, email, signOut } = useAuth();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <section className="page-panel" aria-labelledby="account-title">
        <h1 id="account-title" className="page-title">
          Account
        </h1>
        <p className="login-message">
          Add Supabase env vars to enable accounts. See <code>SUPABASE.md</code>.
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-panel" aria-labelledby="account-title">
        <h1 id="account-title" className="page-title">
          Account
        </h1>
        <p className="page-lead">You are not signed in.</p>
        <Link href="/login" className="chip hourly-link">
          Sign in →
        </Link>
      </section>
    );
  }

  return (
    <section className="page-panel" aria-labelledby="account-title">
      <h1 id="account-title" className="page-title">
        Account
      </h1>
      <dl className="account-dl">
        <dt>Email</dt>
        <dd>{email}</dd>
        <dt>User id</dt>
        <dd className="account-mono">{user.id}</dd>
      </dl>
      <p className="page-lead">
        Favorites, units, and active city sync to Supabase while signed in.
      </p>
      <div className="account-actions">
        <Link href="/settings" className="chip">
          Settings
        </Link>
        <button
          type="button"
          className="chip settings-danger"
          onClick={() => {
            void signOut();
          }}
        >
          Sign out
        </button>
      </div>
    </section>
  );
}