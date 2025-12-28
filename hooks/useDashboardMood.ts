"use client";

import { useEffect, useState } from "react";
import { Mood, MOOD_THEMES } from "@/lib/mood";

export function useDashboardMood(initialMood: Mood = "calm") {
  const [mood, setMood] = useState<Mood>(initialMood);

  useEffect(() => {
    const saved = localStorage.getItem("userMood") as Mood | null;
    if (saved && MOOD_THEMES[saved]) setMood(saved);
  }, []);

  const changeMood = (newMood: Mood) => {
    setMood(newMood);
    localStorage.setItem("userMood", newMood);
  };

  const theme = MOOD_THEMES[mood];

  return { mood, theme, changeMood };
}
