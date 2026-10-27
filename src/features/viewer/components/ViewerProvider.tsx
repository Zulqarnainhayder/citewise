"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ViewerTarget } from "../types";

type ViewerContextValue = {
  target: ViewerTarget | null;
  open: (target: ViewerTarget) => void;
  close: () => void;
};

const ViewerContext = createContext<ViewerContextValue | null>(null);

/** Shares "which PDF page is open" between the places that open it and the panel. */
export function ViewerProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ViewerTarget | null>(null);
  const close = useCallback(() => setTarget(null), []);
  const value = useMemo(() => ({ target, open: setTarget, close }), [target, close]);
  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  const value = useContext(ViewerContext);
  if (!value) throw new Error("useViewer must be used inside a ViewerProvider");
  return value;
}
