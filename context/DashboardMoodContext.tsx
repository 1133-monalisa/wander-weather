"use client";

import React, { createContext, useContext } from "react";
import { useDashboardMood } from "@/hooks/useDashboardMood";

type DashboardMoodContextValue = ReturnType<typeof useDashboardMood>;

const DashboardMoodContext = createContext<DashboardMoodContextValue | null>(
  null
);

export function DashboardMoodProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useDashboardMood();
  return (
    <DashboardMoodContext.Provider value={value}>
      {children}
    </DashboardMoodContext.Provider>
  );
}

export function useDashboardMoodContext() {
  const ctx = useContext(DashboardMoodContext);
  if (!ctx) {
    throw new Error(
      "useDashboardMoodContext must be used within DashboardMoodProvider"
    );
  }
  return ctx;
}
