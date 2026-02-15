"use client";

export function DashboardPageSkeleton() {
  return (
    <section className="px-4 sm:px-6 md:px-8 pb-14">
      <div className="max-w-[90rem] mx-auto mt-6 space-y-8">
        {/* 7-day forecast hero + strip */}
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-7 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 rounded-full bg-slate-100 animate-pulse" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] items-center mt-5">
            <div className="space-y-4">
              <div className="h-7 w-56 bg-slate-200 rounded animate-pulse" />
              <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <span
                    key={idx}
                    className="h-7 w-20 rounded-full bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="space-y-2 text-right flex-1">
                <div className="h-3 w-14 bg-slate-100 rounded ml-auto animate-pulse" />
                <div className="h-10 w-24 bg-slate-200 rounded ml-auto animate-pulse" />
                <div className="h-3 w-16 bg-slate-100 rounded ml-auto animate-pulse" />
              </div>
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-6">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center gap-3 animate-pulse"
              >
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-10 w-10 rounded-full bg-slate-100" />
                <div className="h-4 w-14 bg-slate-200 rounded" />
                <div className="h-3 w-12 bg-slate-100 rounded" />
              </div>
            ))}
          </div>

          <div className="sm:hidden mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-16 w-full rounded-2xl border border-slate-200 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm p-4 space-y-3 animate-pulse"
            >
              <div className="h-3 w-12 bg-slate-200 rounded" />
              <div className="h-6 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>

        {/* Weather charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm h-80 space-y-4 animate-pulse"
            >
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-64 w-full rounded-2xl bg-slate-50" />
            </div>
          ))}
        </div>

        {/* Map + curated spots */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 w-full h-[420px] lg:h-[500px] rounded-3xl border border-slate-200 bg-slate-50 shadow-sm animate-pulse" />
          <div className="lg:col-span-4 w-full h-[360px] lg:h-[500px] rounded-3xl border border-slate-200 bg-white/80 shadow-sm p-5 space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-20 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* AI plan */}
        <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-7 border-b border-slate-100 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-7 w-20 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-7 w-24 rounded-full bg-slate-50 animate-pulse" />
            </div>
            <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
          </div>

          <div className="p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-8 rounded-xl bg-white border border-slate-200 animate-pulse"
                    />
                  ))}
                </div>
                <div className="h-px bg-slate-200/70" />
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-6 rounded-lg bg-white border border-slate-200 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-100" />
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-5/6 bg-slate-100 rounded" />
                    <div className="h-3 w-4/6 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
