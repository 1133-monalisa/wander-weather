"use client";

import type { UserProfile } from "@/types/firebase";

export const getDisplayName = (profile: UserProfile) =>
  profile.displayName?.trim() || profile.email || "Traveler";

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
};

export const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return null;
};

export const toMillis = (value: any) => {
  const d = toDate(value);
  return d ? d.getTime() : 0;
};

export const formatTime = (value?: any) => {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatDay = (value?: any) => {
  const d = toDate(value);
  if (!d) return "";
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfThat.getTime()) / 86400000
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isSameDay = (a: any, b: any) => {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return false;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};
