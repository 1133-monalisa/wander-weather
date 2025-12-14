import React, { useMemo } from "react";
import { WeatherPayload } from "@/types/weather";
import {
  formatTemp,
  formatPercent01,
  formatWind,
  formatTimeFromUnix,
} from "@/lib/weather-utils";
import { Thermometer, Droplets, Wind, Sunrise } from "lucide-react";
import { KPI } from "./Shared";

export function StatsGrid({
  weather,
  theme,
}: {
  weather: WeatherPayload | null;
  theme: any;
}) {
  const current = weather?.weather?.current;
  const daily = weather?.weather?.daily ?? [];

  const weekHigh = useMemo(() => {
    const vals = daily
      .map((d) => d.temp?.max)
      .filter((x): x is number => typeof x === "number");
    if (!vals.length) return null;
    return Math.max(...vals);
  }, [daily]);

  const weekLow = useMemo(() => {
    const vals = daily
      .map((d) => d.temp?.min)
      .filter((x): x is number => typeof x === "number");
    if (!vals.length) return null;
    return Math.min(...vals);
  }, [daily]);

  const avgRain = useMemo(() => {
    const vals = daily
      .map((d) => d.pop)
      .filter((x): x is number => typeof x === "number");
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [daily]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <KPI
        title="Now"
        value={formatTemp(current?.temp ?? null)}
        sub={current?.weather?.[0]?.description ?? "—"}
        icon={<Thermometer className="w-4 h-4" />}
        theme={theme}
      />
      <KPI
        title="Week High"
        value={formatTemp(weekHigh)}
        sub="Max temp"
        icon={<Thermometer className="w-4 h-4" />}
        theme={theme}
      />
      <KPI
        title="Week Low"
        value={formatTemp(weekLow)}
        sub="Min temp"
        icon={<Thermometer className="w-4 h-4" />}
        theme={theme}
      />
      <KPI
        title="Avg Rain"
        value={formatPercent01(avgRain)}
        sub="Probability"
        icon={<Droplets className="w-4 h-4" />}
        theme={theme}
      />
      <KPI
        title="Wind"
        value={formatWind(current?.wind_speed ?? null)}
        sub="Current"
        icon={<Wind className="w-4 h-4" />}
        theme={theme}
      />
      <KPI
        title="Sun"
        value={`${formatTimeFromUnix(current?.sunrise)} / ${formatTimeFromUnix(
          current?.sunset
        )}`}
        sub="Rise / Set"
        icon={<Sunrise className="w-4 h-4" />}
        theme={theme}
      />
    </div>
  );
}
