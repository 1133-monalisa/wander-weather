"use client";

import React, { JSX, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { LoginFormValues } from "@/types/firebase";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [firebaseError, setFirebaseError] = useState<string>("");

  const onSubmit = async (data: LoginFormValues) => {
    setFirebaseError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setFirebaseError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative lg:flex bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      <div className="absolute inset-0 z-0 lg:relative lg:z-auto lg:w-1/2 bg-slate-900">
        <motion.img
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop"
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover opacity-100 lg:opacity-60"
        />
        <div className="absolute inset-0 bg-black/40 lg:bg-gradient-to-t lg:from-slate-900 lg:via-transparent lg:to-transparent" />

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
              Welcome back to <br /> Wander Weather.
            </h2>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              Your personalized intelligent travel planner is ready. Check the
              forecast, find hidden gems, and pack smart.
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
              Sign in
            </h1>
            <p className="mt-2 text-slate-500">
              Please enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
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
                  } focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium`}
                />
              </div>
              {errors.email && (
                <span className="text-xs font-medium text-red-500 ml-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  {...formRegister("password", {
                    required: "Password required",
                  })}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-white/50 lg:bg-white hover:border-slate-300"
                  } focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium`}
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
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
