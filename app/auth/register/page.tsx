"use client";

import React, { JSX, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import type { RegisterFormValues, UserProfile } from "@/types/firebase";

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  const [loading, setLoading] = useState<boolean>(false);
  const [firebaseError, setFirebaseError] = useState<string>("");

  const onSubmit = async (data: RegisterFormValues) => {
    setFirebaseError("");
    setLoading(true);

    try {
      // create user (this also signs them in by default)
      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user: User = cred.user;

      // optionally set displayName in auth profile
      if (data.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }

      // create user document in Firestore under users/{uid}
      const userDoc: UserProfile = {
        uid: user.uid,
        email: user.email ?? null,
        displayName: data.displayName ?? null,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      router.push("/");
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? "Failed to register";
      setFirebaseError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Create an account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name (optional)</label>
            <input
              {...formRegister("displayName")}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              {...formRegister("email", { required: "Email is required" })}
              type="email"
              className="w-full mt-1 p-2 border rounded"
            />
            {errors.email && (
              <span className="text-sm text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              {...formRegister("password", {
                required: "Password required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
              type="password"
              className="w-full mt-1 p-2 border rounded"
            />
            {errors.password && (
              <span className="text-sm text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          {firebaseError && <div className="text-sm text-red-600">{firebaseError}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-blue-600 text-white font-medium"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
