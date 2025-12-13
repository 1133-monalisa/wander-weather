"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/landing-page/Navbar";
import Footer from "@/components/landing-page/Footer";
import { Mood, MOOD_THEMES } from "@/lib/mood";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Loader2,
  Thermometer,
  Wind,
  Sunrise,
  Droplets,
  Sparkles,
  CalendarDays,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Utensils,
  Camera,
  Backpack,
  Clock3,
  BookOpen,
  CloudSun,
  Map as MapIcon,
  Info,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// shadcn/ui
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

/* ---------------- TYPES ---------------- */

type WeatherPayload = {
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

/* ---------------- FORMATTING HELPERS ---------------- */

function extractApiErrorMessage(data: any): string {
  // Your API currently returns: { error: "...." } (sometimes a huge JSON string)
  const raw = data?.error ?? data;

  // If it's already a normal string, try to pull just the `"message"` field out of it
  if (typeof raw === "string") {
    try {
      const obj = JSON.parse(raw);
      return (
        obj?.message ?? obj?.error?.message ?? obj?.error?.error?.message ?? raw
      );
    } catch {
      // Fallback: regex extract `"message":"..."`
      const m = raw.match(/"message"\s*:\s*"([^"]+)"/);
      return m?.[1] ?? raw;
    }
  }

  // If it's an object, prefer `.message`
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

function formatTemp(v: number | null | undefined) {
  if (typeof v !== "number" || Number.isNaN(v)) return "—";
  return `${Math.round(v)}°`;
}
function formatPercent01(v: number | null | undefined) {
  if (typeof v !== "number" || Number.isNaN(v)) return "—";
  return `${Math.round(v * 100)}%`;
}
function formatWind(v: number | null | undefined) {
  if (typeof v !== "number" || Number.isNaN(v)) return "—";
  return `${Math.round(v)} km/h`;
}
function formatTimeFromUnix(ts?: number | null) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatDay(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function formatWeekday(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", { weekday: "short" });
}
function getWeatherEmoji(code?: number | null) {
  if (code == null) return "⛅";
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "⛅";
  if (code === 45 || code === 48) return "🌫️";
  if (
    (code >= 51 && code <= 57) ||
    (code >= 61 && code <= 67) ||
    (code >= 80 && code <= 82)
  )
    return "🌧️";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "❄️";
  if (code >= 95) return "⛈️";
  return "⛅";
}

function normalizeAiToMarkdown(s: string) {
  if (!s) return "";
  let out = s.trim();
  out = out.replace(/\r\n/g, "\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/[ \t]+\n/g, "\n");
  return out;
}

/* ---------------- AI PARSING LOGIC ---------------- */

type AiSectionKey =
  | "activities"
  | "bestDays"
  | "timing"
  | "food"
  | "sights"
  | "history"
  | "packing"
  | "vibe"
  | "raw";

type AiSection = {
  key: AiSectionKey;
  title: string;
  icon: React.ReactNode;
  body: string; // markdown
};

function splitAiIntoSections(markdown: string): AiSection[] {
  const lines = markdown.split("\n");
  const sections: { title: string; bodyLines: string[] }[] = [];
  let current: { title: string; bodyLines: string[] } | null = null;

  const headingRegex = /^\*\*(.+?)\*\*:\s*(.*)$/;

  for (const line of lines) {
    const m = line.trim().match(headingRegex);

    if (m) {
      if (current) sections.push(current);

      const title = m[1].trim();
      const inline = (m[2] ?? "").trim();

      current = { title, bodyLines: [] };

      // If model put content on same line, convert to a bullet so Quick Picks works
      if (inline) {
        current.bodyLines.push(inline.startsWith("-") ? inline : `- ${inline}`);
      }
      continue;
    }

    if (!current) current = { title: "Overview", bodyLines: [] };
    current.bodyLines.push(line);
  }

  if (current) sections.push(current);

  const mk = (
    key: AiSectionKey,
    title: string,
    icon: React.ReactNode,
    body: string
  ): AiSection => ({
    key,
    title,
    icon,
    body: body?.trim() || "—",
  });

  const mapped = sections.map((s) => {
    const t = s.title.toLowerCase();
    const body = s.bodyLines.join("\n").trim();

    if (t.includes("activity"))
      return mk(
        "activities",
        "Activities",
        <MapIcon className="h-4 w-4" />,
        body
      );
    if (t.includes("best day"))
      return mk(
        "bestDays",
        "Best days",
        <CalendarDays className="h-4 w-4" />,
        body
      );
    if (t.includes("crowd") || t.includes("timing"))
      return mk(
        "timing",
        "Timing & crowds",
        <Clock3 className="h-4 w-4" />,
        body
      );
    if (t.includes("food"))
      return mk("food", "Local food", <Utensils className="h-4 w-4" />, body);
    if (t.includes("view") || t.includes("sight"))
      return mk(
        "sights",
        "Viewpoints & sights",
        <Camera className="h-4 w-4" />,
        body
      );
    if (t.includes("history") || t.includes("fun fact"))
      return mk(
        "history",
        "History / fun fact",
        <BookOpen className="h-4 w-4" />,
        body
      );
    if (t.includes("pack"))
      return mk(
        "packing",
        "Packing checklist",
        <Backpack className="h-4 w-4" />,
        body
      );
    if (t.includes("vibe"))
      return mk("vibe", "Vibe summary", <CloudSun className="h-4 w-4" />, body);

    if (s.title === "Overview")
      return mk("raw", "Overview", <Info className="h-4 w-4" />, body);

    return mk("raw", s.title, <Info className="h-4 w-4" />, body);
  });

  const nonEmpty = mapped.filter((x) => x.body && x.body !== "—");
  return nonEmpty.length
    ? nonEmpty
    : [mk("raw", "Plan", <Sparkles className="h-4 w-4" />, markdown)];
}

function mdToItems(md: string) {
  return md
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^([-•]|\d+\.)\s*/, ""))
    .filter(Boolean)
    .slice(0, 10);
}

function extractBestDaysChips(bestDaysBody: string) {
  const text = bestDaysBody.replace(/\*/g, "");
  const parts = text
    .split(/,|\n|or/gi)
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.slice(0, 6);
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function DashboardPage() {
  const [mood, setMood] = useState<Mood>("calm");
  const [isMounted, setIsMounted] = useState(false);

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState<string>("");

  const [weatherPayload, setWeatherPayload] = useState<WeatherPayload | null>(
    null
  );
  const [suggestion, setSuggestion] = useState<string>("");

  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [error, setError] = useState<string>("");

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
      const saved = localStorage.getItem("userMood") as Mood | null;
      if (saved && MOOD_THEMES[saved]) setMood(saved);
    }, 0);
  }, []);

  const changeMood = (newMood: Mood) => {
    setMood(newMood);
    localStorage.setItem("userMood", newMood);
  };

  const theme = MOOD_THEMES[mood];

  const locationLabel = useMemo(() => {
    if (!weatherPayload?.location?.name) return "";
    const parts = [
      weatherPayload.location.name,
      weatherPayload.location.state,
      weatherPayload.location.country,
    ].filter(Boolean);
    return parts.join(", ");
  }, [weatherPayload]);

  const current = weatherPayload?.weather?.current;
  const daily = weatherPayload?.weather?.daily ?? [];
  const selectedDay = daily?.[selectedIndex] ?? null;

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

  const chartData = useMemo(() => {
    return (daily ?? []).slice(0, 7).map((d) => ({
      dt: d.dt,
      day: formatWeekday(d.dt),
      label: formatDay(d.dt),
      max: typeof d.temp?.max === "number" ? Math.round(d.temp.max) : null,
      min: typeof d.temp?.min === "number" ? Math.round(d.temp.min) : null,
      pop: typeof d.pop === "number" ? Math.round(d.pop * 100) : 0,
      code: d.weather?.[0]?.code ?? null,
      desc: d.weather?.[0]?.description ?? "—",
    }));
  }, [daily]);

  const aiSections = useMemo(
    () => splitAiIntoSections(suggestion),
    [suggestion]
  );

  const bestDaysBody = aiSections.find((s) => s.key === "bestDays")?.body ?? "";
  const bestDaysChips = useMemo(
    () => extractBestDaysChips(bestDaysBody),
    [bestDaysBody]
  );

  const quickActivities = useMemo(() => {
    const body = aiSections.find((s) => s.key === "activities")?.body ?? "";
    const items = mdToItems(body).slice(0, 6);
    if (items.length) return items;

    return suggestion
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- "))
      .map((l) => l.replace(/^- /, ""))
      .slice(0, 6);
  }, [aiSections, suggestion]);

  const quickPacking = useMemo(() => {
    const body = aiSections.find((s) => s.key === "packing")?.body ?? "";
    const items = mdToItems(body).slice(0, 6);
    if (items.length) return items;

    const idx = suggestion.toLowerCase().indexOf("packing");
    if (idx >= 0) {
      const tail = suggestion.slice(idx);
      return tail
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("- "))
        .map((l) => l.replace(/^- /, ""))
        .slice(0, 6);
    }
    return [];
  }, [aiSections, suggestion]);

  const vibeOneLine = useMemo(() => {
    const v = aiSections.find((s) => s.key === "vibe")?.body ?? "";
    return v
      ? v
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .replace(/\*/g, "")
          .trim()
          .slice(0, 220)
      : "";
  }, [aiSections]);

  async function fetchWeather(place: string) {
    setError("");
    setSuggestion("");
    setWeatherPayload(null);
    setSelectedIndex(0);

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
    try {
      const res = await fetch("/api/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractApiErrorMessage(data));
      setSuggestion(normalizeAiToMarkdown(data?.suggestion ?? ""));
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

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const place = query.trim();
    if (!place) {
      setError(
        "Type a place name first (e.g., Pokhara, Bhaktapur, Kathmandu)."
      );
      return;
    }
    setActiveQuery(place);
    await run(place);
  }

  if (!isMounted) return null;
  const busy = loadingWeather || loadingSuggestion;

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
        {/* COMMAND BAR */}
        <section className="px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="sticky top-[72px] md:top-[80px] z-30">
              <div className="rounded-[2rem] border border-slate-200/80 bg-white/75 backdrop-blur-xl shadow-sm">
                <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mt-1 flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                          {locationLabel || "Search a place to start"}
                        </p>

                        {locationLabel ? (
                          <span className="hidden sm:inline-flex text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                            7-day forecast + AI plan
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          activeQuery ? run(activeQuery) : handleSearch()
                        }
                        disabled={busy || (!query.trim() && !activeQuery)}
                        className={`h-10 px-3 rounded-full bg-white border border-slate-200 text-slate-900 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                          busy || (!query.trim() && !activeQuery)
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }`}
                        title="Refresh"
                      >
                        {busy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Refresh</span>
                      </button>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search a place (e.g., Lakeside Pokhara, Thamel Kathmandu, Bhaktapur Durbar Square)"
                        className="w-full h-12 pl-11 pr-4 rounded-[999px] outline-none bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busy}
                      className={`h-12 px-6 rounded-[999px] text-white font-bold shadow-lg shadow-slate-200 hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                        theme.accentBg
                      } ${
                        busy
                          ? "opacity-70 cursor-not-allowed hover:-translate-y-0"
                          : ""
                      }`}
                    >
                      {busy ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Working…
                        </>
                      ) : (
                        <>
                          Analyze
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Pokhara",
                      "Bhaktapur",
                      "Kathmandu",
                      "Nagarkot",
                      "Lumbini",
                      "Patan",
                    ].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setQuery(p);
                          setActiveQuery(p);
                          run(p);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-4 rounded-2xl border border-red-200 bg-white shadow-sm"
                >
                  <div className="p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-slate-900">
                        Error
                      </p>

                      <div className="mt-1 max-h-[140px] overflow-y-auto pr-1">
                        <p className="text-sm text-slate-600 break-words whitespace-pre-wrap">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        {/* CONTENT */}
        <section className="px-4 sm:px-6 md:px-8 pb-14">
          <div className="max-w-7xl mx-auto mt-6 space-y-6">
            {/* KPI ROW */}
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
                value={`${formatTimeFromUnix(
                  current?.sunrise
                )} / ${formatTimeFromUnix(current?.sunset)}`}
                sub="Rise / Set"
                icon={<Sunrise className="w-4 h-4" />}
                theme={theme}
              />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CardShell
                title="Temperature trend"
                subtitle="7-day max vs min"
                right={daily.length ? "Interactive" : "—"}
                icon={<CalendarDays className="w-4 h-4" />}
              >
                {!chartData.length ? (
                  <EmptyBlock />
                ) : (
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                          formatter={(v: any, name: any) =>
                            name === "max" || name === "min"
                              ? [`${v}°`, name === "max" ? "High" : "Low"]
                              : [v, name]
                          }
                          labelFormatter={(_, i) =>
                            chartData?.[i as any]?.label ?? ""
                          }
                        />
                        <Legend
                          formatter={(value: any) =>
                            value === "max"
                              ? "High"
                              : value === "min"
                              ? "Low"
                              : value
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="max"
                          strokeWidth={3}
                          dot={false}
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="min"
                          strokeWidth={3}
                          strokeDasharray="6 6"
                          dot={false}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardShell>

              <CardShell
                title="Rain probability"
                subtitle="7-day chance of precipitation"
                right={daily.length ? `Avg ${formatPercent01(avgRain)}` : "—"}
                icon={<Droplets className="w-4 h-4" />}
              >
                {!chartData.length ? (
                  <EmptyBlock />
                ) : (
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          formatter={(v: any) => [`${v}%`, "Rain chance"]}
                          labelFormatter={(_, i) =>
                            chartData?.[i as any]?.label ?? ""
                          }
                        />
                        <Legend />
                        <Bar
                          dataKey="pop"
                          name="Rain chance"
                          radius={[10, 10, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardShell>
            </div>

            {/* TABLE + DAY DETAIL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 h-full">
                <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden h-full flex flex-col">
                  <div className="p-5 sm:p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                            7-day forecast
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Click a day to see details on the right
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
                        {daily.length ? `${daily.length} days` : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 sm:p-6 flex-1 min-h-0">
                    {!daily.length ? (
                      <EmptyBlock />
                    ) : (
                      <div className="h-full min-h-0 rounded-2xl border border-slate-100 overflow-hidden">
                        {/* Helpful hint row */}
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Quick compare
                          </div>
                          <div className="text-xs text-slate-500 font-semibold">
                            Tip: Best views = low rain + clearer codes
                          </div>
                        </div>

                        {/* Scroll container keeps both cards same height */}
                        <div className="h-full min-h-0 overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white z-10">
                              <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                <th className="text-left py-3 px-4">Day</th>
                                <th className="text-left py-3 px-4">Summary</th>
                                <th className="text-right py-3 px-4">High</th>
                                <th className="text-right py-3 px-4">Low</th>
                                <th className="text-right py-3 px-4">Rain</th>
                              </tr>
                            </thead>

                            <tbody>
                              {daily.slice(0, 7).map((d, idx) => {
                                const active = idx === selectedIndex;
                                return (
                                  <tr
                                    key={d.dt}
                                    onClick={() => setSelectedIndex(idx)}
                                    className={[
                                      "cursor-pointer border-b border-slate-100 transition-colors",
                                      active
                                        ? "bg-slate-50"
                                        : "hover:bg-slate-50/60",
                                    ].join(" ")}
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <span className="text-lg">
                                          {getWeatherEmoji(
                                            d.weather?.[0]?.code ?? null
                                          )}
                                        </span>
                                        <div className="min-w-0">
                                          <div className="font-extrabold text-slate-900 truncate">
                                            {formatDay(d.dt)}
                                          </div>
                                          <div className="text-xs text-slate-500 font-semibold">
                                            {active
                                              ? "Selected"
                                              : formatWeekday(d.dt)}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="py-3 px-4 text-slate-700">
                                      <span className="line-clamp-1">
                                        {d.weather?.[0]?.description ?? "—"}
                                      </span>
                                    </td>

                                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                                      {formatTemp(d.temp?.max ?? null)}
                                    </td>

                                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                                      {formatTemp(d.temp?.min ?? null)}
                                    </td>

                                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                                      {formatPercent01(d.pop ?? null)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: SELECTED DAY DETAILS */}
              <div className="lg:col-span-4 h-full">
                <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden h-full flex flex-col">
                  <div className="p-5 sm:p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                          <Info className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                            Day details
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {selectedDay ? formatDay(selectedDay.dt) : "—"}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
                        {selectedDay
                          ? `Rain ${formatPercent01(selectedDay.pop ?? null)}`
                          : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 sm:p-6 flex-1 min-h-0">
                    {!selectedDay ? (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 h-full flex items-center">
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">
                            Select a day
                          </p>
                          <p className="text-sm leading-7 text-slate-600 mt-1">
                            Click any day in the forecast list to preview
                            highlights and comfort tips.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full min-h-0 flex flex-col gap-4">
                        {/* Summary card */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                                Summary
                              </div>
                              <div className="mt-1 text-sm font-extrabold text-slate-900">
                                {selectedDay.weather?.[0]?.description ?? "—"}
                              </div>
                            </div>

                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${theme.softAccentBg} ${theme.accentText}`}
                              title="Conditions"
                            >
                              <span className="text-lg">
                                {getWeatherEmoji(
                                  selectedDay.weather?.[0]?.code ?? null
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <MiniStat
                              label="High"
                              value={formatTemp(selectedDay.temp?.max ?? null)}
                            />
                            <MiniStat
                              label="Low"
                              value={formatTemp(selectedDay.temp?.min ?? null)}
                            />
                            <MiniStat
                              label="Rain"
                              value={formatPercent01(selectedDay.pop ?? null)}
                            />
                          </div>
                        </div>

                        {/* Comfort hints (fills remaining height nicely) */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 flex-1 min-h-0">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                              Comfort & timing
                            </div>
                            <div className="text-xs text-slate-500 font-semibold">
                              Quick tips
                            </div>
                          </div>

                          <ul className="mt-3 space-y-3 text-sm text-slate-700">
                            <li className="flex items-start gap-2">
                              <span className="mt-1">•</span>
                              <span>
                                <span className="font-extrabold text-slate-900">
                                  Best for:
                                </span>{" "}
                                {hintBestFor(selectedDay)}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1">•</span>
                              <span>
                                <span className="font-extrabold text-slate-900">
                                  Visibility:
                                </span>{" "}
                                {hintVisibility(selectedDay)}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1">•</span>
                              <span>
                                <span className="font-extrabold text-slate-900">
                                  Timing:
                                </span>{" "}
                                {hintTiming(selectedDay)}
                              </span>
                            </li>
                          </ul>

                          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Micro-plan
                            </div>
                            <div className="mt-1 text-sm text-slate-700 leading-7">
                              Start early, check skies around midday, and keep a
                              flexible indoor backup if rain climbs.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI PLAN */}
            <AiPlanShadcn
              locationLabel={locationLabel}
              busy={busy}
              loadingSuggestion={loadingSuggestion}
              suggestion={suggestion}
              bestDaysChips={bestDaysChips}
              quickActivities={quickActivities}
              quickPacking={quickPacking}
              vibeOneLine={vibeOneLine}
              aiSections={aiSections}
            />
          </div>
        </section>
      </main>

      <Footer theme={theme} />
    </div>
  );
}

/* ---------------- AI SECTION (FIXED & SIMPLIFIED) ---------------- */

function AiPlanShadcn({
  locationLabel,
  busy,
  loadingSuggestion,
  suggestion,
  bestDaysChips,
  quickActivities,
  quickPacking,
  vibeOneLine,
  aiSections,
}: {
  locationLabel: string;
  busy: boolean;
  loadingSuggestion: boolean;
  suggestion: string;
  bestDaysChips: string[];
  quickActivities: string[];
  quickPacking: string[];
  vibeOneLine: string;
  aiSections: AiSection[];
}) {
  const hasPlan = !!suggestion;
  // Filter out "raw" so we only get structured cards
  const structured = aiSections.filter((s) => s.key !== "raw");

  return (
    <Card className="rounded-[2rem] border border-slate-200/80 bg-white overflow-hidden">
      {/* HEADER */}
      <CardHeader className="p-6 sm:p-8 -mb-10 border-b border-slate-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle className="text-2xl font-extrabold tracking-tight">
                    Wander AI Suggestions
                  </CardTitle>

                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1.5 text-xs font-bold"
                  >
                    {busy ? "Generating…" : hasPlan ? "Ready" : "Waiting"}
                  </Badge>

                  {locationLabel ? (
                    <Badge
                      variant="outline"
                      className="rounded-full px-3 py-1 text-xs font-bold bg-white"
                    >
                      {locationLabel}
                    </Badge>
                  ) : null}
                </div>

                <CardDescription className="text-sm leading-7 mt-1">
                  {locationLabel
                    ? "Visual inspiration + clean travel suggestions based on your 7-day forecast."
                    : "Search a place to generate your plan."}
                </CardDescription>
              </div>
            </div>
          </div>

          {/* META STRIP (Vibe + Best Days) */}
          {hasPlan && (vibeOneLine || bestDaysChips.length) ? (
            <div className="rounded-2xl border bg-slate-50/70 p-5 space-y-4">
              {vibeOneLine ? (
                <div className="flex items-start gap-3">
                  <CloudSun className="h-5 w-5 text-slate-600 mt-0.5" />
                  <p className="text-sm leading-8 font-semibold text-slate-900">
                    {vibeOneLine}
                  </p>
                </div>
              ) : null}

              {bestDaysChips.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  {bestDaysChips.map((d, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="rounded-full px-3 py-1 text-xs font-bold bg-white"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardHeader>

      {/* BODY */}
      <CardContent>
        {loadingSuggestion ? (
          <div className="rounded-2xl border bg-slate-50 p-6">
            <div className="flex items-start gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-slate-600 mt-1" />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-900">
                  Crafting suggestions…
                </p>
                <p className="text-sm leading-7 text-slate-600 mt-1">
                  Organizing activities, timing, food, and packing advice.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="h-4 w-2/3 bg-slate-200/70 rounded" />
                  <div className="h-4 w-5/6 bg-slate-200/70 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200/70 rounded" />
                </div>
              </div>
            </div>
          </div>
        ) : !hasPlan ? (
          <div className="rounded-2xl border bg-slate-50 p-6">
            <p className="text-sm font-extrabold text-slate-900">No plan yet</p>
            <p className="text-sm leading-7 text-slate-600 mt-1">
              Search a destination to generate suggestions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: QUICK PICKS (STICKY) */}
            <div className="lg:col-span-4 lg:sticky lg:top-[110px]">
              <div className="rounded-2xl border bg-white p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Quick picks
                  </h3>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Top activities
                  </p>
                  {/* FIX APPLIED HERE: flex-col + whitespace-normal + h-auto */}
                  <div className="flex flex-col gap-2">
                    {quickActivities.length ? (
                      quickActivities.map((it, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="rounded-lg px-3 py-2 text-sm font-medium whitespace-normal text-left leading-5 h-auto justify-start w-full"
                        >
                          {it}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">—</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Packing essentials
                  </p>
                  <div className="space-y-2">
                    {quickPacking.length ? (
                      quickPacking.map((it, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm leading-7"
                        >
                          <CheckCircle2 className="h-4 w-4 mt-1 text-slate-700" />
                          <span className="font-medium">{it}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: DETAILED CARDS */}
            <div className="lg:col-span-8 space-y-5">
              {structured.map((s) => (
                <div
                  key={s.key}
                  className="rounded-2xl border bg-white p-5 sm:p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center">
                      {s.icon}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {s.title}
                    </h3>
                  </div>

                  <div className="prose prose-slate max-w-none prose-p:leading-8 prose-p:my-4 prose-li:leading-8 prose-strong:font-extrabold">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {s.body}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Shared Blocks ---------------- */

function CardShell({
  title,
  subtitle,
  right,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-9 w-9 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
              ) : null}
            </div>
          </div>
          {right ? (
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
              {right}
            </div>
          ) : null}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function KPI({
  title,
  value,
  sub,
  icon,
  theme,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  theme: any;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border ${theme.border} bg-white shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
            {title}
          </div>
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center ${theme.softAccentBg} ${theme.accentText}`}
          >
            {icon}
          </div>
        </div>
        <div className="mt-2 text-2xl font-extrabold text-slate-900 leading-none">
          {value}
        </div>
        <div className="mt-2 text-xs text-slate-500 font-semibold line-clamp-1">
          {sub}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function EmptyBlock() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
      <div className="text-sm font-extrabold text-slate-900">No data yet</div>
      <div className="mt-1 text-sm text-slate-600">
        Search a place above to load weather, charts, and an AI travel plan.
      </div>
    </div>
  );
}

/* ---------------- Small “dashboard logic” hints ---------------- */

function hintBestFor(d: WeatherPayload["weather"]["daily"][number]) {
  const pop = typeof d.pop === "number" ? d.pop : 0;
  const max = typeof d.temp?.max === "number" ? d.temp!.max! : null;
  if (pop >= 0.6)
    return "indoor culture, cafes, museums, heritage walks (short)";
  if (max != null && max >= 26)
    return "sunrise viewpoints, lakeside strolls, light hikes";
  if (max != null && max <= 14) return "warm layers + cozy food tours";
  return "balanced day trips + city exploration";
}
function hintVisibility(d: WeatherPayload["weather"]["daily"][number]) {
  const code = d.weather?.[0]?.code ?? null;
  if (code === 0 || (typeof code === "number" && code >= 1 && code <= 2))
    return "high (best for mountain views)";
  if (code === 3 || code === 45 || code === 48) return "reduced (cloud/fog)";
  if (typeof code === "number" && code >= 61)
    return "variable (rain can reduce visibility)";
  return "mixed";
}
function hintTiming(d: WeatherPayload["weather"]["daily"][number]) {
  const pop = typeof d.pop === "number" ? d.pop : 0;
  if (pop >= 0.5) return "go early; keep a flexible indoor backup";
  return "golden hours: sunrise + late afternoon";
}
