import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setAuthToken as persistToken, clearAuthToken, getAuthToken } from "../api/token";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  login: (payload: { token: string; user: AuthUser }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const t = getAuthToken();
    const rawUser = localStorage.getItem(STORAGE_USER_KEY);
    if (t && rawUser) {
      setToken(t);
      try {
        setUser(JSON.parse(rawUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = (payload: { token: string; user: AuthUser }) => {
    setToken(payload.token);
    setUser(payload.user);
    persistToken(payload.token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(payload.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAuthToken();
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}