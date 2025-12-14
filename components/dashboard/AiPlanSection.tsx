import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CalendarDays, CheckCircle2 } from "lucide-react";
import { AiSection } from "@/types/weather";

interface AiPlanProps {
  locationLabel: string;
  loading: boolean;
  suggestion: string;
  aiSections: AiSection[];
  quickActivities: string[];
  quickPacking: string[];
  bestDaysChips: string[];
  vibeOneLine: string;
}

// Helper to extract sections passed from parent
// You can also move splitAiIntoSections call inside here if you prefer passing raw string

import {
  splitAiIntoSections,
  extractBestDaysChips,
  mdToItems,
} from "@/lib/ai-parsing";

export function AiPlanSection({
  locationLabel,
  loading,
  suggestion,
  activities,
  packing,
}: {
  locationLabel: string;
  loading: boolean;
  suggestion: string;
  activities: string[];
  packing: string[];
}) {
  const hasPlan = !!suggestion;

  // Parse on the fly
  const aiSections = splitAiIntoSections(suggestion);
  const structured = aiSections.filter((s) => s.key !== "raw");

  // Extract extra bits if API didn't return lists
  const bestDaysBody = aiSections.find((s) => s.key === "bestDays")?.body ?? "";
  const bestDaysChips = extractBestDaysChips(bestDaysBody);

  const vibeOneLine = aiSections.find((s) => s.key === "vibe")?.body
    ? aiSections
        .find((s) => s.key === "vibe")
        ?.body.replace(/\n/g, " ")
        .slice(0, 220)
    : "";

  return (
    <Card className="rounded-md border border-slate-200/80 bg-white overflow-hidden">
      <CardHeader className="p-6 sm:p-8 -mb-10 border-b border-slate-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-2xl font-extrabold tracking-tight">
                  Wander AI Suggestions
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1.5 text-xs font-bold"
                >
                  {loading ? "Generating…" : hasPlan ? "Ready" : "Waiting"}
                </Badge>
                {locationLabel && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-xs font-bold bg-white"
                  >
                    {locationLabel}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm leading-7 mt-1">
                {locationLabel
                  ? "Visual inspiration + clean travel suggestions based on your 7-day forecast."
                  : "Search a place to generate your plan."}
              </CardDescription>
            </div>
          </div>

          {hasPlan && (vibeOneLine || bestDaysChips.length > 0) && (
            <div className="rounded-2xl border bg-slate-50/70 p-5 space-y-4">
              {vibeOneLine && (
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
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
      </CardHeader>

      <CardContent className="pt-10">
        {loading ? (
          <div className="rounded-2xl border bg-slate-50 p-6 flex items-start gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600 mt-1" />
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                Crafting suggestions...
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Organizing activities, timing, food, and packing advice.
              </p>
            </div>
          </div>
        ) : !hasPlan ? (
          <div className="rounded-2xl border bg-slate-50 p-6">
            <p className="text-sm font-extrabold text-slate-900">No plan yet</p>
            <p className="text-sm text-slate-600 mt-1">
              Search a destination to generate suggestions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sticky: Quick Picks */}
            <div className="lg:col-span-4 lg:sticky lg:top-[110px] space-y-6">
              <div className="rounded-2xl border bg-white p-5 space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  Quick picks
                </h3>
                <Separator />
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Top Activities
                  </p>
                  <div className="flex flex-col gap-2">
                    {activities.length > 0 ? (
                      activities.map((a, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="whitespace-normal text-left h-auto py-2"
                        >
                          {a}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Packing Essentials
                  </p>
                  <div className="space-y-2">
                    {packing.length > 0 ? (
                      packing.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm leading-6"
                        >
                          <CheckCircle2 className="h-4 w-4 mt-1 text-slate-700 shrink-0" />
                          <span className="font-medium">{p}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Detailed Content */}
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
                  <div className="prose prose-slate max-w-none text-sm">
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
