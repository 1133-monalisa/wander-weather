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
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Lock, User as UserIcon } from "lucide-react";

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
      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user: User = cred.user;

      if (data.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }

      const userDoc: UserProfile = {
        uid: user.uid,
        email: user.email ?? null,
        displayName: data.displayName ?? null,
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setFirebaseError("Registration failed. Email might be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative lg:flex bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
      <div className="absolute inset-0 z-0 lg:relative lg:z-auto lg:w-1/2 bg-slate-900">
        <motion.img
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5}}
          src="https://images.unsplash.com/photo-1486911278844-a81c5267e227?q=80&w=1600&auto=format&fit=crop"
          alt="Register Background"
          className="absolute inset-0 w-full h-full object-cover opacity-100 lg:opacity-60"
        />
        <div className="absolute inset-0 bg-black/40 lg:bg-gradient-to-t lg:from-slate-900 via-transparent to-transparent" />

        <div className="relative z-10 hidden lg:flex flex-col justify-between p-12 w-full h-full">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-fit group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Start your journey <br /> today.
            </h2>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              Join thousands of travelers exploring Nepal smarter. Create custom
              itineraries, get packing lists, and more.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full h-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6 lg:bg-white">
        <Link
          href="/"
          className="absolute top-6 left-6 flex lg:hidden items-center gap-2 text-white hover:text-white/80 transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" /> Home
        </Link>

        <div
          className="w-full max-w-sm space-y-8
                        bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl
                        lg:bg-transparent lg:backdrop-filter-none lg:p-0 lg:rounded-none lg:shadow-none"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create account
            </h1>
            <p className="mt-2 text-slate-500">
              Get access to AI travel planning for free.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  {...formRegister("displayName")}
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 lg:bg-white hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  {...formRegister("email", { required: "Email is required" })}
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-white/50 lg:bg-white hover:border-slate-300"
                  } focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium`}
                />
              </div>
              {errors.email && (
                <span className="text-xs font-medium text-red-500 ml-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  {...formRegister("password", {
                    required: "Password required",
                    minLength: {
                      value: 6,
                      message: "Must be at least 6 characters",
                    },
                  })}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-white/50 lg:bg-white hover:border-slate-300"
                  } focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium`}
                />
              </div>
              {errors.password && (
                <span className="text-xs font-medium text-red-500 ml-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {firebaseError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {firebaseError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating
                  account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
