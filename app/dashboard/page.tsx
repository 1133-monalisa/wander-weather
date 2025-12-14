"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/landing-page/Navbar";
import Footer from "@/components/landing-page/Footer";
import { Mood, MOOD_THEMES } from "@/lib/mood";
import { useWeather } from "@/hooks/useWeather";
import { useRouter } from "next/navigation";

// Extracted Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { MapSection } from "@/components/dashboard/MapSection";
import { WeatherCharts } from "@/components/dashboard/WeatherCharts";
import { DailyForecast } from "@/components/dashboard/DailyForecast";
import { AiPlanSection } from "@/components/dashboard/AiPlanSection";

export default function DashboardPage() {
  const [mood, setMood] = useState<Mood>("calm");
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  const theme = MOOD_THEMES[mood];

  // Auth Check
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/verify-session");
        const data = await res.json();
        if (res.ok && data.isLogged) {
          setIsVerified(true);
        } else {
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Session verification failed", err);
        router.push("/auth/login");
      }
    };
    verifySession();

    const saved = localStorage.getItem("userMood") as Mood | null;
    if (saved && MOOD_THEMES[saved]) setMood(saved);
  }, [router]);

  const changeMood = (newMood: Mood) => {
    setMood(newMood);
    localStorage.setItem("userMood", newMood);
  };

  // Logic Hook
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

  if (!isVerified) return null;

  return (
    <div
      className={`min-h-screen ${theme.pageBg} transition-colors duration-700 antialiased font-sans selection:${theme.accentBg} selection:text-white`}
    >
      <Navbar
        mood={mood}
        theme={theme}
        onChangeMood={changeMood}
        variant="dashboard"
      />

      <main className="pt-22 md:pt-24">
        <DashboardHeader
          onSearch={run}
          locationLabel={locationLabel}
          loading={loading}
          error={error}
          theme={theme}
        />

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
      </main>

      <Footer theme={theme} />
    </div>
  );
}
