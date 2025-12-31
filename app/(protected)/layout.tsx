"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DNA, ThreeDots } from "react-loader-spinner";

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
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-4">
          <DNA height={200} width={200} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.pageBg} transition-colors duration-700 antialiased font-sans selection:${theme.accentBg} selection:text-white`}
    >
      {navbar}
      <main className="pt-20">{children}</main>
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
