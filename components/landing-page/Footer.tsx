"use client";

import React from "react";
import { motion } from "framer-motion";
import { Instagram, Facebook, Youtube, MapPin, Mail } from "lucide-react";

import { MoodTheme } from "@/lib/mood";
import { VIEWPORT_CONFIG, sectionUpVariants } from "@/lib/animation";

interface FooterProps {
  theme: MoodTheme;
}

const Footer: React.FC<FooterProps> = ({ theme }) => {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      variants={sectionUpVariants}
      className={`mt-16 border-t ${theme.border} bg-white`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
        {/* 1. Top: brand + short description + social */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
          {/* Brand + description */}
          <div className="space-y-3 max-w-xl w-full">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl ${theme.accentBg} text-white flex items-center justify-center flex-shrink-0`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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
                <p className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-800">
                  Wander Weather
                </p>
                <p className="text-xs text-slate-500">
                  AI-powered Nepal trip planner
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              Wander Weather is a student-built project from Prativa Secondary
              School. It helps you plan trips in Nepal using weather, culture,
              and local-style suggestions — not just a list of places.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate sm:whitespace-normal">
                Kathmandu · Pokhara · Bhaktapur · Chitwan
              </span>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex flex-row items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-slate-500 uppercase tracking-wide">
              Follow
            </span>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                <Youtube className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Middle: simple link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-100 pt-6">
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Destinations
            </h4>
            <ul className="space-y-1.5 text-sm">
              {[
                "Pokhara guide",
                "Kathmandu heritage",
                "Bhaktapur day trip",
                "Chitwan safari",
              ].map((item) => (
                <li
                  key={item}
                  className="text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Experiences
            </h4>
            <ul className="space-y-1.5 text-sm">
              {[
                "Weather-based planning",
                "Festival calendar",
                "Trekking prep",
                "Local food spots",
              ].map((item) => (
                <li
                  key={item}
                  className="text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Project
            </h4>
            <ul className="space-y-1.5 text-sm">
              {["About the team", "School project", "Roadmap", "Contact"].map(
                (item) => (
                  <li
                    key={item}
                    className="text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Early access column with EMAIL + Subscribe */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Early access
            </h4>
            <p className="text-xs text-slate-600">
              Try Wander Weather early and help the student team improve it with
              your feedback.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-[11px] text-slate-500">
                  Get early-access updates by email
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="flex-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition"
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-full text-[11px] font-semibold text-white ${theme.accentBg} active:scale-95 transition`}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 3. Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500 text-center md:text-left">
            © {new Date().getFullYear()} Wander Weather · Built by students at
            Prativa Secondary School.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-[11px] text-slate-500">
            <button className="hover:text-slate-800 transition-colors">
              Privacy
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <button className="hover:text-slate-800 transition-colors">
              Terms
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <button className="hover:text-slate-800 transition-colors">
              Feedback
            </button>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
