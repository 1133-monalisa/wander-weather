"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { WeatherPayload } from "@/types/weather";
import type { Trip, TripPin } from "@/types/firebase";

type CreateTripInput = {
  userId: string;
  locationLabel: string;
  weatherPayload: WeatherPayload;
  suggestion: string;
  activities: string[];
  packing: string[];
  aiPins: TripPin[];
};

export async function createTrip(input: CreateTripInput) {
  const tripsRef = collection(db, "trips");
  return addDoc(tripsRef, {
    userId: input.userId,
    locationLabel: input.locationLabel,
    weatherPayload: input.weatherPayload,
    suggestion: input.suggestion,
    activities: input.activities ?? [],
    packing: input.packing ?? [],
    aiPins: input.aiPins ?? [],
    createdAt: serverTimestamp(),
  });
}

export async function deleteTrip(tripId: string) {
  const tripRef = doc(db, "trips", tripId);
  return deleteDoc(tripRef);
}

export function subscribeToTrips(
  userId: string,
  onTrips: (trips: Trip[]) => void,
  onError?: (error: Error) => void
) {
  const tripsRef = collection(db, "trips");
  const tripsQuery = query(
    tripsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    tripsQuery,
    (snapshot) => {
      const trips = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId ?? userId,
          locationLabel: data.locationLabel ?? "",
          createdAt: data.createdAt ?? null,
          weatherPayload: (data.weatherPayload ?? null) as WeatherPayload | null,
          suggestion: data.suggestion ?? "",
          activities: Array.isArray(data.activities) ? data.activities : [],
          packing: Array.isArray(data.packing) ? data.packing : [],
          aiPins: Array.isArray(data.aiPins) ? data.aiPins : [],
        } satisfies Trip;
      });
      onTrips(trips);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}
