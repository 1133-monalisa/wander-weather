import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Map as MapIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherPayload } from "@/types/weather";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-full w-full rounded-md bg-slate-100 animate-pulse" />
  ),
});

interface MapSectionProps {
  loading: boolean;
  weatherPayload: WeatherPayload | null;
  locationLabel: string;
  aiPins: any[];
}

export function MapSection({
  loading,
  weatherPayload,
  locationLabel,
  aiPins,
}: MapSectionProps) {
  const [activePinIndex, setActivePinIndex] = useState<number | null>(null);
  const hasCoordinates = !!weatherPayload?.location?.lat;

  // LAYOUT LOGIC:
  // Mobile: 'h-auto' allows elements to stack naturally with their own defined heights.
  // Desktop (lg): 'h-[600px]' locks the side-by-side layout to a nice fixed height.
  const containerClass =
    hasCoordinates || loading ? "h-auto lg:h-[600px]" : "h-auto";

  return (
    <motion.div
      layout
      className={`grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${containerClass}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <>
            {/* Loading State: Map (Left/Top) */}
            <motion.div
              key="map-loading-left"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              // Mobile: h-[400px] fixed height. Desktop: h-full (fills the 600px parent)
              className="lg:col-span-8 w-full h-[400px] lg:h-full rounded-md overflow-hidden border border-slate-200/80 bg-slate-50 relative flex flex-col items-center justify-center text-center p-6"
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-3xl animate-pulse" />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75" />
                  <div className="relative h-16 w-16 bg-white rounded-full border-4 border-emerald-50 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Generating Map
                  </h3>
                  <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                    AI is analyzing geography and weather to pinpoint perfect
                    spots...
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Loading State: List (Right/Bottom) */}
            <motion.div
              key="map-loading-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              // Mobile: h-[300px]. Desktop: h-full.
              className="lg:col-span-4 w-full h-[300px] lg:h-full flex flex-col rounded-md border border-slate-200/80 bg-white overflow-hidden shadow-sm p-6 space-y-3"
            >
              <Skeleton className="h-5 w-32 bg-slate-100 mb-2" />
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full rounded-2xl bg-slate-50"
                />
              ))}
            </motion.div>
          </>
        ) : hasCoordinates ? (
          <>
            {/* Active State: Map (Left/Top) */}
            <motion.div
              key="map-active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              // Mobile: h-[450px] (Tall enough to use). Desktop: h-full.
              className="lg:col-span-8 w-full h-[450px] lg:h-full rounded-md overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 relative group"
            >
              <MapView
                lat={weatherPayload!.location.lat!}
                lon={weatherPayload!.location.lon!}
                label={locationLabel}
                pins={aiPins}
                selectedIndex={activePinIndex}
                zoom={13}
                heightClassName="h-full w-full"
              />

              {/* Overlay: "Spots Found" Badge */}
              <div className="absolute top-3 left-12 z-20 flex gap-2">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-slate-700 shadow-lg border border-white/50">
                  {aiPins.length} Spots Found
                </div>
              </div>

              {/* Overlay: "View All" Button */}
              {activePinIndex !== null && (
                <button
                  onClick={() => setActivePinIndex(null)}
                  className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white shadow-xl hover:bg-black transition-all"
                >
                  ← View All
                </button>
              )}
            </motion.div>

            {/* Active State: List (Right/Bottom) */}
            <motion.div
              key="list-active"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              // Mobile: Fixed height (350px) so it's scrollable but doesn't stretch page forever. Desktop: h-full.
              className="lg:col-span-4 w-full h-[350px] lg:h-full flex flex-col rounded-md border border-slate-200/80 bg-white overflow-hidden shadow-sm"
            >
              <div className="px-6 py-5 border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Curated Spots
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    AI Recommended locations
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Scrollable list area */}
              <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50 space-y-3 custom-scrollbar">
                {aiPins.map((pin, i) => {
                  const isActive = activePinIndex === i;
                  return (
                    <div
                      key={i}
                      onClick={() => setActivePinIndex(i)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isActive
                          ? "bg-white border-emerald-500/40 shadow-lg ring-1 ring-emerald-500/20"
                          : "bg-white border-slate-100 hover:shadow-md"
                      }`}
                    >
                      <h4
                        className={`text-sm font-bold ${
                          isActive ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {pin.label}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {pin.popup}
                      </p>
                    </div>
                  );
                })}
                {aiPins.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No spots found yet.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        ) : (
          /* Empty State */
          <motion.div
            key="map-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-1 lg:col-span-12 relative overflow-hidden rounded-md bg-white border border-slate-200 p-8 sm:p-12 shadow-sm"
          >
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3 h-3" />
                  AI Map Generator
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                  Discover hidden gems.
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
                  Search for a city above, and we'll generate an interactive map
                  with curated spots.
                </p>
              </div>
              <div className="text-emerald-100/50">
                <MapPin className="w-32 h-32" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
