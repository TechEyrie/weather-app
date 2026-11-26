"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type LoginFormProps = {
  variant?: "login" | "signup";
};

const copy = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in",
    lead: "We'll email you a secure magic link. No password to remember.",
    submit: "Send sign-in link",
    submitBusy: "Sending link…",
    success: "Check your email for your sign-in link.",
    switchPrompt: "New here?",
    switchLink: "Sign up",
    switchHref: "/signup",
    inputId: "signin-email",
  },
  signup: {
    eyebrow: "Create account",
    title: "Sign up",
    lead: "Enter your email and we'll send a one-time link to create your Aurora account.",
    submit: "Send sign-up link",
    submitBusy: "Sending link…",
    success: "Check your email for your sign-up link.",
    switchPrompt: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/login",
    inputId: "signup-email",
  },
} as const;

export function LoginForm({ variant = "login" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const configured = isSupabaseConfigured();
  const text = copy[variant];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    const supabase = createClient();
    if (!supabase) return;

    setSubmitting(true);
    setMessage(null);
    setSuccess(false);
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
    setSuccess(true);
    setMessage(text.success);
  }

  if (!configured) {
    return (
      <section className="page-panel auth-page" aria-labelledby="auth-title">
        <p className="chip auth-chip">{text.eyebrow}</p>
        <h1 id="auth-title" className="page-title">
          {text.title}
        </h1>
        <p className="page-lead auth-lead">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in your environment to
          enable accounts. The app still works as a guest without them.
        </p>
      </section>
    );
  }

  return (
    <section className="page-panel auth-page" aria-labelledby="auth-title">
      <p className="chip auth-chip">{text.eyebrow}</p>
      <h1 id="auth-title" className="page-title">
        {text.title}
      </h1>
      <p className="page-lead auth-lead">{text.lead}</p>

      <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
        <label className="auth-label" htmlFor={text.inputId}>
          Email address
        </label>
        <input
          id={text.inputId}
          className="login-input glass-input auth-input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={submitting}
        />
        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? text.submitBusy : text.submit}
        </button>
      </form>

      {message ? (
        <p
          className={
            success ? "auth-feedback auth-feedback--ok" : "auth-feedback auth-feedback--err"
          }
          role={success ? "status" : "alert"}
        >
          {message}
        </p>
      ) : null}

      <p className="auth-switch">
        {text.switchPrompt}{" "}
        <Link href={text.switchHref}>{text.switchLink}</Link>
      </p>
    </section>
  );
}