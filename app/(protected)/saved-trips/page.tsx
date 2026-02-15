"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SavedTripsSection } from "@/components/dashboard/SavedTripsSection";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/context/AuthContext";
import { useDashboardMoodContext } from "@/context/DashboardMoodContext";
import { Button } from "@/components/ui/button";
import { Plus, Search, SlidersHorizontal, ChevronLeft, X } from "lucide-react";
import type { Trip } from "@/types/firebase";

export default function SavedTripsPage() {
  const { user } = useAuth();
  const { theme } = useDashboardMoodContext();
  const router = useRouter();
  const { trips, loading, error, removeTrip } = useTrips(user?.uid);

  // UX State for search
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectTrip = (trip: Trip) => {
    router.push(`/dashboard?trip=${trip.id}`);
  };

  // Filter trips based on search
  const filteredTrips = trips.filter((trip) =>
    trip.locationLabel?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen p-4">
      <section className="p-4">
        <div className="max-w-[90rem] mx-auto space-y-8">
          {/* Hero Header Section */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Trip Library
              </h1>
              <p className="mt-2 text-base text-slate-500">
                View and manage your AI-generated itineraries and weather-ready
                plans.
              </p>
            </div>

            <Button
              onClick={() => router.push("/dashboard")}
              className={`w-full md:w-auto rounded-2xl ${theme.accentBg} px-6 py-6 font-bold text-white shadow-lg shadow-black/10 hover:opacity-90 transition-all sm:py-4 cursor-pointer`}
            >
              <Plus className="mr-2 h-5 w-5" />
              New Adventure
            </Button>
          </div>

          {/* Search & Filter Bar - Pure UX Improvement */}
          <div
            className={`flex gap-3 p-2 rounded-2xl border ${theme.border} bg-white/50 backdrop-blur-md`}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-10 pr-10 py-2 text-sm outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="h-px sm:h-8 sm:w-px bg-slate-200 self-center" />
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 font-semibold gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="relative">
            {/* Subtle background glow for depth */}
            <div
              className={`absolute -top-24 -left-24 h-96 w-96 rounded-full ${theme.softAccentBg} opacity-60 blur-3xl -z-10`}
            />

            <SavedTripsSection
              trips={filteredTrips}
              loading={loading}
              error={error}
              onSelectTrip={handleSelectTrip}
              onDeleteTrip={removeTrip}
              theme={theme}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
