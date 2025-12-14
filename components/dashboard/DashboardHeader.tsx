import React, { useState } from "react";
import {
  MapPin,
  RefreshCw,
  Search,
  Loader2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardHeaderProps {
  onSearch: (query: string) => void;
  locationLabel: string;
  loading: boolean;
  error: string;
  theme: any;
}

export function DashboardHeader({
  onSearch,
  locationLabel,
  loading,
  error,
  theme,
}: DashboardHeaderProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  return (
    <section className="px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-[72px] md:top-[80px] z-30">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/75 backdrop-blur-xl shadow-sm">
            <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="mt-1 flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                      {locationLabel || "Search a place to start"}
                    </p>
                    {locationLabel && (
                      <span className="hidden sm:inline-flex text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        7-day forecast + AI plan
                      </span>
                    )}
                  </div>
                </div>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={() =>
                    locationLabel && onSearch(locationLabel.split(",")[0])
                  }
                  disabled={loading || !locationLabel}
                  className={`h-10 px-3 rounded-full bg-white border border-slate-200 text-slate-900 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                    loading || !locationLabel
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search a place (e.g., Lakeside Pokhara, Thamel Kathmandu)"
                    className="w-full h-12 pl-11 pr-4 rounded-[999px] outline-none bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`h-12 px-6 rounded-[999px] text-white font-bold shadow-lg shadow-slate-200 hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                    theme.accentBg
                  } ${
                    loading
                      ? "opacity-70 cursor-not-allowed hover:-translate-y-0"
                      : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Working…
                    </>
                  ) : (
                    <>
                      Analyze
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Pokhara",
                  "Bhaktapur",
                  "Kathmandu",
                  "Nagarkot",
                  "Lumbini",
                  "Patan",
                ].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setQuery(p);
                      onSearch(p);
                    }}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-4 rounded-2xl border border-red-200 bg-white shadow-sm"
            >
              <div className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-900">Error</p>
                  <p className="mt-1 text-sm text-slate-600 break-words whitespace-pre-wrap">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
