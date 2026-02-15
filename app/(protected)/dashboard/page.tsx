"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { MapSection } from "@/components/dashboard/MapSection";
import { WeatherCharts } from "@/components/dashboard/WeatherCharts";
import { DailyForecast } from "@/components/dashboard/DailyForecast";
import { AiPlanSection } from "@/components/dashboard/AiPlanSection";
import Footer from "@/components/landing-page/Footer";
import { DashboardPageSkeleton } from "@/components/loading/DashboardPageSkeleton";
import { useDashboardMoodContext } from "@/context/DashboardMoodContext";
import { useWeather } from "@/hooks/useWeather";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/context/AuthContext";
import type { Trip } from "@/types/firebase";

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useDashboardMoodContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    weatherPayload,
    suggestion,
    loading,
    error,
    aiPins,
    activitiesList,
    packingList,
    run,
    applyTrip,
  } = useWeather();
  const { trips, saving: tripsSaving, saveTrip } = useTrips(user?.uid);
  const appliedTripRef = useRef<string | null>(null);
  const tripId = searchParams.get("trip");

  const locationLabel = useMemo(() => {
    if (!weatherPayload?.location?.name) return "";
    const parts = [
      weatherPayload.location.name,
      weatherPayload.location.state,
      weatherPayload.location.country,
    ].filter(Boolean);
    return parts.join(", ");
  }, [weatherPayload]);

  const showSkeleton = loading && !weatherPayload;
  const hasSavableTrip = Boolean(
    user && weatherPayload && locationLabel && suggestion,
  );
  const isTripSaved = useMemo(() => {
    if (!locationLabel || !suggestion) return false;
    return trips.some(
      (trip) =>
        trip.locationLabel === locationLabel && trip.suggestion === suggestion,
    );
  }, [trips, locationLabel, suggestion]);

  const handleSaveTrip = async () => {
    if (!hasSavableTrip || !user || !weatherPayload) return;
    await saveTrip({
      userId: user.uid,
      locationLabel,
      weatherPayload,
      suggestion,
      activities: activitiesList,
      packing: packingList,
      aiPins,
    });
  };

  useEffect(() => {
    if (!tripId || appliedTripRef.current === tripId) return;
    const match = trips.find((trip) => trip.id === tripId);
    if (!match) return;
    applyTrip(match);
    appliedTripRef.current = tripId;
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.replace("/dashboard");
  }, [tripId, trips, applyTrip, router]);

  return (
    <>
      <DashboardHeader
        onSearch={run}
        onSaveTrip={hasSavableTrip ? handleSaveTrip : undefined}
        locationLabel={locationLabel}
        loading={loading}
        savingTrip={tripsSaving}
        savedTrip={isTripSaved}
        saveDisabled={!hasSavableTrip}
        error={error}
        theme={theme}
      />

      {showSkeleton ? (
        <DashboardPageSkeleton />
      ) : (
        <section className="px-4 sm:px-6 md:px-8 pb-14">
          <div className="max-w-[90rem] mx-auto mt-6 space-y-8">
            <DailyForecast daily={weatherPayload?.weather?.daily} />

            <StatsGrid weather={weatherPayload} theme={theme} />

            <WeatherCharts daily={weatherPayload?.weather?.daily} />

            <MapSection
              loading={loading}
              weatherPayload={weatherPayload}
              locationLabel={locationLabel}
              aiPins={aiPins}
            />

            <AiPlanSection
              locationLabel={locationLabel}
              loading={loading}
              suggestion={suggestion}
              activities={activitiesList}
              packing={packingList}
              onSaveTrip={hasSavableTrip ? handleSaveTrip : undefined}
              savingTrip={tripsSaving}
              savedTrip={isTripSaved}
              theme={theme}
            />
          </div>
        </section>
      )}

      <Footer theme={theme} />
    </>
  );
}
