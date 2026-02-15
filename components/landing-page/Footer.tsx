"use client";

import React from "react";
import Image from "next/image";
import { Instagram, Facebook, Youtube, MapPin, Mail } from "lucide-react";
import { MoodTheme } from "@/lib/mood";

interface FooterProps {
  theme: MoodTheme;
}

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/driftleaf.1",
    Icon: Instagram,
    iconClass: "text-pink-500",
    hoverBg: "hover:bg-pink-100",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/",
    Icon: Facebook,
    iconClass: "text-blue-600",
    hoverBg: "hover:bg-blue-100",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/",
    Icon: Youtube,
    iconClass: "text-red-600",
    hoverBg: "hover:bg-red-100",
  },
] as const;

const FOOTER_COLUMNS = [
  {
    title: "Destinations",
    items: [
      "Pokhara guide",
      "Kathmandu heritage",
      "Bhaktapur day trip",
      "Chitwan safari",
    ],
  },
  {
    title: "Experiences",
    items: [
      "Weather-based planning",
      "Festival calendar",
      "Trekking prep",
      "Local food spots",
    ],
  },
  {
    title: "Project",
    items: ["About the team", "School project", "Roadmap", "Contact"],
  },
] as const;

const Footer: React.FC<FooterProps> = ({ theme }) => {
  return (
    <footer className={`mt-16 border-t ${theme.border} bg-white`}>
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
        {/* Top */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
          <div className="space-y-3 max-w-xl w-full">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/logo.jpg"
                alt="Wander Weather logo"
                width={200}
                height={200}
                className="h-20 w-20 rounded-full object-contain"
              />

              <div>
                <p className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-800">
                  Wander Weather
                </p>
                <p className="text-xs text-slate-500">
                  AI-powered Nepal trip planner
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Wander Weather is a student-built project from Prativa Secondary
              School. It helps you plan trips in Nepal using weather, culture,
              and local-style suggestions — not just a list of places.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              Kathmandu · Pokhara · Bhaktapur · Chitwan
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
            <span className="text-xs text-slate-500 uppercase tracking-wide">
              Follow
            </span>

            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ label, href, Icon, iconClass, hoverBg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`
                    w-9 h-9 rounded-full
                    border border-slate-200
                    flex items-center justify-center
                    bg-white
                    transition-colors
                    ${hoverBg}
                    focus:outline-none focus:ring-2 focus:ring-slate-300
                  `}
                >
                  <Icon className={`w-4 h-4 ${iconClass}`} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Middle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-100 pt-6">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {col.title}
              </h4>
              <ul className="space-y-1.5 text-sm">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Early access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Early access
            </h4>

            <p className="text-xs text-slate-600">
              Try Wander Weather early and help the student team improve it.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-[11px] text-slate-500">
                  Get updates by email
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-300"
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-full text-[11px] font-semibold text-white ${theme.accentBg}`}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500 text-center md:text-left">
            © {new Date().getFullYear()} Wander Weather · Built by students at
            Prativa Secondary School.
          </p>

          <div className="flex gap-4 text-[11px] text-slate-500">
            <a className="hover:text-slate-800 cursor-pointer">Privacy</a>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <a className="hover:text-slate-800 cursor-pointer">Terms</a>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <a className="hover:text-slate-800 cursor-pointer">Feedback</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
