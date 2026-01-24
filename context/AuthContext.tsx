"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { User } from "firebase/auth";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  sessionVerified: boolean;
  sessionLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  profileVersion: number;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdToken();
        Cookies.set("token", token, { expires: 1 });
        setUser(u);
        setProfileVersion((v) => v + 1);
        setSessionVerified(false);
        setSessionLoading(true);
      } else {
        Cookies.remove("token");
        setUser(null);
        setProfileVersion((v) => v + 1);
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

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    setUser(auth.currentUser);
    setProfileVersion((v) => v + 1);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      logout,
      refreshUser,
      profileVersion,
      sessionVerified,
      sessionLoading,
    }),
    [
      user,
      loading,
      logout,
      refreshUser,
      profileVersion,
      sessionVerified,
      sessionLoading,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Toaster position="top-center" reverseOrder={false} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
