import React from "react";
import { Cloud, Zap, Heart, Mountain, Sun } from "lucide-react";

export type Mood =
  | "calm"
  | "energetic"
  | "romantic"
  | "adventurous"
  | "spiritual";

export interface MoodTheme {
  name: string;
  desc: string;
  icon: React.ElementType;
  pageBg: string;
  surface: string;
  border: string;
  heading: string;
  text: string;
  mutedText: string;
  accentBg: string;
  accentText: string;
  softAccentBg: string;
  heroImage: string;
}

export const MOOD_THEMES: Record<Mood, MoodTheme> = {
  calm: {
    name: "Calm",
    desc: "Lakeside relaxation & peace",
    icon: Cloud,
    pageBg: "bg-slate-50",
    surface: "bg-white",
    border: "border-slate-200",
    heading: "text-slate-900",
    text: "text-slate-800",
    mutedText: "text-slate-500",
    accentBg: "bg-indigo-600",
    accentText: "text-indigo-600",
    softAccentBg: "bg-indigo-50",
    heroImage:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
  },
  energetic: {
    name: "Energetic",
    desc: "Festivals & city nightlife",
    icon: Zap,
    pageBg: "bg-orange-50/40",
    surface: "bg-white",
    border: "border-orange-200",
    heading: "text-orange-950",
    text: "text-orange-900",
    mutedText: "text-orange-800/70",
    accentBg: "bg-orange-600",
    accentText: "text-orange-600",
    softAccentBg: "bg-orange-50",
    heroImage:
      "https://images.unsplash.com/photo-1542640244-7e67286feb53?q=80&w=1000&auto=format&fit=crop",
  },
  romantic: {
    name: "Romantic",
    desc: "Sunsets, dinners & views",
    icon: Heart,
    pageBg: "bg-rose-50/40",
    surface: "bg-white",
    border: "border-rose-200",
    heading: "text-rose-950",
    text: "text-rose-900",
    mutedText: "text-rose-800/70",
    accentBg: "bg-rose-600",
    accentText: "text-rose-600",
    softAccentBg: "bg-rose-50",
    heroImage:
      "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000&auto=format&fit=crop",
  },
  adventurous: {
    name: "Adventurous",
    desc: "Annapurna trekking & paragliding",
    icon: Mountain,
    pageBg: "bg-emerald-50/40",
    surface: "bg-white",
    border: "border-emerald-200",
    heading: "text-emerald-950",
    text: "text-emerald-900",
    mutedText: "text-emerald-800/70",
    accentBg: "bg-emerald-600",
    accentText: "text-emerald-600",
    softAccentBg: "bg-emerald-50",
    heroImage:
      "https://images.unsplash.com/photo-1486911278844-a81c5267e227?q=80&w=1000&auto=format&fit=crop",
  },
  spiritual: {
    name: "Spiritual",
    desc: "Temples, yoga & meditation",
    icon: Sun,
    pageBg: "bg-amber-50/40",
    surface: "bg-white",
    border: "border-amber-200",
    heading: "text-amber-950",
    text: "text-amber-900",
    mutedText: "text-amber-800/70",
    accentBg: "bg-amber-600",
    accentText: "text-amber-600",
    softAccentBg: "bg-amber-50",
    heroImage:
      "https://images.unsplash.com/photo-1558263596-3b99480eb176?q=80&w=1000&auto=format&fit=crop",
  },
};
