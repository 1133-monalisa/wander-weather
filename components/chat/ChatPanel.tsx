"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { MessageCircle, Search, Send } from "lucide-react";
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

const formatTime = (value?: any) => {
  if (!value) return "";
  const date =
    typeof value?.toDate === "function" ? value.toDate() : value instanceof Date ? value : null;
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const toMillis = (value: any) => {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return 0;
};

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesByConversationRef = useRef<Record<string, ChatMessage[]>>({});
  const conversationByPartnerRef = useRef<
    Record<string, { lastMessageAt: any; lastMessageSenderId?: string; readAt?: any }>
  >({});
  const lastMarkedReadRef = useRef<Record<string, number>>({});
  const isControlled = typeof activeUserId !== "undefined";
  const [recentChatIds, setRecentChatIds] = useState<string[]>([]);
  const [conversationByPartner, setConversationByPartner] = useState<
    Record<string, { lastMessageAt: any; lastMessageSenderId?: string; readAt?: any }>
  >({});

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
          return {
            ...data,
            uid: data.uid ?? docSnap.id,
          };
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
        { lastMessageAt: any; lastMessageSenderId?: string; readAt?: any }
      > = {};
      const ordered: Array<{ partnerId: string; lastMessageAt: any }> = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, any>;
        const participants = Array.isArray(data.participants)
          ? data.participants
          : [];
        const partnerId = participants.find((id) => id !== user.uid);
        if (!partnerId) return;

        const lastMessageAt = data.lastMessageAt ?? null;
        summaries[partnerId] = {
          lastMessageAt,
          lastMessageSenderId: data.lastMessageSenderId,
          readAt: data.readBy?.[user.uid] ?? null,
        };

        if (lastMessageAt) {
          ordered.push({ partnerId, lastMessageAt });
        }
      });

      ordered.sort((a, b) => toMillis(b.lastMessageAt) - toMillis(a.lastMessageAt));
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

    if (activeUser && !users.find((profile) => profile.uid === activeUser.uid)) {
      setActiveUser(null);
    }
  }, [users, activeUser, activeUserId, isControlled]);

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
    if (activeUser?.uid && !ids.includes(activeUser.uid)) {
      ids.unshift(activeUser.uid);
    }
    return ids;
  }, [recentChatIds, activeUser?.uid]);

  const recentChatIdSet = useMemo(
    () => new Set(orderedRecentChatIds),
    [orderedRecentChatIds]
  );

  const recentUsers = useMemo(() => {
    const lookup = new Map(filteredUsers.map((profile) => [profile.uid, profile]));
    return orderedRecentChatIds
      .map((id) => lookup.get(id))
      .filter((profile): profile is UserProfile => Boolean(profile));
  }, [filteredUsers, orderedRecentChatIds]);

  const otherUsers = useMemo(
    () => filteredUsers.filter((profile) => !recentChatIdSet.has(profile.uid)),
    [filteredUsers, recentChatIdSet]
  );

  const conversationId = useMemo(() => {
    if (!user || !activeUser) return "";
    return createConversationId(user.uid, activeUser.uid);
  }, [user, activeUser]);

  useEffect(() => {
    if (!conversationId || !user || !activeUser) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    let isActive = true;
    let unsubscribe = () => {};
    const cachedMessages = messagesByConversationRef.current[conversationId];
    if (cachedMessages?.length) {
      setMessages(cachedMessages);
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
        } catch (err) {
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
  }, [conversationId, user, activeUser, conversationByPartner, localReadByPartner]);

  useEffect(() => {
    if (!messages.length) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const getReadAtMs = useCallback(
    (partnerId: string) =>
      Math.max(
        localReadByPartner[partnerId] ?? 0,
        toMillis(conversationByPartner[partnerId]?.readAt)
      ),
    [localReadByPartner, conversationByPartner]
  );

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
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
    } catch (err) {
      setMessageError("Unable to send message. Try again.");
    } finally {
      setSending(false);
    }
  };

  const activeLabel = activeUser ? getDisplayName(activeUser) : "Start a chat";
  const handleSelectUser = (profile: UserProfile) => {
    setActiveUser(profile);
    if (onActiveUserChange) onActiveUserChange(profile.uid);
  };

  return (
    <div className={`h-full w-full max-w-7xl mx-auto ${resolvedTheme.surface}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] h-full">
        <aside
          className={`flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r ${resolvedTheme.border} bg-white/90`}
        >
          <div
            className={`px-5 py-4 border-b ${resolvedTheme.border} bg-white/95`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Messages
                </p>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Traveler Chats
                </h2>
              </div>
              <div
                className={`h-9 w-9 rounded-full ${resolvedTheme.softAccentBg} ${resolvedTheme.accentText} flex items-center justify-center shrink-0`}
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
                className="w-full h-10 pl-10 pr-3 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-slate-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading || usersLoading ? (
              <div className="p-4 text-sm text-slate-500">Loading travelers...</div>
            ) : usersError ? (
              <div className="p-4 text-sm text-red-500">{usersError}</div>
            ) : filteredUsers.length ? (
              <>
                {recentUsers.length > 0 && (
                  <div className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Recent chats
                  </div>
                )}
                {recentUsers.map((profile) => {
                  const label = getDisplayName(profile);
                  const isActive = activeUser?.uid === profile.uid;
                  const conversation = conversationByPartner[profile.uid];
                  const isUnread =
                    conversation?.lastMessageSenderId === profile.uid &&
                    toMillis(conversation.lastMessageAt) > getReadAtMs(profile.uid);
                  return (
                    <button
                      key={profile.uid}
                      onClick={() => handleSelectUser(profile)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        isActive
                          ? `bg-white border ${resolvedTheme.border} shadow-sm`
                          : "hover:bg-white"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full ${resolvedTheme.softAccentBg} ${resolvedTheme.accentText} font-bold text-xs flex items-center justify-center`}
                      >
                        {getInitials(label)}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-700"
                          }`}
                        >
                          {label}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isUnread ? "text-slate-600" : "text-slate-400"
                          }`}
                        >
                          {profile.email || "No email"}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {recentUsers.length > 0 && otherUsers.length > 0 && (
                  <div className="border-t border-slate-200/70 my-2" />
                )}

                {otherUsers.length > 0 && (
                  <div className="px-2 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Other travelers
                  </div>
                )}
                {otherUsers.map((profile) => {
                  const label = getDisplayName(profile);
                  const isActive = activeUser?.uid === profile.uid;
                  const conversation = conversationByPartner[profile.uid];
                  const isUnread =
                    conversation?.lastMessageSenderId === profile.uid &&
                    toMillis(conversation.lastMessageAt) > getReadAtMs(profile.uid);
                  return (
                    <button
                      key={profile.uid}
                      onClick={() => handleSelectUser(profile)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        isActive
                          ? `bg-white border ${resolvedTheme.border} shadow-sm`
                          : "hover:bg-white"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full ${resolvedTheme.softAccentBg} ${resolvedTheme.accentText} font-bold text-xs flex items-center justify-center`}
                      >
                        {getInitials(label)}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-700"
                          }`}
                        >
                          {label}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isUnread ? "text-slate-600" : "text-slate-400"
                          }`}
                        >
                          {profile.email || "No email"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </>
            ) : (
              <div className="p-4 text-sm text-slate-500">
                No other travelers yet.
              </div>
            )}
          </div>
        </aside>

        <section className="flex flex-col min-h-0 h-full bg-white/70">
          <div className={`px-5 py-4 border-b ${resolvedTheme.border} bg-white/90`}>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Active chat
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                {getInitials(activeLabel)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {activeLabel}
                </p>
                <p className="text-xs text-slate-500">
                  {activeUser?.email || "Pick a traveler to start chatting."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5 space-y-3">
            {loading ? (
              <div className="text-sm text-slate-500">Loading chat...</div>
            ) : !user ? (
              <div className="text-sm text-slate-500">
                Sign in to start chatting.
              </div>
            ) : !activeUser ? (
              <div className="flex flex-col items-center justify-center text-center text-slate-500 h-full gap-2">
                <MessageCircle className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-medium">
                  Select a traveler to open a conversation.
                </p>
              </div>
            ) : messagesLoading ? (
              <div className="text-sm text-slate-500">Loading messages...</div>
            ) : messages.length ? (
              messages.map((message) => {
                const isMine = message.senderId === user?.uid;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                        isMine
                          ? `${resolvedTheme.accentBg} text-white`
                          : `bg-white text-slate-900 border ${resolvedTheme.border}`
                      }`}
                    >
                      {!isMine && (
                        <p
                          className={`text-[11px] font-semibold ${resolvedTheme.accentText} mb-1`}
                        >
                          {message.senderName || activeLabel}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                      {message.createdAt && (
                        <p
                          className={`text-[10px] mt-1 ${
                            isMine ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500">
                No messages yet. Say hello to start the conversation.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className={`border-t ${resolvedTheme.border} bg-white px-4 py-3`}
          >
            {messageError && (
              <div className="mb-2 text-xs font-medium text-red-500">
                {messageError}
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder={
                  activeUser
                    ? `Message ${getDisplayName(activeUser)}`
                    : "Select a traveler to message"
                }
                disabled={!activeUser || sending}
                className="flex-1 h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-slate-300 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!activeUser || sending || !messageText.trim()}
                className={`h-11 px-4 rounded-full ${resolvedTheme.accentBg} text-white font-bold text-sm shadow-lg shadow-black/10 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
