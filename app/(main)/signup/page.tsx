import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return <LoginForm variant="signup" />;
}