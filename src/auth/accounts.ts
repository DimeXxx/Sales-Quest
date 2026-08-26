import type { UserRole } from "../types/sales";
import { MANAGERS } from "../data/mockData";

// ---------------------------------------------------------------------------
// IMPORTANT: this is a client-only demo auth layer for the internal pilot.
// Passwords are stored in plaintext in localStorage — this is NOT secure and
// must be replaced by a real backend (hashed passwords, sessions/JWT, HTTPS)
// before this app is exposed outside a trusted internal pilot.
// ---------------------------------------------------------------------------

export interface Account {
  managerId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const STORAGE_KEY = "sq_accounts";
const SESSION_KEY = "sq_session";
const DEFAULT_PASSWORD = "demo123";

function seedAccounts(): Account[] {
  return MANAGERS.map((m, i) => ({
    managerId: m.id,
    email: `${m.name.toLowerCase().replace(/[^a-zа-я]/gi, "").slice(0, 12) || `user${i}`}@qgroup.demo`,
    password: DEFAULT_PASSWORD,
    name: m.name,
    role: m.role,
  }));
}

function loadAccounts(): Account[] {
  if (typeof window === "undefined") return seedAccounts();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedAccounts();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as Account[];
  } catch {
    const seeded = seedAccounts();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function saveAccounts(accounts: Account[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function getAccounts(): Account[] {
  return loadAccounts();
}

export function getDemoAccounts(): Account[] {
  return seedAccounts();
}

export function findAccountByEmail(email: string): Account | undefined {
  return loadAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
}

export function login(email: string, password: string): Account | null {
  const account = findAccountByEmail(email);
  if (!account || account.password !== password) return null;
  window.localStorage.setItem(SESSION_KEY, account.managerId);
  return account;
}

export function register(name: string, email: string, password: string, role: UserRole): Account | { error: string } {
  const accounts = loadAccounts();
  if (findAccountByEmail(email)) return { error: "emailTaken" };
  const managerId = `m${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const account: Account = { managerId, email: email.trim().toLowerCase(), password, name, role };
  accounts.push(account);
  saveAccounts(accounts);
  window.localStorage.setItem(SESSION_KEY, managerId);
  return account;
}

export function logout() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getSessionManagerId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
