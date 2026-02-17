import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  ScanSearch,
  Star,
} from "lucide-react";
import { RatingStars } from "@/components/reviews/RatingStars";
import { useReviews } from "@/hooks/useReviews";
import type { MoodTheme } from "@/lib/mood";

const formatDate = (value: any) => {
  if (!value) return "";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }
  if (value instanceof Date) return value.toLocaleDateString();
  return "";
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPrimaryLocationPart(locationLabel: string) {
  const primary = locationLabel.split(",")[0] ?? "";
  return normalizeText(primary);
}

function toMeaningfulTokens(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3);
}

function isLocationMatch(searchLabel: string, reviewLabel: string) {
  const searchPrimary = getPrimaryLocationPart(searchLabel);
  const reviewPrimary = getPrimaryLocationPart(reviewLabel);
  if (!searchPrimary || !reviewPrimary) return false;

  if (reviewPrimary === searchPrimary) return true;

  if (
    searchPrimary.length >= 4 &&
    (reviewPrimary.includes(searchPrimary) || searchPrimary.includes(reviewPrimary))
  ) {
    return true;
  }

  const searchTokens = toMeaningfulTokens(searchPrimary);
  const reviewTokens = toMeaningfulTokens(reviewPrimary);
  if (!searchTokens.length || !reviewTokens.length) return false;

  return searchTokens.every((token) => reviewTokens.includes(token));
}

export function PlaceReviewsSection({
  locationLabel,
  theme,
}: {
  locationLabel: string;
  theme?: MoodTheme;
}) {
  const { reviews, loading } = useReviews();

  const matchingReviews = reviews
    .filter((review) => isLocationMatch(locationLabel, review.locationLabel))
    .slice(0, 4);

  const reviewCount = matchingReviews.length;
  const averageRating = matchingReviews.length
    ? matchingReviews.reduce((sum, review) => sum + review.rating, 0) /
      matchingReviews.length
    : 0;
  const roundedRating = Math.round(averageRating);

  return (
    <section className="relative overflow-hidden rounded-md border border-slate-200 bg-white/95 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.16),transparent_45%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Traveler Reviews
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {locationLabel
                ? `Verified traveler feedback for ${locationLabel}`
                : "Search a destination to see matching reviews."}
            </p>
          </div>

          <div className="grid min-w-[210px] grid-cols-2 gap-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Avg Rating
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                {averageRating ? averageRating.toFixed(1) : "0.0"}
              </div>
              <div className="mt-0.5">
                <RatingStars value={roundedRating} size={13} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Total Found
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                For this searched destination
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
        {!locationLabel ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
            Search a destination to preview local traveler reviews.
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
            Loading recent reviews...
          </div>
        ) : matchingReviews.length ? (
          <div className="divide-y divide-slate-200">
            {matchingReviews.map((review) => (
              <article key={review.id} className="py-4 sm:py-5">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${theme?.softAccentBg ?? "bg-slate-100"} ${theme?.accentText ?? "text-slate-700"} text-sm font-bold`}
                      >
                        {(review.userName || "T").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-slate-900">
                          {review.userName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />
                          <span>{review.locationLabel}</span>
                          {review.createdAt && <span>{formatDate(review.createdAt)}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-full bg-amber-50 px-2 py-1">
                    <div className="flex items-center gap-2">
                      <RatingStars value={review.rating} size={14} />
                      <span className="text-xs font-bold text-amber-700">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="mt-3 text-base font-extrabold text-slate-900">
                  {review.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">
                  {review.experience}
                </p>
              </article>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <p className="text-xs text-slate-500">
                Looking for more details from other travelers?
              </p>
              <Link
                href="/reviews"
                className={`inline-flex items-center gap-2 rounded-full border ${theme?.border ?? "border-slate-200"} ${theme?.softAccentBg ?? "bg-slate-50"} px-4 py-2 text-xs font-semibold text-slate-700 hover:opacity-90`}
              >
                <Star className="h-4 w-4" />
                Browse all reviews
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2">
                <ScanSearch className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  No reviews for this city yet
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Be the first to add a helpful review for {locationLabel}.
                </p>
                <Link
                  href="/reviews"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  Write a review
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
