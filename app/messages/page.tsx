"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useDashboardMood } from "@/hooks/useDashboardMood";

function MessagesPageContent() {
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mood, theme, changeMood } = useDashboardMood();

  const activeUserId = searchParams.get("id");

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/verify-session");
        const data = await res.json();
        if (res.ok && data.isLogged) {
          setIsVerified(true);
        } else {
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Session verification failed", err);
        router.push("/auth/login");
      }
    };
    verifySession();
  }, [router]);

  const handleActiveUserChange = useCallback(
    (userId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (userId) {
        params.set("id", userId);
      } else {
        params.delete("id");
      }
      const query = params.toString();
      router.replace(query ? `/messages?${query}` : "/messages");
    },
    [router, searchParams]
  );

  if (!isVerified) return null;

  return (
    <div
      className={`min-h-screen ${theme.pageBg} transition-colors duration-700 antialiased font-sans selection:${theme.accentBg} selection:text-white`}
    >
      <DashboardNavbar mood={mood} theme={theme} onChangeMood={changeMood} />

      <main className="pt-20">
        <section className="h-[calc(100vh-5rem)] px-4 sm:px-6 md:px-8">
          <div className="h-full">
            <ChatPanel
              activeUserId={activeUserId}
              onActiveUserChange={handleActiveUserChange}
              theme={theme}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MessagesPageContent />
    </Suspense>
  );
}
