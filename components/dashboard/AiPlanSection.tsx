import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CalendarDays,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import {
  splitAiIntoSections,
  extractBestDaysChips,
  normalizeAiToMarkdown,
} from "@/lib/ai-parsing";
import type { MoodTheme } from "@/lib/mood";

export function AiPlanSection({
  locationLabel,
  loading,
  suggestion,
  activities,
  packing,
  onSaveTrip,
  savingTrip = false,
  savedTrip = false,
  theme,
}: {
  locationLabel: string;
  loading: boolean;
  suggestion: string;
  activities: string[];
  packing: string[];
  onSaveTrip?: () => void;
  savingTrip?: boolean;
  savedTrip?: boolean;
  theme?: MoodTheme;
}) {
  const hasPlan = !!suggestion;
  const saveButtonClasses = theme
    ? savedTrip
      ? `${theme.softAccentBg} ${theme.accentText} border-transparent`
      : `${theme.accentBg} text-white border-transparent shadow-sm cursor-pointer`
    : "";

  const aiSections = splitAiIntoSections(suggestion);
  const structured = aiSections.filter((s) => s.key !== "raw");

  const bestDaysBody = aiSections.find((s) => s.key === "bestDays")?.body ?? "";
  const bestDaysChips = extractBestDaysChips(bestDaysBody);

  const vibeOneLine = aiSections.find((s) => s.key === "vibe")?.body
    ? aiSections
        .find((s) => s.key === "vibe")
        ?.body.replace(/\n/g, " ")
        .slice(0, 220)
    : "";

  return (
    <section className="relative overflow-hidden rounded-md border border-slate-200 bg-white/95 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_45%)]" />
      <div className="relative">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Wander AI Suggestions
                </h2>
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide"
                >
                  {loading ? "Generating..." : hasPlan ? "Ready" : "Waiting"}
                </Badge>
                {locationLabel && (
                  <Badge
                    variant="outline"
                    className="rounded-full bg-white px-3 py-1 text-[11px] font-bold"
                  >
                    {locationLabel}
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1 text-[15px] leading-7 text-slate-600">
                {locationLabel
                  ? "Visual inspiration + clean travel suggestions based on your 7-day forecast."
                  : "Search a place to generate your plan."}
              </CardDescription>
            </div>
            {hasPlan && locationLabel && onSaveTrip && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveTrip}
                disabled={savingTrip || savedTrip}
                className={`${saveButtonClasses} rounded-full px-4`}
              >
                {savedTrip ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {savedTrip ? "Saved" : savingTrip ? "Saving..." : "Save trip"}
              </Button>
            )}
          </div>

          {hasPlan && (vibeOneLine || bestDaysChips.length > 0) && (
            <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
              {vibeOneLine && (
                <p className="text-[15px] font-semibold leading-relaxed text-slate-900">
                  {vibeOneLine}
                </p>
              )}
              {bestDaysChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  {bestDaysChips.map((d, i) => (
                    <Badge key={i} variant="outline" className="bg-white">
                      {d}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      <div className="pt-4">
        {loading ? (
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <Loader2 className="mt-1 h-5 w-5 animate-spin text-slate-600" />
            <div>
              <p className="text-base font-extrabold text-slate-900">
                Crafting suggestions...
              </p>
              <p className="mt-1 text-[15px] text-slate-600">
                Organizing activities, timing, food, and packing advice.
              </p>
            </div>
          </div>
        ) : !hasPlan ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-base font-extrabold text-slate-900">No plan yet</p>
            <p className="mt-1 text-[15px] text-slate-600">
              Search a destination to generate suggestions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:sticky lg:top-[110px] lg:col-span-4">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-extrabold text-slate-900">Quick picks</h3>
                <Separator />
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Top Activities
                  </p>
                  <div className="flex flex-col gap-2">
                    {activities.length > 0 ? (
                      activities.map((a, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="h-auto whitespace-normal rounded-xl px-3 py-2.5 text-left text-[14px] font-medium"
                        >
                          {a}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[15px] text-slate-400">-</span>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Packing Essentials
                  </p>
                  <div className="space-y-2">
                    {packing.length > 0 ? (
                      packing.map((p, i) => (
                        <div key={i} className="flex items-start gap-2 text-[15px] leading-7">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-slate-700" />
                          <span className="font-medium">{p}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[15px] text-slate-400">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200 lg:col-span-8">
              {structured.map((s) => (
                <section key={s.key} className="py-5 first:pt-0 last:pb-0">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                      {s.icon}
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">{s.title}</h3>
                  </div>
                  <div className="prose prose-slate max-w-none text-md leading-7 prose-p:my-2 prose-li:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {normalizeAiToMarkdown(s.body)}
                    </ReactMarkdown>
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
