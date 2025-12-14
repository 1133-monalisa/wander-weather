import React, { useMemo, useState } from "react";
import { WeatherPayload } from "@/types/weather";
import { Droplets } from "lucide-react";
import {
  formatDay,
  formatWeekday,
  formatTemp,
  formatPercent01,
  getWeatherEmoji,
} from "@/lib/weather-utils";

// --- Helper Component for the Hero Stats ---
function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
      <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-sm font-extrabold text-slate-900">{value}</span>
    </div>
  );
}

export function DailyForecast({
  daily,
}: {
  daily?: WeatherPayload["weather"]["daily"];
}) {
  const data = useMemo(() => (daily ?? []).slice(0, 7), [daily]);
  const [activeIdx, setActiveIdx] = useState(0);
  const active = data[activeIdx];

  // Safely access extra fields (humidity, wind, etc)
  const extra = (active ?? {}) as any;

  if (!data.length) {
    return <div className="p-4 text-slate-500">No forecast data</div>;
  }

  return (
    <div className="w-full">
      {/* --- HEADER --- */}
      <div className="mb-2 flex items-end justify-between">
        <div>
          <div className="text-xl font-extrabold text-slate-900">
            7-day forecast
          </div>
          <div className="mt-1 text-sm font-medium text-slate-500">
            Select a day to view details
          </div>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase text-slate-500">
          {data.length} days
        </div>
      </div>

      <div className="p-2 border rounded-md">
        {/* --- 1. HERO SECTION (Detailed View) --- */}
        <div className="relative mb-6 sm:mb-10">
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-slate-50 via-white to-white opacity-60" />
          <div className="relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left Side */}
              <div className="min-w-0 flex-1">
                <div className="text-2xl font-black leading-tight text-slate-900">
                  {formatDay(active.dt)}
                </div>
                <div className="mt-1 text-lg font-medium capitalize text-slate-500">
                  {active.weather?.[0]?.description ?? "—"}
                </div>

                {/* Stat Pills */}
                <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                  {active.temp?.max != null && (
                    <StatPill
                      label="High"
                      value={formatTemp(active.temp.max)}
                    />
                  )}
                  {active.temp?.min != null && (
                    <StatPill label="Low" value={formatTemp(active.temp.min)} />
                  )}
                  {active.pop != null && (
                    <StatPill
                      label="Rain"
                      value={formatPercent01(active.pop)}
                    />
                  )}
                  {extra.humidity != null && (
                    <StatPill label="Humidity" value={`${extra.humidity}%`} />
                  )}
                  {extra.wind_speed != null && (
                    <StatPill
                      label="Wind"
                      value={`${Math.round(extra.wind_speed)} m/s`}
                    />
                  )}
                  {extra.uvi != null && (
                    <StatPill label="UV" value={`${extra.uvi}`} />
                  )}
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-5 rounded-3xl border border-slate-100 bg-slate-50/60 p-3 sm:gap-6 sm:p-4">
                <div className="text-5xl drop-shadow-sm sm:text-7xl">
                  {getWeatherEmoji(active.weather?.[0]?.code)}
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Temp
                  </div>
                  <div className="text-5xl font-black leading-none tracking-tight text-slate-900">
                    {formatTemp(
                      (extra.feels_like?.day ?? active.temp?.max) as any
                    )}
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-400">
                    Feels Like
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. FORECAST STRIP --- */}
        <div className="mt-2">
          {/* Mobile: horizontal scroll (compact) */}
          <div className="sm:hidden -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {data.map((d, idx) => {
                const isActive = idx === activeIdx;

                return (
                  <button
                    key={d.dt}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`
                      snap-start shrink-0 w-[132px]
                      rounded-2xl border transition-all duration-200
                      px-3 py-3 text-left
                      ${
                        isActive
                          ? "bg-purple-50 border-purple-600 shadow-[0_10px_30px_-18px_rgba(124,58,237,0.7)]"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-[11px] font-extrabold uppercase tracking-wider ${
                          isActive ? "text-purple-800" : "text-slate-400"
                        }`}
                      >
                        {idx === 0 ? "Today" : formatWeekday(d.dt)}
                      </div>

                      <div className="text-2xl leading-none">
                        {getWeatherEmoji(d.weather?.[0]?.code)}
                      </div>
                    </div>

                    <div className="mt-2 flex items-end justify-between">
                      <div className="leading-none">
                        <div
                          className={`text-lg font-black ${
                            isActive ? "text-slate-900" : "text-slate-900"
                          }`}
                        >
                          {formatTemp(d.temp?.max)}
                        </div>
                        <div
                          className={`mt-1 text-xs font-bold ${
                            isActive ? "text-purple-700/80" : "text-slate-400"
                          }`}
                        >
                          {formatTemp(d.temp?.min)}
                        </div>
                      </div>

                      {d.pop != null && (
                        <div
                          className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                            isActive
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          <Droplets className="h-3 w-3" />
                          {formatPercent01(d.pop)}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop/tablet: grid */}
          <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {data.map((d, idx) => {
              const isActive = idx === activeIdx;

              return (
                <div
                  key={d.dt}
                  onClick={() => setActiveIdx(idx)}
                  className={`
                    cursor-pointer relative flex flex-col items-center justify-between
                    py-4 px-2 rounded-3xl transition-all duration-300 border
                    ${
                      isActive
                        ? "bg-purple-50 border-purple-600 shadow-[0_18px_45px_-28px_rgba(124,58,237,0.8)] scale-[1.02]"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-50 hover:scale-[1.02]"
                    }
                  `}
                >
                  {/* Top */}
                  <div className="flex flex-col items-center w-full">
                    <div
                      className={`text-xs font-bold uppercase mb-3 tracking-wider ${
                        isActive ? "text-purple-800" : "text-slate-400"
                      }`}
                    >
                      {idx === 0 ? "Today" : formatWeekday(d.dt)}
                    </div>

                    <div className="text-4xl mb-2 drop-shadow-sm">
                      {getWeatherEmoji(d.weather?.[0]?.code)}
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="flex flex-col items-center w-full gap-2">
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-lg font-black tracking-tight text-slate-900">
                        {formatTemp(d.temp?.max)}
                      </span>
                      <span
                        className={`text-xs font-bold mt-1 ${
                          isActive ? "text-purple-700/80" : "text-slate-400"
                        }`}
                      >
                        {formatTemp(d.temp?.min)}
                      </span>
                    </div>

                    <div className="h-6 flex items-center justify-center">
                      {d.pop != null ? (
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <Droplets className="w-3 h-3" />
                          {formatPercent01(d.pop)}
                        </div>
                      ) : (
                        <div className="h-5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional hint on mobile */}
          <div className="sm:hidden mt-2 text-[11px] font-medium text-slate-400 px-1">
            Swipe to see more days →
          </div>
        </div>
      </div>
    </div>
  );
}
