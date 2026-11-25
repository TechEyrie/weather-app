import type { ReactNode } from "react";
import { AuroraMainLayout } from "@/components/shell/AuroraMainLayout";

/** App shell is client-heavy (localStorage, fetch). Avoid fragile SSG on Vercel. */
export const dynamic = "force-dynamic";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <AuroraMainLayout>{children}</AuroraMainLayout>;
}