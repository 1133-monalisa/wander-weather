"use client";

import { useCallback, useEffect, useState } from "react";
import type { Trip, TripPin } from "@/types/firebase";
import type { WeatherPayload } from "@/types/weather";
import { createTrip, deleteTrip, subscribeToTrips } from "@/lib/firebase/trips";

type SaveTripInput = {
  userId: string;
  locationLabel: string;
  weatherPayload: WeatherPayload;
  suggestion: string;
  activities: string[];
  packing: string[];
  aiPins: TripPin[];
};

export function useTrips(userId?: string | null) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setTrips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToTrips(
      userId,
      (data) => {
        setTrips(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message ?? "Unable to load saved trips.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const saveTrip = useCallback(async (input: SaveTripInput) => {
    setSaving(true);
    setError("");
    try {
      await createTrip(input);
    } catch (e: any) {
      setError(e?.message ?? "Unable to save trip.");
    } finally {
      setSaving(false);
    }
  }, []);

  const removeTrip = useCallback(async (tripId: string) => {
    setError("");
    try {
      await deleteTrip(tripId);
    } catch (e: any) {
      setError(e?.message ?? "Unable to delete trip.");
    }
  }, []);

  return {
    trips,
    loading,
    saving,
    error,
    saveTrip,
    removeTrip,
  };
}
