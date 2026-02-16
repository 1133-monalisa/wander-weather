"use client";

import { WeatherPayload } from "@/types/weather";
import type { Trip } from "@/types/firebase";

import { normalizeAiToMarkdown } from "@/lib/ai-parsing";
import { extractApiErrorMessage } from "@/lib/weather-utils";
import { useDashboardWeatherStore } from "@/lib/stores/dashboard-weather-store";

export function useWeather() {
  const weatherPayload = useDashboardWeatherStore((s) => s.weatherPayload);
  const suggestion = useDashboardWeatherStore((s) => s.suggestion);
  const loadingWeather = useDashboardWeatherStore((s) => s.loadingWeather);
  const loadingSuggestion = useDashboardWeatherStore((s) => s.loadingSuggestion);
  const error = useDashboardWeatherStore((s) => s.error);
  const aiPins = useDashboardWeatherStore((s) => s.aiPins);
  const activitiesList = useDashboardWeatherStore((s) => s.activitiesList);
  const packingList = useDashboardWeatherStore((s) => s.packingList);

  const setWeatherPayload = useDashboardWeatherStore((s) => s.setWeatherPayload);
  const setSuggestion = useDashboardWeatherStore((s) => s.setSuggestion);
  const setLoadingWeather = useDashboardWeatherStore((s) => s.setLoadingWeather);
  const setLoadingSuggestion = useDashboardWeatherStore(
    (s) => s.setLoadingSuggestion
  );
  const setError = useDashboardWeatherStore((s) => s.setError);
  const setAiPins = useDashboardWeatherStore((s) => s.setAiPins);
  const setActivitiesList = useDashboardWeatherStore((s) => s.setActivitiesList);
  const setPackingList = useDashboardWeatherStore((s) => s.setPackingList);
  const resetSearchData = useDashboardWeatherStore((s) => s.resetSearchData);

  const busy = loadingWeather || loadingSuggestion;

  async function fetchWeather(place: string) {
    setError("");
    resetSearchData();
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

  function clearSearchData() {
    resetSearchData();
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
    clearSearchData,
    applyTrip,
    setError,
  };
}
