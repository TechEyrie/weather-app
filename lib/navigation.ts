export type NavItem = {
  href: string;
  label: string;
  iconSprite: string;
  enabled: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", iconSprite: "#i-grid", enabled: true },
  { href: "/hourly", label: "Hourly", iconSprite: "#i-bell", enabled: true },
  {
    href: "/locations",
    label: "Saved locations",
    iconSprite: "#i-pin",
    enabled: true,
  },
  { href: "/compare", label: "Compare", iconSprite: "#i-wind", enabled: true },
  { href: "/reports", label: "Reports", iconSprite: "#i-chart", enabled: true },
  { href: "/explore", label: "Explore", iconSprite: "#i-globe", enabled: true },
  { href: "/map", label: "Map", iconSprite: "#i-cloud", enabled: true },
  { href: "/alerts", label: "Alerts", iconSprite: "#i-drop", enabled: true },
  { href: "/calendar", label: "Calendar", iconSprite: "#i-cal", enabled: true },
  { href: "/climate", label: "Climate", iconSprite: "#i-climate", enabled: true },
  { href: "/settings", label: "Settings", iconSprite: "#i-gear", enabled: true },
  { href: "/login", label: "Sign in", iconSprite: "#i-out", enabled: true },
];

export const MAIN_NAV_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/login");

export function navTitleForPath(pathname: string): string {
  const item = NAV_ITEMS.find(
    (n) => n.href === pathname || (n.href !== "/" && pathname.startsWith(n.href))
  );
  return item?.label ?? "Aurora Weather";
}