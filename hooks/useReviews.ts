"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Review } from "@/types/firebase";
import { createReview, subscribeToReviews } from "@/lib/firebase/reviews";

type UseReviewsOptions = {
  limit?: number;
};

type CreateReviewInput = {
  userId: string;
  userName: string;
  userEmail?: string | null;
  locationLabel: string;
  title: string;
  experience: string;
  rating: number;
};

export function useReviews(options: UseReviewsOptions = {}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const limit = options.limit;

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToReviews({
      limitCount: limit,
      onReviews: (data) => {
        setReviews(data);
        setLoading(false);
      },
      onError: (err) => {
        setError(err.message ?? "Unable to load reviews.");
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [limit]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const submitReview = useCallback(async (input: CreateReviewInput) => {
    setCreating(true);
    setError("");
    try {
      await createReview(input);
    } catch (e: any) {
      setError(e?.message ?? "Unable to submit review.");
    } finally {
      setCreating(false);
    }
  }, []);

  return {
    reviews,
    loading,
    creating,
    error,
    averageRating,
    createReview: submitReview,
  };
}
