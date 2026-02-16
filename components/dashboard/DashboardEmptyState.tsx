import { MapPin, Search, Route, BarChart3, Compass } from "lucide-react";
import type { MoodTheme } from "@/lib/mood";
import React from "react";

type Feature = {
  title: string;
  description: string;
  icon: React.ElementType;
};

const features: Feature[] = [
  {
    title: "Weather insights",
    description: "7-day forecast + quick stats (rain, wind, humidity).",
    icon: BarChart3,
  },
  {
    title: "Smart map spots",
    description: "Nearby highlights picked for your current conditions.",
    icon: MapPin,
  },
  {
    title: "Plan + reviews",
    description: "Route ideas + real traveler feedback in one view.",
    icon: Route,
  },
];

export function DashboardEmptyState({ theme }: { theme?: MoodTheme }) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative py-8 px-2">
        <div className="mx-auto max-w-[90rem]">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:items-stretch">
            {/* LEFT */}
            <div className="flex h-full flex-col text-center lg:text-left">
              <div
                className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 lg:mx-0 ${
                  theme?.softAccentBg ?? "bg-slate-100"
                } ${theme?.accentText ?? "text-slate-700"}`}
              >
                <Compass className="h-6 w-6" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Search for your destination
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Use the search bar above to explore weather, map highlights, AI
                travel suggestions, and destination reviews in one place.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {["Pokhara", "Kathmandu", "Bhaktapur", "Nagarkot"].map((city) => (
                  <span
                    key={city}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {city}
                  </span>
                ))}
              </div>

              <div className="mt-8 lg:mt-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                  <Search className="h-3.5 w-3.5" />
                  Start by typing a city in the search bar above
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="h-full">
              <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:auto-rows-fr">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="flex h-full items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-5"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 ${
                          theme?.softAccentBg ?? "bg-white"
                        } ${theme?.accentText ?? "text-slate-700"}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-slate-900">
                          {f.title}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {f.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}