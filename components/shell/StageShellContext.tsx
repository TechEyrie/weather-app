"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type StageShellContextValue = {
  stageStyle: CSSProperties | undefined;
  setStageStyle: (style: CSSProperties | undefined) => void;
  stageClassName: string | undefined;
  setStageClassName: (className: string | undefined) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const StageShellContext = createContext<StageShellContextValue | null>(null);

export function StageShellProvider({ children }: { children: ReactNode }) {
  const [stageStyle, setStageStyle] = useState<CSSProperties | undefined>();
  const [stageClassName, setStageClassName] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const value = useMemo(
    () => ({
      stageStyle,
      setStageStyle,
      stageClassName,
      setStageClassName,
      loading,
      setLoading,
    }),
    [stageStyle, stageClassName, loading]
  );

  return (
    <StageShellContext.Provider value={value}>
      {children}
    </StageShellContext.Provider>
  );
}

export function useStageShell() {
  const ctx = useContext(StageShellContext);
  if (!ctx) throw new Error("useStageShell requires StageShellProvider");
  return ctx;
}