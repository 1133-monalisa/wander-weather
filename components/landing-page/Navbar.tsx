"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { MOOD_THEMES, Mood, MoodTheme } from "@/lib/mood";
import { SMOOTH_EASE } from "@/lib/animation";

import { Check, Menu, PlaneTakeoff, X } from "lucide-react";

interface NavbarProps {
  mood: Mood;
  theme: MoodTheme;
  onChangeMood: (m: Mood) => void;
}

const Navbar: React.FC<NavbarProps> = ({ mood, theme, onChangeMood }) => {
  const activeMoodMeta = MOOD_THEMES[mood];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = ["Features", "Destinations", "Cultural Guide", "Reviews"];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: SMOOTH_EASE }}
      className={`fixed top-0 w-full z-50 transition-colors duration-500 bg-white/80 backdrop-blur-xl border-b ${theme.border}`}
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Image
            src="/logo/logo.jpg"
            alt="Wander Weather logo"
            width={200}
            height={200}
            className="h-10 w-10 md:h-16 md:w-16 rounded-full object-contain"
          />

          <div className="min-w-0">
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

        {/* Nav links: landing (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
              className={`font-medium ${theme.mutedText} hover:${theme.heading} transition-colors`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile mood: dropdown */}
          <div className="sm:hidden">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-3 rounded-full flex items-center gap-2 max-w-[90px]"
                  aria-label="Change mood"
                >
                  {activeMoodMeta?.icon && (
                    <activeMoodMeta.icon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold truncate">
                    {activeMoodMeta?.name ?? "Mood"}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-64">
                <DropdownMenuLabel className="text-xs text-slate-500">
                  Select mood
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {Object.entries(MOOD_THEMES).map(([key, m]) => {
                  const Icon = m.icon;
                  const isActive = mood === key;

                  return (
                    <DropdownMenuItem
                      key={key}
                      className="cursor-pointer flex items-start gap-2"
                      onClick={() => onChangeMood(key as Mood)}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border ${theme.border} ${theme.softAccentBg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>

                      <span className="flex-1">
                        <span className="text-sm font-semibold flex items-center gap-2">
                          {m.name}
                          {isActive && <Check className="w-4 h-4" />}
                        </span>
                        <span className="text-xs text-slate-500">{m.desc}</span>
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`sm:hidden h-10 w-10 rounded-full border ${theme.border} bg-white/80 text-slate-700 inline-flex items-center justify-center`}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Desktop mood: pill selector */}
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
                        aria-label={`Change mood to ${m.name}`}
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

          {/* CTA */}
          <>
            {/* Desktop: full button */}
            <Link
              href="/auth/login"
              className={`hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg transition-all active:scale-95 ${theme.accentBg}`}
            >
              Start Planning
            </Link>
          </>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-6">
            <div className="grid gap-4">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-800"
                >
                  {item}
                </a>
              ))}
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`mt-2 inline-flex items-center justify-center h-11 rounded-full text-sm font-semibold text-white shadow-lg ${theme.accentBg}`}
              >
                Start Planning
              </Link>
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
