"use client";

import React from "react";

export function DashboardPageSkeleton() {
  return (
    <div className="px-4 sm:px-6 md:px-8 pb-14">
      <div className="max-w-7xl mx-auto mt-6 space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm animate-pulse space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-20 rounded-2xl bg-slate-100 border border-slate-200"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm animate-pulse space-y-3 h-64" />
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm animate-pulse space-y-3 h-64" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm animate-pulse h-80" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm animate-pulse h-64" />
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm animate-pulse h-64" />
        </div>
      </div>
    </div>
  );
}
