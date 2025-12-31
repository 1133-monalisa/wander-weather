"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "firebase/auth";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Cookies from "js-cookie";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  sessionVerified: boolean;
  sessionLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdToken();
        Cookies.set("token", token, { expires: 1 });
        setUser(u);
        setSessionVerified(false);
        setSessionLoading(true);
      } else {
        Cookies.remove("token");
        setUser(null);
        setSessionVerified(false);
        setSessionLoading(false);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) return;

    const verifySession = async () => {
      setSessionLoading(true);
      try {
        const res = await fetch("/api/auth/verify-session");
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        setSessionVerified(Boolean(res.ok && (data as any)?.isLogged));
      } catch {
        if (active) setSessionVerified(false);
      } finally {
        if (active) setSessionLoading(false);
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, [user]);

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(
    () => ({ user, loading, logout, sessionVerified, sessionLoading }),
    [user, loading, sessionVerified, sessionLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
