"use client";

import React from "react";

export function MessagesPageSkeleton() {
  return (
    <section className="h-[calc(100vh-5rem)] px-4 sm:px-6 md:px-8">
      <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4">
        <div className="border border-slate-200 rounded-2xl bg-white/80 p-4 space-y-3 animate-pulse">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-10 w-full bg-slate-100 rounded-full" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-12 w-full bg-slate-100 rounded-xl"
              />
            ))}
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl bg-white/80 p-4 space-y-3 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-10 w-full bg-slate-100 rounded-full" />
          <div className="h-[60vh] w-full bg-slate-50 rounded-2xl" />
        </div>
      </div>
    </section>
  );
}
