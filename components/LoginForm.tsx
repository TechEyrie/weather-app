"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type LoginFormProps = {
  variant?: "login" | "signup";
};

export function LoginForm({ variant = "login" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    const supabase = createClient();
    if (!supabase) return;

    setSubmitting(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
      },
    });
    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Check your email for a sign-in link.");
  }

  if (!configured) {
    return (
      <section className="login-panel" aria-labelledby="login-title">
        <h1 id="login-title">Sign in</h1>
        <p className="login-message">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment to
          enable email sign-in. The app works as a guest without them.
        </p>
      </section>
    );
  }

  return (
    <section className="login-panel" aria-labelledby="login-title">
      <h1 id="login-title">Sign in</h1>
      <p className="login-lead">
        {variant === "signup"
          ? "New here? Same magic link — we create your account on first sign-in."
          : "We'll email you a one-time sign-in link."}
      </p>
      <form className="login-form" onSubmit={(e) => void handleSubmit(e)}>
        <label className="login-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          className="login-input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button className="login-submit" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send magic link"}
        </button>
      </form>
      {message ? <p className="login-message">{message}</p> : null}
      {variant === "login" ? (
        <p className="login-lead">
          No account? Use <a href="/signup">Sign up</a> — same email link flow.
        </p>
      ) : null}
    </section>
  );
}