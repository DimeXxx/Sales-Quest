import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Manager } from "../types/sales";
import { api, ApiError } from "../lib/api";

type Account = Manager; // the backend account IS the manager profile

interface AuthContextValue {
  account: Account | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { account } = await api.get<{ account: Account }>("/auth/me");
      setAccount(account);
    } catch {
      setAccount(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { account } = await api.post<{ account: Account }>("/auth/login", { email, password });
      setAccount(account);
      return { ok: true as const };
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "unknown_error";
      return { ok: false as const, error: code };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      // Role is always "manager" server-side — self-registration can never grant admin access.
      const { account } = await api.post<{ account: Account }>("/auth/register", { name, email, password });
      setAccount(account);
      return { ok: true as const };
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "unknown_error";
      return { ok: false as const, error: code };
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    setAccount(null);
  }, []);

  const value = useMemo(
    () => ({ account, isLoading, isAuthenticated: Boolean(account), login, register, logout, refresh }),
    [account, isLoading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
