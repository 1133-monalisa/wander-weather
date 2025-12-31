"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  ensureConversation,
  markConversationRead,
  subscribeToMessages,
} from "@/lib/firebase/chat";
import type { ChatMessage, UserProfile } from "@/types/firebase";
import { toMillis } from "./chatUtils";

type ConversationSummary = {
  lastMessageAt: any;
  lastMessageSenderId?: string;
  readAt?: any;
  lastText?: string;
};

export function useChatUsers(
  user: { uid?: string | null } | null,
  authLoading: boolean
) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    if (authLoading) return;
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
  }, [user, authLoading]);

  return { users, usersLoading, usersError };
}

export function useConversationList(userId?: string | null) {
  const [recentChatIds, setRecentChatIds] = useState<string[]>([]);
  const [conversationByPartner, setConversationByPartner] = useState<
    Record<string, ConversationSummary>
  >({});
  const [localReadByPartner, setLocalReadByPartner] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (!userId) {
      setRecentChatIds([]);
      setConversationByPartner({});
      setLocalReadByPartner({});
      return;
    }

    const conversationsRef = collection(db, "conversations");
    const conversationsQuery = query(
      conversationsRef,
      where("participants", "array-contains", userId)
    );

    return onSnapshot(conversationsQuery, (snapshot) => {
      const summaries: Record<string, ConversationSummary> = {};
      const ordered: Array<{ partnerId: string; lastMessageAt: any }> = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, any>;
        const participants = Array.isArray(data.participants)
          ? data.participants
          : [];
        const partnerId = participants.find((id: string) => id !== userId);
        if (!partnerId) return;

        const lastMessageAt = data.lastMessageAt ?? null;
        summaries[partnerId] = {
          lastMessageAt,
          lastMessageSenderId: data.lastMessageSenderId,
          readAt: data.readBy?.[userId] ?? null,
          lastText: typeof data.lastText === "string" ? data.lastText : undefined,
        };

        if (lastMessageAt) ordered.push({ partnerId, lastMessageAt });
      });

      ordered.sort(
        (a, b) => toMillis(b.lastMessageAt) - toMillis(a.lastMessageAt)
      );
      setConversationByPartner(summaries);
      setRecentChatIds(ordered.map((entry) => entry.partnerId));
    });
  }, [userId]);

  const getReadAtMs = useCallback(
    (partnerId: string) =>
      Math.max(
        localReadByPartner[partnerId] ?? 0,
        toMillis(conversationByPartner[partnerId]?.readAt)
      ),
    [localReadByPartner, conversationByPartner]
  );

  return {
    conversationByPartner,
    recentChatIds,
    getReadAtMs,
    setLocalReadByPartner,
  };
}

type ConversationMessagesArgs = {
  conversationId: string;
  userId?: string | null;
  activeUserId?: string | null;
  hasConversation: boolean;
};

export function useConversationMessages({
  conversationId,
  userId,
  activeUserId,
  hasConversation,
}: ConversationMessagesArgs) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageError, setMessageError] = useState("");
  const messagesCacheRef = useRef<Record<string, ChatMessage[]>>({});

  useEffect(() => {
    if (!conversationId || !userId || !activeUserId) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    let isActive = true;
    let unsubscribe = () => {};

    const cached = messagesCacheRef.current[conversationId];
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
          if (!isActive) return;
          setMessages(nextMessages);
          messagesCacheRef.current[conversationId] = nextMessages;
          setMessagesLoading(false);
        },
        () => {
          if (!isActive) return;
          setMessageError("Unable to load messages.");
          setMessagesLoading(false);
        }
      );
    };

    if (hasConversation) {
      startSubscription();
    } else {
      (async () => {
        try {
          await ensureConversation(conversationId, [userId, activeUserId]);
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
  }, [conversationId, userId, activeUserId, hasConversation]);

  return { messages, messagesLoading, messageError, setMessageError };
}

type ReadReceiptsArgs = {
  conversationId: string;
  userId?: string | null;
  activeUserId?: string | null;
  conversationSummary?: ConversationSummary;
  getReadAtMs: (partnerId: string) => number;
  setLocalReadByPartner: Dispatch<SetStateAction<Record<string, number>>>;
};

export function useConversationReadReceipts({
  conversationId,
  userId,
  activeUserId,
  conversationSummary,
  getReadAtMs,
  setLocalReadByPartner,
}: ReadReceiptsArgs) {
  const lastMarkedReadRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!conversationId || !userId || !activeUserId) return;
    if (!conversationSummary?.lastMessageAt) return;
    if (conversationSummary.lastMessageSenderId !== activeUserId) return;

    const lastMessageAtMs = toMillis(conversationSummary.lastMessageAt);
    if (!lastMessageAtMs) return;

    const readAtMs = getReadAtMs(activeUserId);
    if (lastMessageAtMs <= readAtMs) return;

    setLocalReadByPartner((prev) => {
      const current = prev[activeUserId] ?? 0;
      if (current >= lastMessageAtMs) return prev;
      return { ...prev, [activeUserId]: lastMessageAtMs };
    });

    const lastMarked = lastMarkedReadRef.current[activeUserId] ?? 0;
    if (lastMarked >= lastMessageAtMs) return;

    lastMarkedReadRef.current[activeUserId] = lastMessageAtMs;
    markConversationRead(conversationId, userId).catch(() => {});
  }, [
    conversationId,
    userId,
    activeUserId,
    conversationSummary,
    getReadAtMs,
    setLocalReadByPartner,
  ]);
}
