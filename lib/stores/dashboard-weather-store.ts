"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { WeatherPayload } from "@/types/weather";

type DashboardWeatherState = {
  weatherPayload: WeatherPayload | null;
  suggestion: string;
  loadingWeather: boolean;
  loadingSuggestion: boolean;
  error: string;
  aiPins: any[];
  activitiesList: string[];
  packingList: string[];
  setWeatherPayload: (payload: WeatherPayload | null) => void;
  setSuggestion: (suggestion: string) => void;
  setLoadingWeather: (loading: boolean) => void;
  setLoadingSuggestion: (loading: boolean) => void;
  setError: (error: string) => void;
  setAiPins: (pins: any[]) => void;
  setActivitiesList: (activities: string[]) => void;
  setPackingList: (packing: string[]) => void;
  resetSearchData: () => void;
};

const initialState = {
  weatherPayload: null,
  suggestion: "",
  loadingWeather: false,
  loadingSuggestion: false,
  error: "",
  aiPins: [],
  activitiesList: [],
  packingList: [],
};

export const useDashboardWeatherStore = create<DashboardWeatherState>()(
  persist(
    (set) => ({
      ...initialState,
      setWeatherPayload: (payload) => set({ weatherPayload: payload }),
      setSuggestion: (suggestion) => set({ suggestion }),
      setLoadingWeather: (loadingWeather) => set({ loadingWeather }),
      setLoadingSuggestion: (loadingSuggestion) => set({ loadingSuggestion }),
      setError: (error) => set({ error }),
      setAiPins: (aiPins) => set({ aiPins }),
      setActivitiesList: (activitiesList) => set({ activitiesList }),
      setPackingList: (packingList) => set({ packingList }),
      resetSearchData: () =>
        set({
          weatherPayload: null,
          suggestion: "",
          aiPins: [],
          activitiesList: [],
          packingList: [],
          error: "",
          loadingWeather: false,
          loadingSuggestion: false,
        }),
    }),
    {
      name: "dashboard-weather-v1",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        weatherPayload: state.weatherPayload,
        suggestion: state.suggestion,
        aiPins: state.aiPins,
        activitiesList: state.activitiesList,
        packingList: state.packingList,
      }),
    }
  )
);

