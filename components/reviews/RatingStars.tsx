"use client";

import React from "react";
import { Star } from "lucide-react";

type RatingStarsProps = {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
  className?: string;
};

export function RatingStars({
  value,
  size = 16,
  onChange,
  className,
}: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5];
  const readonly = typeof onChange !== "function";

  return (
    <div className={["flex items-center gap-1", className].join(" ")}>
      {stars.map((star) => {
        const filled = value >= star;
        const icon = (
          <Star
            className={[
              "transition-colors",
              filled ? "text-amber-500" : "text-slate-300",
            ].join(" ")}
            size={size}
            strokeWidth={1.6}
            fill={filled ? "currentColor" : "none"}
          />
        );

        if (readonly) return <span key={star}>{icon}</span>;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            aria-label={`Set rating to ${star}`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
