"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import {
  DashboardMoodProvider,
  useDashboardMoodContext,
} from "@/context/DashboardMoodContext";
import { useAuth } from "@/context/AuthContext";

function ProtectedLayoutShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, sessionVerified, sessionLoading } = useAuth();
  const { mood, theme, changeMood } = useDashboardMoodContext();
  const navbar = (
    <Suspense
      fallback={
        <div
          className={`fixed top-0 w-full h-20 md:h-24 bg-white/80 backdrop-blur-xl border-b ${theme.border}`}
        />
      }
    >
      <DashboardNavbar mood={mood} theme={theme} onChangeMood={changeMood} />
    </Suspense>
  );

  const isChecking = loading || sessionLoading;
  const isAuthed = Boolean(user && sessionVerified);

  useEffect(() => {
    if (isChecking) return;
    if (!isAuthed) {
      router.replace("/auth/login");
    }
  }, [isChecking, isAuthed, router]);

  if (isChecking || !isAuthed) {
    return (
      <div
        className={`min-h-screen ${theme.pageBg} transition-colors duration-700 antialiased font-sans selection:${theme.accentBg} selection:text-white`}
      >
        {navbar}

        <main className="pt-20 md:pt-24">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
              <div className="h-6 w-40 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded-2xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-28 rounded-2xl bg-slate-100 border border-slate-200"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.pageBg} transition-colors duration-700 antialiased font-sans selection:${theme.accentBg} selection:text-white`}
    >
      {navbar}
      <main className="pt-20 md:pt-24">{children}</main>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardMoodProvider>
      <ProtectedLayoutShell>{children}</ProtectedLayoutShell>
    </DashboardMoodProvider>
  );
}
