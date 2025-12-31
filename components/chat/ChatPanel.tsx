"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  MessageCircle,
  Search,
  Send,
  ChevronRight,
  ArrowLeft,
  Loader2,
  MessagesSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import {
  createConversationId,
  ensureConversation,
  markConversationRead,
  sendChatMessage,
  subscribeToMessages,
} from "@/lib/firebase/chat";
import { MOOD_THEMES, type MoodTheme } from "@/lib/mood";
import type { ChatMessage, UserProfile } from "@/types/firebase";

type ChatPanelProps = {
  locationLabel?: string;
  activeUserId?: string | null;
  onActiveUserChange?: (userId: string | null) => void;
  theme?: MoodTheme;
};

const getDisplayName = (profile: UserProfile) =>
  profile.displayName?.trim() || profile.email || "Traveler";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
};

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return null;
};

const toMillis = (value: any) => {
  const d = toDate(value);
  return d ? d.getTime() : 0;
};

const formatTime = (value?: any) => {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDay = (value?: any) => {
  const d = toDate(value);
  if (!d) return "";
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfThat.getTime()) / 86400000
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isSameDay = (a: any, b: any) => {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return false;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
        <div className="mt-2 h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ChatPanel({
  locationLabel,
  activeUserId,
  onActiveUserChange,
  theme,
}: ChatPanelProps) {
  const resolvedTheme = theme ?? MOOD_THEMES.calm;
  const { user, loading } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [localReadByPartner, setLocalReadByPartner] = useState<
    Record<string, number>
  >({});
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sending, setSending] = useState(false);

  const [search, setSearch] = useState("");
  const [recentChatIds, setRecentChatIds] = useState<string[]>([]);
  const [conversationByPartner, setConversationByPartner] = useState<
    Record<
      string,
      {
        lastMessageAt: any;
        lastMessageSenderId?: string;
        readAt?: any;
        lastText?: string;
      }
    >
  >({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesByConversationRef = useRef<Record<string, ChatMessage[]>>({});
  const conversationByPartnerRef = useRef<
    Record<
      string,
      {
        lastMessageAt: any;
        lastMessageSenderId?: string;
        readAt?: any;
        lastText?: string;
      }
    >
  >({});
  const lastMarkedReadRef = useRef<Record<string, number>>({});
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const isControlled = typeof activeUserId !== "undefined";

  // --- Load users ---
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setUsers([]);
      setUsersLoading(false);
      return;
    }

    setUsersLoading(true);
    setUsersError("");
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const nextUsers = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as UserProfile;
          return { ...data, uid: data.uid ?? docSnap.id };
        });
        setUsers(nextUsers);
        setUsersLoading(false);
      },
      () => {
        setUsersError("Unable to load travelers.");
        setUsersLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, loading]);

  // --- Conversation summaries ---
  useEffect(() => {
    if (!user?.uid) {
      setRecentChatIds([]);
      setConversationByPartner({});
      setLocalReadByPartner({});
      lastMarkedReadRef.current = {};
      return;
    }

    const conversationsRef = collection(db, "conversations");
    const conversationsQuery = query(
      conversationsRef,
      where("participants", "array-contains", user.uid)
    );

    return onSnapshot(conversationsQuery, (snapshot) => {
      const summaries: Record<
        string,
        {
          lastMessageAt: any;
          lastMessageSenderId?: string;
          readAt?: any;
          lastText?: string;
        }
      > = {};
      const ordered: Array<{ partnerId: string; lastMessageAt: any }> = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, any>;
        const participants = Array.isArray(data.participants)
          ? data.participants
          : [];
        const partnerId = participants.find((id: string) => id !== user.uid);
        if (!partnerId) return;

        const lastMessageAt = data.lastMessageAt ?? null;
        summaries[partnerId] = {
          lastMessageAt,
          lastMessageSenderId: data.lastMessageSenderId,
          readAt: data.readBy?.[user.uid] ?? null,
          lastText:
            typeof data.lastText === "string" ? data.lastText : undefined,
        };

        if (lastMessageAt) ordered.push({ partnerId, lastMessageAt });
      });

      ordered.sort(
        (a, b) => toMillis(b.lastMessageAt) - toMillis(a.lastMessageAt)
      );
      setConversationByPartner(summaries);
      setRecentChatIds(ordered.map((entry) => entry.partnerId));
    });
  }, [user?.uid]);

  useEffect(() => {
    messagesByConversationRef.current = messagesByConversation;
  }, [messagesByConversation]);

  useEffect(() => {
    conversationByPartnerRef.current = conversationByPartner;
  }, [conversationByPartner]);

  // --- Controlled/uncontrolled active user ---
  useEffect(() => {
    if (isControlled) {
      if (!activeUserId) {
        setActiveUser(null);
        return;
      }
      const match = users.find((profile) => profile.uid === activeUserId);
      setActiveUser(match ?? null);
      return;
    }

    if (
      activeUser &&
      !users.find((profile) => profile.uid === activeUser.uid)
    ) {
      setActiveUser(null);
    }
  }, [users, activeUser, activeUserId, isControlled]);

  // --- Filtering/sorting ---
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter((profile) => profile.uid !== user?.uid)
      .filter((profile) => {
        if (!term) return true;
        const label = `${profile.displayName ?? ""} ${profile.email ?? ""}`
          .trim()
          .toLowerCase();
        return label.includes(term);
      });
  }, [users, user?.uid, search]);

  const orderedRecentChatIds = useMemo(() => {
    const ids = [...recentChatIds];
    if (activeUser?.uid && !ids.includes(activeUser.uid))
      ids.unshift(activeUser.uid);
    return ids;
  }, [recentChatIds, activeUser?.uid]);

  const recentChatIdSet = useMemo(
    () => new Set(orderedRecentChatIds),
    [orderedRecentChatIds]
  );

  const recentUsers = useMemo(() => {
    const lookup = new Map(
      filteredUsers.map((profile) => [profile.uid, profile])
    );
    return orderedRecentChatIds
      .map((id) => lookup.get(id))
      .filter((profile): profile is UserProfile => Boolean(profile));
  }, [filteredUsers, orderedRecentChatIds]);

  const otherUsers = useMemo(
    () => filteredUsers.filter((profile) => !recentChatIdSet.has(profile.uid)),
    [filteredUsers, recentChatIdSet]
  );

  // --- Conversation id ---
  const conversationId = useMemo(() => {
    if (!user || !activeUser) return "";
    return createConversationId(user.uid, activeUser.uid);
  }, [user, activeUser]);

  // --- Subscribe to messages ---
  useEffect(() => {
    if (!conversationId || !user || !activeUser) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    let isActive = true;
    let unsubscribe = () => {};

    const cached = messagesByConversationRef.current[conversationId];
    if (cached?.length) {
      setMessages(cached);
      setMessagesLoading(false);
    } else {
      setMessages([]);
      setMessagesLoading(true);
    }

    setMessageError("");

    const startSubscription = () => {
      if (!isActive) return;
      unsubscribe = subscribeToMessages(
        conversationId,
        (nextMessages) => {
          setMessages(nextMessages);
          setMessagesLoading(false);
          setMessagesByConversation((prev) => ({
            ...prev,
            [conversationId]: nextMessages,
          }));
        },
        () => {
          setMessageError("Unable to load messages.");
          setMessagesLoading(false);
        }
      );
    };

    const hasConversation = Boolean(
      conversationByPartnerRef.current[activeUser.uid]
    );

    if (hasConversation) {
      startSubscription();
    } else {
      (async () => {
        try {
          await ensureConversation(conversationId, [user.uid, activeUser.uid]);
        } catch {
          if (isActive) {
            setMessageError("Unable to start chat.");
            setMessagesLoading(false);
          }
          return;
        }
        startSubscription();
      })();
    }

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [conversationId, user, activeUser]);

  // --- Mark read ---
  useEffect(() => {
    if (!conversationId || !user || !activeUser) return;

    const summary = conversationByPartner[activeUser.uid];
    if (!summary?.lastMessageAt) return;
    if (summary.lastMessageSenderId !== activeUser.uid) return;

    const lastMessageAtMs = toMillis(summary.lastMessageAt);
    if (!lastMessageAtMs) return;

    const readAtMs = Math.max(
      localReadByPartner[activeUser.uid] ?? 0,
      toMillis(summary.readAt)
    );
    if (lastMessageAtMs <= readAtMs) return;

    setLocalReadByPartner((prev) => {
      const current = prev[activeUser.uid] ?? 0;
      if (current >= lastMessageAtMs) return prev;
      return { ...prev, [activeUser.uid]: lastMessageAtMs };
    });

    const lastMarked = lastMarkedReadRef.current[activeUser.uid] ?? 0;
    if (lastMarked >= lastMessageAtMs) return;

    lastMarkedReadRef.current[activeUser.uid] = lastMessageAtMs;
    markConversationRead(conversationId, user.uid).catch(() => {});
  }, [
    conversationId,
    user,
    activeUser,
    conversationByPartner,
    localReadByPartner,
  ]);

  // --- Auto scroll ---
  useEffect(() => {
    if (!messages.length) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const getReadAtMs = useCallback(
    (partnerId: string) =>
      Math.max(
        localReadByPartner[partnerId] ?? 0,
        toMillis(conversationByPartner[partnerId]?.readAt)
      ),
    [localReadByPartner, conversationByPartner]
  );

  const activeLabel = activeUser ? getDisplayName(activeUser) : "Start a chat";

  const handleSelectUser = (profile: UserProfile) => {
    setActiveUser(profile);
    onActiveUserChange?.(profile.uid);
    setTimeout(() => composerRef.current?.focus(), 50);
  };

  // --- Composer: auto-resize + Enter-to-send ---
  const resizeComposer = useCallback(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, []);

  useEffect(() => {
    resizeComposer();
  }, [messageText, resizeComposer]);

  const handleSend = async () => {
    if (!user || !activeUser) return;
    const trimmed = messageText.trim();
    if (!trimmed) return;

    setSending(true);
    setMessageError("");

    try {
      await sendChatMessage({
        conversationId,
        senderId: user.uid,
        senderName: user.displayName ?? user.email ?? "Traveler",
        recipientId: activeUser.uid,
        text: trimmed,
      });
      setMessageText("");
      setTimeout(() => composerRef.current?.focus(), 0);
    } catch {
      setMessageError("Unable to send message. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending && activeUser && messageText.trim()) handleSend();
    }
  };

  const unreadCount = useMemo(() => {
    let count = 0;
    for (const partnerId of recentChatIds) {
      const convo = conversationByPartner[partnerId];
      if (!convo?.lastMessageAt) continue;
      if (convo.lastMessageSenderId !== partnerId) continue;
      const unread = toMillis(convo.lastMessageAt) > getReadAtMs(partnerId);
      if (unread) count += 1;
    }
    return count;
  }, [recentChatIds, conversationByPartner, getReadAtMs]);

  // --- Mobile toggle ---
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  useEffect(() => {
    if (activeUser) setMobileView("chat");
  }, [activeUser]);

  const showList = mobileView === "list";
  const showChat = mobileView === "chat";

  return (
    <div className={`h-full w-full ${resolvedTheme.surface}`}>
      <div className="h-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] h-full">
          {/* LEFT */}
          <aside
            className={[
              "min-h-0 border-b lg:border-b-0 lg:border-r",
              resolvedTheme.border,
              "bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70",
              showList ? "flex flex-col" : "hidden lg:flex lg:flex-col",
            ].join(" ")}
          >
            <div
              className={`sticky top-0 z-10 border-b ${resolvedTheme.border} bg-white/85 backdrop-blur`}
            >
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Messages
                    </p>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900">
                        Traveler Chats
                      </h2>
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`h-10 w-10 rounded-2xl ${resolvedTheme.softAccentBg} ${resolvedTheme.accentText} flex items-center justify-center shrink-0`}
                    title="Chats"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-1">
                  {locationLabel
                    ? `Talking about ${locationLabel}`
                    : "Swap tips, ask questions, and plan together."}
                </p>

                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search travelers"
                    className="w-full h-11 pl-10 pr-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading || usersLoading ? (
                <div className="space-y-2">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : usersError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {usersError}
                </div>
              ) : filteredUsers.length ? (
                <>
                  {recentUsers.length > 0 && (
                    <div className="px-1 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Recent
                    </div>
                  )}

                  {recentUsers.map((profile) => {
                    const label = getDisplayName(profile);
                    const isActive = activeUser?.uid === profile.uid;
                    const conversation = conversationByPartner[profile.uid];

                    const isUnread =
                      conversation?.lastMessageSenderId === profile.uid &&
                      toMillis(conversation.lastMessageAt) >
                        getReadAtMs(profile.uid);

                    const timeLabel = conversation?.lastMessageAt
                      ? formatTime(conversation.lastMessageAt)
                      : "";
                    const preview = conversation?.lastText?.trim();

                    // ✅ ACTIVE STYLE: mood light bg, no shadow-xs/sm
                    const activeClasses = `${resolvedTheme.softAccentBg} border ${resolvedTheme.border}`;

                    return (
                      <button
                        key={profile.uid}
                        onClick={() => {
                          handleSelectUser(profile);
                          setMobileView("chat");
                        }}
                        className={[
                          "group w-full text-left rounded-2xl border transition",
                          isActive
                            ? activeClasses
                            : "border-transparent hover:border-slate-200 hover:bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div
                            className={[
                              "h-11 w-11 rounded-2xl flex items-center justify-center font-extrabold text-xs",
                              resolvedTheme.softAccentBg,
                              resolvedTheme.accentText,
                            ].join(" ")}
                          >
                            {getInitials(label)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={[
                                  "text-sm truncate",
                                  isUnread
                                    ? "font-extrabold text-slate-900"
                                    : "font-semibold text-slate-800",
                                ].join(" ")}
                              >
                                {label}
                              </p>

                              <div className="flex items-center gap-2 shrink-0">
                                {timeLabel && (
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    {timeLabel}
                                  </span>
                                )}
                                {isUnread && (
                                  <span className="h-2 w-2 rounded-full bg-slate-900" />
                                )}
                                <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 truncate">
                              {preview ? preview : profile.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {recentUsers.length > 0 && otherUsers.length > 0 && (
                    <div className="my-2 border-t border-slate-200/70" />
                  )}

                  {otherUsers.length > 0 && (
                    <div className="px-1 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Other travelers
                    </div>
                  )}

                  {otherUsers.map((profile) => {
                    const label = getDisplayName(profile);
                    const isActive = activeUser?.uid === profile.uid;
                    const conversation = conversationByPartner[profile.uid];

                    const isUnread =
                      conversation?.lastMessageSenderId === profile.uid &&
                      toMillis(conversation.lastMessageAt) >
                        getReadAtMs(profile.uid);

                    const activeClasses = `${resolvedTheme.softAccentBg} border ${resolvedTheme.border}`;

                    return (
                      <button
                        key={profile.uid}
                        onClick={() => {
                          handleSelectUser(profile);
                          setMobileView("chat");
                        }}
                        className={[
                          "group w-full text-left rounded-2xl border transition",
                          isActive
                            ? activeClasses
                            : "border-transparent hover:border-slate-200 hover:bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div
                            className={[
                              "h-11 w-11 rounded-2xl flex items-center justify-center font-extrabold text-xs",
                              resolvedTheme.softAccentBg,
                              resolvedTheme.accentText,
                            ].join(" ")}
                          >
                            {getInitials(label)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={[
                                  "text-sm truncate",
                                  isUnread
                                    ? "font-extrabold text-slate-900"
                                    : "font-semibold text-slate-800",
                                ].join(" ")}
                              >
                                {label}
                              </p>

                              <div className="flex items-center gap-2 shrink-0">
                                {isUnread && (
                                  <span className="h-2 w-2 rounded-full bg-slate-900" />
                                )}
                                <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {profile.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="p-6 text-center text-slate-500">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    No travelers found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try a different search.
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT */}
          <section
            className={[
              "min-h-0 h-full bg-white/60",
              "flex flex-col",
              showChat ? "flex" : "hidden lg:flex",
            ].join(" ")}
          >
            {/* Header */}
            <div
              className={`sticky top-0 z-10 border-b ${resolvedTheme.border} bg-white/85 backdrop-blur`}
            >
              <div className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setMobileView("list")}
                      className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
                      aria-label="Back"
                    >
                      <ArrowLeft className="h-4 w-4 text-slate-700" />
                    </button>

                    <div
                      className={[
                        "h-11 w-11 rounded-2xl flex items-center justify-center font-extrabold text-xs",
                        activeUser
                          ? resolvedTheme.softAccentBg
                          : "bg-slate-100",
                        activeUser
                          ? resolvedTheme.accentText
                          : "text-slate-500",
                      ].join(" ")}
                    >
                      {getInitials(activeLabel)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 truncate">
                        {activeLabel}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {activeUser?.email ||
                          "Pick a traveler to start chatting."}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Active chat
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-slate-50/40 px-4 sm:px-5 py-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading chat...
                </div>
              ) : !user ? (
                <div className="h-full flex items-center justify-center text-slate-600">
                  Sign in to start chatting.
                </div>
              ) : !activeUser ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 gap-3 px-6">
                  <div className="h-14 w-14 rounded-3xl bg-white border border-slate-200 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Select a traveler to open a conversation
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Share tips, routes, and recommendations.
                  </p>
                </div>
              ) : messagesLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading messages...
                </div>
              ) : messages.length ? (
                <div className="space-y-0">
                  {messages.map((message, idx) => {
                    const isMine = message.senderId === user?.uid;
                    const prev = messages[idx - 1];

                    const showDay =
                      !prev?.createdAt ||
                      !isSameDay(prev.createdAt, message.createdAt);

                    const nextSameSender =
                      messages[idx + 1]?.senderId === message.senderId;
                    const topSpacing =
                      idx === 0 || prev?.senderId !== message.senderId
                        ? "mt-4"
                        : "mt-1";

                    return (
                      <React.Fragment key={message.id}>
                        {showDay && (
                          <div className="flex items-center justify-center py-2">
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
                              {formatDay(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          } ${topSpacing}`}
                        >
                          <div className="max-w-[78%] sm:max-w-[70%]">
                            {/* Bubble */}
                            <div
                              className={[
                                "px-4 py-2.5 text-[14px] leading-relaxed",
                                isMine
                                  ? `${resolvedTheme.accentBg} text-white rounded-2xl rounded-tr-sm`
                                  : "bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm",
                              ].join(" ")}
                            >
                              {message.text}
                            </div>

                            {/* time only at end of group */}
                            {!nextSameSender && message.createdAt && (
                              <p
                                className={[
                                  "text-[10px] text-slate-400 mt-1.5 font-medium",
                                  isMine ? "text-right" : "text-left",
                                ].join(" ")}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 text-slate-600">
                  <div
                    className={`h-12 w-12 rounded-2xl ${resolvedTheme.softAccentBg} ${resolvedTheme.accentText} flex items-center justify-center`}
                  >
                    <MessagesSquare className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-base font-extrabold text-slate-900">
                    Start the conversation
                  </p>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm">
                    Send the first message and plan your trip together.
                  </p>
                </div>
              )}
            </div>

            {/* Composer */}
            <div
              className={`border-t ${resolvedTheme.border} bg-white/90 backdrop-blur px-3 sm:px-4 py-3`}
            >
              {messageError && (
                <div className="mb-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
                  {messageError}
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1">
                  <div className="rounded-3xl border border-slate-200 bg-white focus-within:ring-1 focus-within:ring-black/10 focus-within:border-slate-300">
                    <textarea
                      ref={composerRef}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      placeholder={
                        activeUser
                          ? "Type your message..."
                          : "Select a traveler to message"
                      }
                      disabled={!activeUser || sending}
                      rows={1}
                      className="w-full resize-none bg-transparent px-4 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
                      style={{ height: 44 }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!activeUser || sending || !messageText.trim()}
                  className={[
                    "h-11 rounded-2xl font-extrabold text-sm transition",
                    "inline-flex items-center justify-center gap-2",
                    resolvedTheme.accentBg,
                    "text-white hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed",
                    "w-11 sm:w-auto sm:px-4",
                  ].join(" ")}
                  aria-label="Send message"
                  title="Send"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
