"use client";

import { User } from "@/types";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginById: (id: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initial = localStorage.getItem("mock-user-id");
    if (!initial) {
      setLoading(false);
      return;
    }

    fetch(`/api/users?id=${initial}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((resolved) => setUser(resolved))
      .finally(() => setLoading(false));
  }, []);

  const loginById = async (id: string) => {
    const response = await fetch(`/api/users?id=${id}`);
    if (!response.ok) {
      return { ok: false, message: "User id not found in sample data" };
    }

    const resolved: User = await response.json();
    setUser(resolved);
    localStorage.setItem("mock-user-id", resolved.id);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem("mock-user-id");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, loginById, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
