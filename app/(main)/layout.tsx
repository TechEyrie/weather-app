import type { ReactNode } from "react";
import { AuroraMainLayout } from "@/components/shell/AuroraMainLayout";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <AuroraMainLayout>{children}</AuroraMainLayout>;
}