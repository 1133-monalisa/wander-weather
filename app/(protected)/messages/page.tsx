"use client";

import React, { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ChatPanel } from "@/components/chat/ChatPanel";
import { MessagesPageSkeleton } from "@/components/loading/MessagesPageSkeleton";
import { useDashboardMoodContext } from "@/context/DashboardMoodContext";

function MessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useDashboardMoodContext();

  const activeUserId = searchParams.get("id");

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

  return (
    <section className="h-[calc(100vh-8rem)] px-4 sm:px-6 md:px-8">
      <div className="h-full">
        <ChatPanel
          activeUserId={activeUserId}
          onActiveUserChange={handleActiveUserChange}
          theme={theme}
        />
      </div>
    </section>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesPageSkeleton />}>
      <MessagesPageContent />
    </Suspense>
  );
}
