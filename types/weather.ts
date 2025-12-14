import React from "react";

export type WeatherPayload = {
  location: {
    name: string;
    country?: string;
    state?: string;
    lat?: number;
    lon?: number;
  };
  weather: {
    current?: {
      temp?: number | null;
      wind_speed?: number | null;
      sunrise?: number | null;
      sunset?: number | null;
      timezone_offset?: number | null;
      weathercode?: number | null;
      weather?: { description?: string; code?: number | null }[];
    };
    daily: Array<{
      dt: number;
      temp?: { day?: number | null; max?: number | null; min?: number | null };
      pop?: number | null; // 0..1
      weather?: { description?: string; code?: number | null }[];
    }>;
  };
};

export type AiSectionKey =
  | "activities"
  | "bestDays"
  | "timing"
  | "food"
  | "sights"
  | "history"
  | "packing"
  | "vibe"
  | "raw";

export type AiSection = {
  key: AiSectionKey;
  title: string;
  icon: React.ReactNode;
  body: string; // markdown
};
