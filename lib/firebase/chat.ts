"use client";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { ChatMessage } from "@/types/firebase";

type SendChatMessageInput = {
  conversationId: string;
  senderId: string;
  senderName: string | null;
  recipientId: string;
  text: string;
};

export function createConversationId(userA: string, userB: string) {
  return [userA, userB].sort().join("_");
}

export async function ensureConversation(
  conversationId: string,
  participants: string[]
) {
  const conversationRef = doc(db, "conversations", conversationId);
  await setDoc(
    conversationRef,
    {
      participants,
    },
    { merge: true }
  );
}

export async function markConversationRead(
  conversationId: string,
  userId: string
) {
  const conversationRef = doc(db, "conversations", conversationId);
  await updateDoc(conversationRef, {
    [`readBy.${userId}`]: serverTimestamp(),
  });
}

export function subscribeToMessages(
  conversationId: string,
  onMessages: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          text: data.text ?? "",
          senderId: data.senderId ?? "",
          senderName: data.senderName ?? null,
          recipientId: data.recipientId ?? "",
          createdAt: data.createdAt ?? null,
        } satisfies ChatMessage;
      });
      onMessages(messages);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function sendChatMessage({
  conversationId,
  senderId,
  senderName,
  recipientId,
  text,
}: SendChatMessageInput) {
  const conversationRef = doc(db, "conversations", conversationId);
  const messagesRef = collection(conversationRef, "messages");

  await ensureConversation(conversationId, [senderId, recipientId]);

  await addDoc(messagesRef, {
    text,
    senderId,
    senderName,
    recipientId,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    conversationRef,
    {
      participants: [senderId, recipientId],
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: senderId,
    },
    { merge: true }
  );

  await updateDoc(conversationRef, {
    [`readBy.${senderId}`]: serverTimestamp(),
  });
}
