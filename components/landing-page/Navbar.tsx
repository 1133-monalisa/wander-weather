"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MOOD_THEMES, Mood, MoodTheme } from "@/lib/mood";
import { SMOOTH_EASE } from "@/lib/animation";

interface NavbarProps {
  mood: Mood;
  theme: MoodTheme;
  onChangeMood: (m: Mood) => void;
}

const Navbar: React.FC<NavbarProps> = ({ mood, theme, onChangeMood }) => {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: SMOOTH_EASE }}
      className={`fixed top-0 w-full z-50 transition-colors duration-500 bg-white/80 backdrop-blur-xl border-b ${theme.border}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl ${theme.accentBg} text-white flex items-center justify-center shadow-lg transition-colors duration-500`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <span
              className={`text-lg font-bold tracking-tight block leading-none ${theme.heading}`}
            >
              Wander Weather
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">
              SMART TRIP PLANNER
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Destinations", "Cultural Guide", "Stories"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                className={`font-medium ${theme.mutedText} hover:${theme.heading} transition-colors`}
              >
                {item}
              </a>
            )
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Mood Selector */}
          <div
            className={`hidden sm:flex ${theme.softAccentBg} backdrop-blur p-1 rounded-full border ${theme.border} transition-colors duration-500`}
          >
            <TooltipProvider delayDuration={0}>
              {Object.entries(MOOD_THEMES).map(([key, m]) => {
                const Icon = m.icon;
                const isActive = mood === key;
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onChangeMood(key as Mood)}
                        className={`p-2 rounded-full transition-all duration-300 relative cursor-pointer ${
                          isActive
                            ? "bg-white shadow-sm text-slate-900 scale-110 z-10"
                            : `${theme.mutedText} hover:bg-white/50`
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-xs font-medium"
                    >
                      {m.name}: {m.desc}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>

          <Link
            href="/auth/register"
            className={`hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg transition-all active:scale-95 ${theme.accentBg}`}
          >
            Start Planning
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
