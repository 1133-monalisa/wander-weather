"use client";

export function MessagesPageSkeleton() {
  return (
    <section className="h-[calc(100vh-5rem)] p-4">
      <div className="h-full max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4 animate-pulse">
        {/* LEFT COLUMN */}
        <div className="border border-slate-200 rounded-2xl bg-white/80 flex flex-col">
          <div className="border-b border-slate-200/80 bg-white/85 px-5 pt-5 pb-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-5 w-28 bg-slate-100 rounded" />
              </div>
              <div className="h-10 w-10 rounded-2xl bg-slate-100" />
            </div>
            <div className="h-3 w-40 bg-slate-100 rounded" />
            <div className="h-11 w-full bg-slate-100 rounded-2xl" />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-slate-100" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                      <div className="h-3 w-10 bg-slate-100 rounded" />
                    </div>
                    <div className="h-3 w-44 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="border border-slate-200 rounded-2xl bg-white/80 flex flex-col">
          <div className="border-b border-slate-200/80 bg-white/85 px-5 py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-100" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-44 bg-slate-100 rounded" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-200" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/60 px-4 sm:px-5 py-4 pb-28 sm:pb-32 space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div className="max-w-[75%] sm:max-w-[68%] space-y-2">
                  <div
                    className={`h-14 w-full rounded-2xl ${
                      idx % 2 === 0
                        ? "bg-slate-200 rounded-tl-sm"
                        : "bg-slate-300 rounded-tr-sm"
                    }`}
                  />
                  <div className="h-3 w-12 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200/80 bg-white/95 px-3 sm:px-4 pt-3 pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 h-12 rounded-3xl border border-slate-200 bg-slate-50" />
              <div className="h-12 w-12 sm:w-24 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
