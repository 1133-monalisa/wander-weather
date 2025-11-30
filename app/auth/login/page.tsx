// app/auth/login/page.tsx
"use client";

import React, { JSX, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { LoginFormValues } from "@/types/firebase";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [firebaseError, setFirebaseError] = useState<string>("");

  const onSubmit = async (data: LoginFormValues) => {
    setFirebaseError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push("/");
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? "Failed to sign in";
      setFirebaseError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Sign in</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              {...formRegister("email", { required: "Email is required" })}
              type="email"
              className="w-full mt-1 p-2 border rounded"
            />
            {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              {...formRegister("password", { required: "Password required" })}
              type="password"
              className="w-full mt-1 p-2 border rounded"
            />
            {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
          </div>

          {firebaseError && <div className="text-sm text-red-600">{firebaseError}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-blue-600 text-white font-medium"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-blue-600">Register</Link>
        </p>
      </div>
    </div>
  );
}
