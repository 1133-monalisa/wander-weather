import React from "react";

// --- FORMATTERS (Keep these as they are) ---

export function formatTemp(v: number | null | undefined) {
  if (typeof v !== "number" || Number.isNaN(v)) return "—";
  return `${Math.round(v)}°`;
}

export function formatPercent01(v: number | null | undefined) {
  if (typeof v !== "number" || Number.isNaN(v)) return "—";
  return `${Math.round(v * 100)}%`;
}

export function formatWind(v: number | null | undefined) {
  if (typeof v !== "number" || Number.isNaN(v)) return "—";
  return `${Math.round(v)} km/h`;
}

export function formatTimeFromUnix(ts?: number | null) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatWeekday(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", { weekday: "short" });
}

// --- ICON MAPPING ---
export function getWeatherEmoji(code?: number | null) {
  const baseUrl =
    "https://raw.githubusercontent.com/basmilius/weather-icons/dev/design/fill/final/";

  const imgProps = {
    className: "w-[1.5em] h-[1.5em] object-contain drop-shadow-md",
  };

  // Type guard
  if (code === null || code === undefined) {
    return <img src={`${baseUrl}not-available.svg`} alt="N/A" {...imgProps} />;
  }

  let iconName = "not-available";

  switch (code) {
    // ☀️ Clear Sky
    case 0:
      iconName = "clear-day";
      break;

    // 🌤️ Mainly Clear / Partly Cloudy
    case 1:
    case 2:
      iconName = "partly-cloudy-day";
      break;

    // ☁️ Overcast (NO SUN)
    case 3:
      iconName = "overcast";
      break;

    // 🌫️ Fog
    case 45:
    case 48:
      iconName = "fog";
      break;

    // 🌧️ Drizzle (Lighter than rain)
    case 51:
    case 53:
    case 55:
      iconName = "drizzle";
      break;

    // 🌨️ Freezing Drizzle
    case 56:
    case 57:
      iconName = "sleet";
      break;

    // 🌧️ Rain
    case 61: // Slight
    case 63: // Moderate
    case 65: // Heavy
      iconName = "rain";
      break;

    // 🌨️ Freezing Rain
    case 66:
    case 67:
      iconName = "sleet";
      break;

    // ❄️ Snow
    case 71: // Slight
    case 73: // Moderate
    case 75: // Heavy
    case 77: // Snow grains
      iconName = "snow";
      break;

    // 🌦️ Rain Showers
    case 80:
    case 81:
    case 82:
      iconName = "rain";
      break;

    // 🌨️ Snow Showers
    case 85:
    case 86:
      iconName = "snow";
      break;

    // ⛈️ Thunderstorm
    case 95: // Slight or moderate
    case 96: // With hail
    case 99: // With heavy hail
      iconName = "thunderstorms";
      break;

    // Fallback
    default:
      iconName = "partly-cloudy-day";
      break;
  }

  return <img src={`${baseUrl}${iconName}.svg`} alt={iconName} {...imgProps} />;
}

export function extractApiErrorMessage(data: any): string {
  const raw = data?.error ?? data;
  if (typeof raw === "string") {
    try {
      const obj = JSON.parse(raw);
      return (
        obj?.message ?? obj?.error?.message ?? obj?.error?.error?.message ?? raw
      );
    } catch {
      const m = raw.match(/"message"\s*:\s*"([^"]+)"/);
      return m?.[1] ?? raw;
    }
  }
  if (raw && typeof raw === "object") {
    return (
      raw?.message ??
      raw?.error?.message ??
      raw?.error?.error?.message ??
      "Something went wrong."
    );
  }
  return "Something went wrong.";
}
