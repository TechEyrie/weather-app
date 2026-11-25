"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/lib/navigation";
import { useAuth } from "@/components/providers/AppProviders";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <span className="pip" aria-hidden />
      <Link className="logo" href="/" aria-label="Aurora Weather home">
        <svg width="40" height="40" aria-hidden>
          <use href="#i-logo" />
        </svg>
      </Link>
      <nav className="nav">
        {MAIN_NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={item.enabled ? undefined : "nav-coming"}
              title={item.enabled ? item.label : `${item.label} — coming soon`}
            >
              <svg aria-hidden>
                <use href={item.iconSprite} />
              </svg>
            </Link>
          );
        })}
      </nav>
      {user ? (
        <button
          type="button"
          className="logout"
          onClick={() => {
            void signOut();
          }}
          aria-label="Sign out"
        >
          <svg aria-hidden>
            <use href="#i-out" />
          </svg>
          <span>Sign out</span>
        </button>
      ) : (
        <Link className="logout" href="/login" aria-label="Sign in">
          <svg aria-hidden>
            <use href="#i-out" />
          </svg>
          <span>Sign in</span>
        </Link>
      )}
    </aside>
  );
}