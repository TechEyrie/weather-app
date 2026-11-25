"use client";

import type { ReactNode } from "react";
import { WeatherSprite } from "@/components/WeatherSprite";
import { AppProviders } from "@/components/providers/AppProviders";
import { AuroraShell } from "@/components/shell/AuroraShell";
import { StageShellProvider } from "@/components/shell/StageShellContext";

export function AuroraMainLayout({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <StageShellProvider>
        <WeatherSprite />
        <AuroraShell>{children}</AuroraShell>
      </StageShellProvider>
    </AppProviders>
  );
}