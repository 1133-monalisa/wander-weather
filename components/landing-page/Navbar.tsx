"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { MOOD_THEMES, Mood, MoodTheme } from "@/lib/mood";
import { SMOOTH_EASE } from "@/lib/animation";
import { useAuth } from "@/context/AuthContext";

import { LogOut, PlaneTakeoff, User as UserIcon } from "lucide-react";

interface NavbarProps {
  mood: Mood;
  theme: MoodTheme;
  onChangeMood: (m: Mood) => void;
  variant?: "landing" | "dashboard";
}

const Navbar: React.FC<NavbarProps> = ({
  mood,
  theme,
  onChangeMood,
  variant = "landing",
}) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const displayName =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "Account");

  const initials = useMemo(() => {
    const base = displayName?.trim() || "User";
    const parts = base.split(" ").filter(Boolean).slice(0, 2);
    const joined = parts.map((p) => p[0]?.toUpperCase()).join("");
    return joined || "U";
  }, [displayName]);

  async function handleLogout() {
    try {
      await logout();
      setLogoutOpen(false);
      router.push("/");
    } catch {
      setLogoutOpen(false);
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: SMOOTH_EASE }}
        className={`fixed top-0 w-full z-50 transition-colors duration-500 bg-white/80 backdrop-blur-xl border-b ${theme.border}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand */}
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

          {/* Nav links: ONLY on landing */}
          {variant === "landing" && (
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
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
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

            {/* CTA / Account */}
            {variant === "landing" ? (
              <>
                {/* Desktop: full button */}
                <Link
                  href="/auth/register"
                  className={`hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg transition-all active:scale-95 ${theme.accentBg}`}
                >
                  Start Planning
                </Link>

                {/* Mobile: icon */}
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/auth/register"
                        className={`lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-white shadow-md active:scale-95 transition ${theme.accentBg}`}
                        aria-label="Start Planning"
                      >
                        <PlaneTakeoff className="w-5 h-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-xs font-medium"
                    >
                      Start Planning
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center">
                    {/* Desktop: name button */}
                    <Button
                      variant="outline"
                      className="hidden lg:flex rounded-full px-4 font-semibold"
                      disabled={loading}
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      {loading ? "Loading..." : displayName}
                    </Button>

                    {/* Mobile/Tablet: avatar */}
                    <Button
                      variant="ghost"
                      className="lg:hidden rounded-full p-0 w-10 h-10"
                      disabled={loading}
                      aria-label="Open account menu"
                    >
                      <Avatar className="w-9 h-9">
                        <AvatarImage
                          src={(user as any)?.photoURL ?? ""}
                          alt={displayName}
                        />
                        <AvatarFallback className="text-xs font-bold">
                          {loading ? "…" : initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-64"
                >
                  <DropdownMenuLabel className="space-y-1">
                    <div className="text-sm font-bold">{displayName}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      {user?.email ?? "—"}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setLogoutOpen(true)}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Logout confirm dialog */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You’ll be signed out of your account and returned to the home
              page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;
