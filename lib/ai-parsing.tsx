import React from "react";
import { AiSection, AiSectionKey } from "@/types/weather";
import {
  Map as MapIcon,
  CalendarDays,
  Clock3,
  Utensils,
  Camera,
  BookOpen,
  Backpack,
  CloudSun,
  Info,
} from "lucide-react";

export function normalizeAiToMarkdown(s: string) {
  if (!s) return "";
  let out = s.trim();
  out = out.replace(/\r\n/g, "\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/[ \t]+\n/g, "\n");
  return out;
}

export function splitAiIntoSections(markdown: string): AiSection[] {
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
    body: body?.trim() || "â€”",
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

  const nonEmpty = mapped.filter((x) => x.body && x.body !== "â€”");
  return nonEmpty.length
    ? nonEmpty
    : [mk("raw", "Plan", <MapIcon className="h-4 w-4" />, markdown)];
}

export function mdToItems(md: string) {
  return md
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^([-â€¢]|\d+\.)\s*/, ""))
    .filter(Boolean)
    .slice(0, 10);
}

export function extractBestDaysChips(bestDaysBody: string) {
  const text = bestDaysBody.replace(/\*/g, "");
  const parts = text
    .split(/,|\n|or/gi)
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.slice(0, 6);
}

