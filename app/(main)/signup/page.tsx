import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <section className="page-panel auth-page">
          <p className="page-lead">Loading…</p>
        </section>
      }
    >
      <LoginForm variant="signup" />
    </Suspense>
  );
}