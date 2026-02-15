"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, MapPin, Search, Star } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useDashboardMoodContext } from "@/context/DashboardMoodContext";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/reviews/RatingStars";
import { useReviews } from "@/hooks/useReviews";
import type { Review } from "@/types/firebase";

const formatDate = (value: any) => {
  if (!value) return "";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }
  if (value instanceof Date) return value.toLocaleDateString();
  return "";
};

const defaultForm = {
  locationLabel: "",
  title: "",
  experience: "",
  rating: 5,
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const { theme } = useDashboardMoodContext();
  const { reviews, loading, creating, error, averageRating, createReview } =
    useReviews();

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reviews;
    return reviews.filter((review) => {
      const haystack = [
        review.locationLabel,
        review.title,
        review.experience,
        review.userName,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [reviews, search]);

  const canSubmit =
    form.locationLabel.trim().length > 0 &&
    form.title.trim().length > 0 &&
    form.experience.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !canSubmit) return;

    const displayName =
      user.displayName ?? user.email?.split("@")[0] ?? "Traveler";

    await createReview({
      userId: user.uid,
      userName: displayName,
      userEmail: user.email ?? null,
      locationLabel: form.locationLabel.trim(),
      title: form.title.trim(),
      experience: form.experience.trim(),
      rating: form.rating,
    });

    setForm(defaultForm);
  };

  const toggleExpanded = (review: Review) => {
    setExpandedId((prev) => (prev === review.id ? null : review.id));
  };

  const averageLabel = averageRating ? averageRating.toFixed(1) : "0.0";

  return (
    <section className="min-h-screen p-4">
      <div className="max-w-[90rem] mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Traveler Reviews
            </h1>
            <p className="mt-2 text-base text-slate-500 max-w-2xl">
              Share your Nepal experience, rate destinations, and connect with
              fellow travelers.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/70 border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <RatingStars value={Math.round(averageRating)} size={16} />
              <span className="text-sm font-semibold text-slate-800">
                {averageLabel} avg
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {reviews.length} reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
          <aside className="space-y-6">
            <form
              onSubmit={handleSubmit}
              className={`rounded-3xl border ${theme.border} bg-white p-5 shadow-sm space-y-4`}
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Write a review
                </h2>
                <p className="text-xs text-slate-500">
                  Help others plan smarter trips.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">
                  Destination
                </label>
                <input
                  value={form.locationLabel}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      locationLabel: event.target.value,
                    }))
                  }
                  placeholder="e.g. Pokhara, Nepal"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">
                  Rating
                </label>
                <RatingStars
                  value={form.rating}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, rating: value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="A sunrise to remember"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">
                  Experience
                </label>
                <textarea
                  value={form.experience}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      experience: event.target.value,
                    }))
                  }
                  placeholder="Share the highlights, tips, and must-dos."
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit || creating}
                className={`w-full rounded-2xl ${theme.accentBg} text-white font-semibold`}
              >
                {creating ? "Sharing..." : "Share review"}
              </Button>

              {error && (
                <div className="text-xs font-semibold text-rose-600">
                  {error}
                </div>
              )}
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-bold text-slate-900">
                  Community tips
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Use the chat button on a review to connect with that traveler
                directly.
              </p>
            </div>
          </aside>

          <div className="space-y-4">
            <div
              className={`flex items-center gap-3 rounded-2xl border ${theme.border} bg-white/70 px-4 py-3`}
            >
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reviews, destinations, travelers..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Loading reviews...
              </div>
            ) : filteredReviews.length ? (
              <div className="space-y-4">
                {filteredReviews.map((review) => {
                  const expanded = expandedId === review.id;
                  const isMine = review.userId === user?.uid;
                  return (
                    <article
                      key={review.id}
                      className={`rounded-3xl border ${theme.border} bg-white p-6 shadow-sm space-y-4`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {review.userName}
                            </span>
                            {isMine && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                Your review
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span>{review.locationLabel}</span>
                            {review.createdAt && (
                              <span>• {formatDate(review.createdAt)}</span>
                            )}
                          </div>
                        </div>

                        <RatingStars value={review.rating} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          {review.title}
                        </h3>
                        <p
                          className={[
                            "text-sm text-slate-600 leading-relaxed whitespace-pre-line",
                            expanded ? "" : "line-clamp-4",
                          ].join(" ")}
                        >
                          {review.experience}
                        </p>
                        {review.experience.length > 220 && (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(review)}
                            className="mt-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
                          >
                            {expanded ? "Show less" : "Read full review"}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/messages?id=${review.userId}`}
                          className={`inline-flex items-center gap-2 rounded-full border ${theme.border} px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          {isMine ? "View chats" : "Message traveler"}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No reviews yet. Be the first to share your experience.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
