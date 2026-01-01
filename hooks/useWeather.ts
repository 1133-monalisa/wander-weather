"use client";

import { useState } from "react";
import { WeatherPayload } from "@/types/weather";
import type { Trip } from "@/types/firebase";

// --- FIX: Import from the correct files ---
import { normalizeAiToMarkdown } from "@/lib/ai-parsing";
import { extractApiErrorMessage } from "@/lib/weather-utils";

export function useWeather() {
  const [weatherPayload, setWeatherPayload] = useState<WeatherPayload | null>(
    null
  );
  const [suggestion, setSuggestion] = useState<string>("");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [error, setError] = useState<string>("");

  const [aiPins, setAiPins] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<string[]>([]);
  const [packingList, setPackingList] = useState<string[]>([]);

  const busy = loadingWeather || loadingSuggestion;

  async function fetchWeather(place: string) {
    setError("");
    setSuggestion("");
    setWeatherPayload(null);
    setLoadingWeather(true);
    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(place)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractApiErrorMessage(data));
      setWeatherPayload(data as WeatherPayload);
      return data as WeatherPayload;
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
      return null;
    } finally {
      setLoadingWeather(false);
    }
  }

  async function fetchSuggestion(payload: WeatherPayload) {
    setLoadingSuggestion(true);
    setActivitiesList([]);
    setPackingList([]);
    setAiPins([]);
    setSuggestion("");

    try {
      const res = await fetch("/api/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(extractApiErrorMessage(data));

      setSuggestion(normalizeAiToMarkdown(data?.suggestion ?? ""));

      if (Array.isArray(data.places)) {
        const mappedPins = data.places.map((p: any) => ({
          lat: p.lat,
          lon: p.lon,
          label: p.name,
          popup: p.description,
          category: p.category,
        }));
        setAiPins(mappedPins);
      }

      if (Array.isArray(data.activities)) setActivitiesList(data.activities);
      if (Array.isArray(data.packing_tips)) setPackingList(data.packing_tips);
    } catch (e: any) {
      setError(e?.message ?? "Suggestion failed.");
    } finally {
      setLoadingSuggestion(false);
    }
  }

  async function run(place: string) {
    const w = await fetchWeather(place);
    if (w) await fetchSuggestion(w);
  }

  function applyTrip(trip: Trip) {
    setError("");
    setWeatherPayload(trip.weatherPayload ?? null);
    setSuggestion(trip.suggestion ?? "");
    setActivitiesList(trip.activities ?? []);
    setPackingList(trip.packing ?? []);
    setAiPins(trip.aiPins ?? []);
    setLoadingWeather(false);
    setLoadingSuggestion(false);
  }

  return {
    weatherPayload,
    suggestion,
    loading: busy,
    loadingWeather,
    loadingSuggestion,
    error,
    aiPins,
    activitiesList,
    packingList,
    run,
    applyTrip,
    setError,
  };
}
