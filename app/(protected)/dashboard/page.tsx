"use client";

import React, { useMemo } from "react";

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

export default function DashboardPage() {
  const { theme } = useDashboardMoodContext();
  const {
    weatherPayload,
    suggestion,
    loading,
    error,
    aiPins,
    activitiesList,
    packingList,
    run,
  } = useWeather();

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

  return (
    <>
      <DashboardHeader
        onSearch={run}
        locationLabel={locationLabel}
        loading={loading}
        error={error}
        theme={theme}
      />

      {showSkeleton ? (
        <DashboardPageSkeleton />
      ) : (
        <section className="px-4 sm:px-6 md:px-8 pb-14">
          <div className="max-w-7xl mx-auto mt-6 space-y-8">
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
            />
          </div>
        </section>
      )}

      <Footer theme={theme} />
    </>
  );
}
