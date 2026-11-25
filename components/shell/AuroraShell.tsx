"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { AppHeader } from "@/components/shell/AppHeader";
import { useStageShell } from "@/components/shell/StageShellContext";

export function AuroraShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { stageStyle, stageClassName, loading } = useStageShell();
  const layoutClass =
    stageClassName ?? (pathname === "/" ? undefined : "scroll-stage");
  const stageClasses = ["stage", loading ? "is-loading" : "", layoutClass]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={stageClasses} style={stageStyle}>
      <Sidebar />
      <AppHeader />
      {children}
    </div>
  );
}