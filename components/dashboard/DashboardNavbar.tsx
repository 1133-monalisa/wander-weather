"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";

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
import { db } from "@/lib/firebase/config";

import {
  Check,
  LogOut,
  MessageCircle,
  MoreVertical,
  User as UserIcon,
  Bookmark,
  Star,
} from "lucide-react";

interface DashboardNavbarProps {
  mood: Mood;
  theme: MoodTheme;
  onChangeMood: (m: Mood) => void;
}

const toMillis = (value: any) => {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return 0;
};

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  mood,
  theme,
  onChangeMood,
}) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      return;
    }

    const conversationsRef = collection(db, "conversations");
    const conversationsQuery = query(
      conversationsRef,
      where("participants", "array-contains", user.uid)
    );

    const activeChatUserId =
      pathname === "/messages" ? searchParams.get("id") : null;

    return onSnapshot(
      conversationsQuery,
      (snapshot) => {
        let count = 0;
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, any>;
          const lastMessageAt = data.lastMessageAt;
          if (!lastMessageAt) return;

          const senderId = data.lastMessageSenderId;
          if (senderId && senderId === user.uid) return;

          const participants = Array.isArray(data.participants)
            ? data.participants
            : [];
          const partnerId = participants.find((id) => id !== user.uid);
          if (activeChatUserId && partnerId === activeChatUserId) {
            return;
          }

          const readAt = data.readBy?.[user.uid];
          if (!readAt || toMillis(lastMessageAt) > toMillis(readAt)) {
            count += 1;
          }
        });

        setUnreadCount(count);
      },
      () => setUnreadCount(0)
    );
  }, [user?.uid, pathname, searchParams]);

  const activeMoodMeta = MOOD_THEMES[mood];
  const unreadLabel = unreadCount > 9 ? "9+" : `${unreadCount}`;
  const isMessagesActive = pathname === "/messages";
  const isSavedTripsActive = pathname === "/saved-trips";
  const isReviewsActive = pathname === "/reviews";

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-colors duration-500 bg-white/80 backdrop-blur-xl border-b ${theme.border}`}
      >
        <div className="max-w-7xl mx-auto p-2 md:p-2 lg:p-0 h-20 flex items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl ${theme.accentBg} text-white flex items-center justify-center shadow-lg transition-colors duration-500 flex-shrink-0`}
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

            <div className="min-w-0">
              <span
                className={`text-lg font-bold tracking-tight block leading-none ${theme.heading}`}
              >
                Wander Weather
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                DASHBOARD
              </span>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Messages (desktop/tablet) */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/messages"
                    aria-label="Open messages"
                  className={`relative h-10 w-10 rounded-full border ${theme.border} hidden sm:flex items-center justify-center transition ${
                      isMessagesActive
                        ? `${theme.accentBg} text-white shadow-md`
                        : unreadCount
                          ? `${theme.softAccentBg} ${theme.accentText}`
                          : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadLabel}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  {unreadCount > 0
                    ? `Messages (${unreadCount} new)`
                    : "Messages"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Saved trips (desktop/tablet) */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/saved-trips"
                    aria-label="Open saved trips"
                  className={`relative h-10 w-10 rounded-full border ${theme.border} hidden sm:flex items-center justify-center transition ${
                      isSavedTripsActive
                        ? `${theme.accentBg} text-white shadow-md`
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Bookmark className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  Saved trips
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Reviews (desktop/tablet) */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/reviews"
                    aria-label="Open traveler reviews"
                    className={`relative h-10 w-10 rounded-full border ${theme.border} hidden sm:flex items-center justify-center transition ${
                      isReviewsActive
                        ? `${theme.accentBg} text-white shadow-md`
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  Reviews
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Mobile quick actions: messages + mood */}
            <div className="sm:hidden">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-10 rounded-full border border-slate-200"
                    aria-label="Open quick actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-64">
                  <DropdownMenuLabel className="text-xs text-slate-500">
                    Quick actions
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => router.push("/messages")}
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Messages
                    </span>
                    {unreadCount > 0 && (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                        {unreadLabel}
                      </span>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => router.push("/saved-trips")}
                  >
                    <span className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4" />
                      Saved trips
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => router.push("/reviews")}
                  >
                    <span className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Reviews
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-slate-500">
                    Mood
                  </DropdownMenuLabel>
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
                          className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border ${theme.border} ${theme.softAccentBg}`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="flex-1">
                          <span className="text-sm font-semibold flex items-center gap-2">
                            {m.name}
                            {isActive && <Check className="w-4 h-4" />}
                          </span>
                          <span className="text-xs text-slate-500">
                            {m.desc}
                          </span>
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop mood */}
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

            {/* Account */}
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
                        {loading ? "..." : initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-64">
                <DropdownMenuLabel className="space-y-1">
                  <div className="text-sm font-bold">{displayName}</div>
                  <div className="text-xs text-slate-500 font-medium">
                    {user?.email ?? ""}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Logout confirm dialog */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account and returned to the home
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

export default DashboardNavbar;
