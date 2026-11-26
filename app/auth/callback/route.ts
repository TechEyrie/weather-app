import { NextResponse, type NextRequest } from "next/server";
import {
  resolveRequestOrigin,
  sanitizeAuthNext,
} from "@/lib/auth-redirect";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = resolveRequestOrigin(request);
  const next = sanitizeAuthNext(searchParams.get("next"));
  const redirectSuccess = `${origin}${next}`;

  const oauthError = searchParams.get("error");
  const oauthDescription = searchParams.get("error_description");
  if (oauthError) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "oauth");
    if (oauthDescription) {
      login.searchParams.set("reason", oauthDescription.slice(0, 240));
    }
    return NextResponse.redirect(login);
  }

  const code = searchParams.get("code");
  if (!code) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "missing_code");
    return NextResponse.redirect(login);
  }

  const response = NextResponse.redirect(redirectSuccess);
  const supabase = createRouteHandlerClient(request, response);
  if (!supabase) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "config");
    return NextResponse.redirect(login);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "exchange");
    login.searchParams.set("reason", error.message.slice(0, 240));
    return NextResponse.redirect(login);
  }

  return response;
}