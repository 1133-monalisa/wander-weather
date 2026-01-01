import React from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Trash2,
  ArrowRight,
  CloudSun,
  Map as MapIcon,
  CheckSquare,
  Package,
} from "lucide-react";
import type { Trip } from "@/types/firebase";
import { formatTemp, getWeatherEmoji } from "@/lib/weather-utils";
import { cn } from "@/lib/utils"; // Standard shadcn utility
import type { MoodTheme } from "@/lib/mood";

function formatSavedAt(createdAt?: any) {
  if (!createdAt) return "Recent";
  const ms =
    typeof createdAt === "number"
      ? createdAt
      : createdAt?.toMillis?.() || createdAt?.seconds * 1000;
  if (!ms) return "Recent";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Improved Skeleton with better shape matching
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="space-y-3">
        <div className="h-5 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-4 w-1/2 rounded-lg bg-slate-50 animate-pulse" />
        <div className="pt-4 flex gap-3">
          <div className="h-8 w-16 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-8 w-16 rounded-full bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SavedTripsSection({
  trips,
  loading,
  error,
  onSelectTrip,
  onDeleteTrip,
  theme,
}: {
  trips: Trip[];
  loading: boolean;
  error: string;
  onSelectTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  theme?: MoodTheme;
}) {
  const hasTrips = trips.length > 0;
  const accentText = theme?.accentText ?? "text-indigo-600";
  const accentSoftBg = theme?.softAccentBg ?? "bg-indigo-50";

  return (
    <section className="space-y-6">
      {/* Header - More Professional Typography */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Saved trips
            <span
              className={cn(
                "ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ring-slate-200/70",
                accentSoftBg,
                accentText
              )}
            >
              {trips.length}
            </span>
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Your weather-optimized travel library.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div className="relative">
        {loading && !hasTrips ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !hasTrips ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <MapPin className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Start your adventure
            </h3>
            <p className="mx-auto mt-2 max-w-[240px] text-sm text-slate-500">
              Plan a trip and save it to see your weather-aware itinerary here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const temp = trip.weatherPayload?.weather?.current?.temp ?? null;
              const code =
                trip.weatherPayload?.weather?.current?.weather?.[0]?.code ??
                null;
              const title = trip.locationLabel || "Untitled Trip";

              return (
                <div
                  key={trip.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-black/5"
                >
                  {/* Card Content Area */}
                  <div
                    className="cursor-pointer p-5"
                    onClick={() => onSelectTrip(trip)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className={cn("flex items-center gap-1.5", accentText)}>
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Destination
                          </span>
                        </div>
                        <h3 className="line-clamp-1 text-md font-extrabold text-slate-900 transition-colors">
                          {title}
                        </h3>
                      </div>

                      {/* Weather Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-inset ring-slate-200 group-hover:bg-slate-100 group-hover:ring-slate-200 transition-colors">
                          <span className="text-sm">
                            {code != null ? getWeatherEmoji(code) : "—"}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {temp != null ? formatTemp(temp) : "--"}
                          </span>
                        </div>
                        <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {formatSavedAt(trip.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="mt-6 flex items-center gap-4 border-t border-slate-50 pt-4">
                      <StatItem
                        icon={<MapIcon className="h-3.5 w-3.5" />}
                        count={trip.aiPins?.length}
                        label="Spots"
                      />
                      <StatItem
                        icon={<CheckSquare className="h-3.5 w-3.5" />}
                        count={trip.activities?.length}
                        label="Acts"
                      />
                      <StatItem
                        icon={<Package className="h-3.5 w-3.5" />}
                        count={trip.packing?.length}
                        label="Items"
                      />
                    </div>
                  </div>

                  {/* Actions Overlay / Footer */}
                  <div className="flex items-center justify-between bg-slate-50/50 px-5 py-3 border-t border-slate-100 group-hover:bg-slate-50 transition-colors">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${title}"?`))
                          onDeleteTrip(trip.id);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>

                    <button
                      onClick={() => onSelectTrip(trip)}
                      className={cn("flex items-center gap-1 text-xs font-bold", accentText)}
                    >
                      View Trip
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// Helper component for cleaner stats
function StatItem({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count?: number;
  label: string;
}) {
  if (!count) return null;
  return (
    <div className="flex items-center gap-1.5 text-slate-500">
      <div className="text-slate-400">{icon}</div>
      <span className="text-xs font-bold text-slate-700">{count}</span>
      <span className="hidden text-[10px] font-medium text-slate-400 sm:inline">
        {label}
      </span>
    </div>
  );
}
