"use client";

import { updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

type UpdateProfileInput = {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
};

export async function updateUserProfile(input: UpdateProfileInput) {
  const user = auth.currentUser;
  if (!user || user.uid !== input.uid) {
    throw new Error("Not authenticated.");
  }

  await updateProfile(user, {
    displayName: input.displayName,
    photoURL: input.photoURL,
  });

  await setDoc(
    doc(db, "users", input.uid),
    {
      uid: input.uid,
      email: user.email ?? null,
      displayName: input.displayName,
      photoURL: input.photoURL,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

