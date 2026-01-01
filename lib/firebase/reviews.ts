"use client";

import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Review } from "@/types/firebase";

type CreateReviewInput = {
  userId: string;
  userName: string;
  userEmail?: string | null;
  locationLabel: string;
  title: string;
  experience: string;
  rating: number;
};

type SubscribeReviewsInput = {
  limitCount?: number;
  onReviews: (reviews: Review[]) => void;
  onError?: (error: Error) => void;
};

export async function createReview(input: CreateReviewInput) {
  const reviewsRef = collection(db, "reviews");
  return addDoc(reviewsRef, {
    userId: input.userId,
    userName: input.userName,
    userEmail: input.userEmail ?? null,
    locationLabel: input.locationLabel,
    title: input.title,
    experience: input.experience,
    rating: Math.max(1, Math.min(5, input.rating)),
    createdAt: serverTimestamp(),
  });
}

export function subscribeToReviews({
  limitCount,
  onReviews,
  onError,
}: SubscribeReviewsInput) {
  const reviewsRef = collection(db, "reviews");
  const baseQuery = query(reviewsRef, orderBy("createdAt", "desc"));
  const reviewsQuery =
    typeof limitCount === "number"
      ? query(baseQuery, limit(limitCount))
      : baseQuery;

  return onSnapshot(
    reviewsQuery,
    (snapshot) => {
      const reviews = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId ?? "",
          userName: data.userName ?? "Traveler",
          userEmail: data.userEmail ?? null,
          locationLabel: data.locationLabel ?? "",
          title: data.title ?? "",
          experience: data.experience ?? "",
          rating: Number(data.rating ?? 0),
          createdAt: data.createdAt ?? null,
        } satisfies Review;
      });
      onReviews(reviews);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}
