"use client";

import React from "react";
import MarqueeLib from "react-fast-marquee";
import { MoodTheme } from "@/lib/mood";

interface MarqueeProps {
  theme: MoodTheme;
}

const Marquee: React.FC<MarqueeProps> = ({ theme }) => {
  const destinations = [
    "KATHMANDU",
    "POKHARA",
    "MUSTANG",
    "CHITWAN",
    "LUMBINI",
    "NAMCHE",
    "BHAKTAPUR",
    "ILAM",
    "RARA",
  ];

  return (
    <div
      className={`w-full overflow-hidden py-6 border-y ${theme.border} bg-white/50 backdrop-blur-sm`}
    >
      <MarqueeLib speed={40} gradient={true} pauseOnHover={true}>
        {destinations.map((city, i) => (
          <div key={i} className="flex items-center flex-shrink-0 mx-8">
            <span
              className={`text-sm font-bold tracking-[0.2em] ${theme.accentText} whitespace-nowrap`}
            >
              {city}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-8" />
          </div>
        ))}
      </MarqueeLib>
    </div>
  );
};

export default Marquee;
