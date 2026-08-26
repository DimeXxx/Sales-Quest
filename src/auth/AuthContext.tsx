import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserRole } from "../types/sales";
import * as accountsApi from "./accounts";
import type { Account } from "./accounts";

interface AuthContextValue {
  account: Account | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, role: UserRole) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(() => {
    const sessionId = accountsApi.getSessionManagerId();
    if (!sessionId) return null;
    return accountsApi.getAccounts().find((a) => a.managerId === sessionId) ?? null;
  });

  const login = useCallback((email: string, password: string) => {
    const result = accountsApi.login(email, password);
    if (!result) return false;
    setAccount(result);
    return true;
  }, []);

  const register = useCallback((name: string, email: string, password: string, role: UserRole) => {
    const result = accountsApi.register(name, email, password, role);
    if ("error" in result) return { ok: false as const, error: result.error };
    setAccount(result);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    accountsApi.logout();
    setAccount(null);
  }, []);

  const value = useMemo(
    () => ({ account, isAuthenticated: Boolean(account), login, register, logout }),
    [account, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
