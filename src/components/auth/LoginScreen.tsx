import { useState } from "react";
import { LogIn, UserPlus, Zap } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { getDemoAccounts } from "../../auth/accounts";
import { useLanguage } from "../../i18n/LanguageContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { BgDecor } from "../ui/BgDecor";
import type { UserRole } from "../../types/sales";

export function LoginScreen() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("manager");
  const [error, setError] = useState("");

  const demoAccounts = getDemoAccounts();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      if (!email || !password) {
        setError(t("fillAllFields"));
        return;
      }
      const ok = login(email, password);
      if (!ok) setError(t("invalidCredentials"));
    } else {
      if (!name || !email || !password) {
        setError(t("fillAllFields"));
        return;
      }
      const result = register(name, email, password, role);
      if (!result.ok) setError(t(result.error as "emailTaken"));
    }
  };

  const field =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-400";

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-950 px-4 text-zinc-100">
      <BgDecor />
      <div className="absolute right-5 top-5 z-10">
        <LanguageSwitcher />
      </div>

      <Card glow="cyan" className="relative z-10 w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-400 shadow-lg shadow-cyan-400/30">
            <Zap className="h-5 w-5 text-zinc-950" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-black leading-none text-zinc-50">{t("appName")}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-cyan-300/70">{t("appTagline")}</p>
          </div>
        </div>

        <h1 className="mb-1 text-lg font-bold text-zinc-50">
          {mode === "login" ? t("loginTitle") : t("registerTitle")}
        </h1>
        <p className="mb-5 text-xs text-zinc-500">{mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}</p>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input className={field} placeholder={t("name")} value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <input
            className={field}
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={field}
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "register" && (
            <div className="flex gap-2">
              {(["manager", "rop"] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    role === r
                      ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                      : "border-white/10 bg-white/[0.02] text-zinc-500"
                  }`}
                >
                  {r === "manager" ? t("roleManager") : t("roleRop")}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}

          <Button type="submit" className="w-full">
            {mode === "login" ? (
              <>
                <LogIn className="h-4 w-4" /> {t("loginButton")}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> {t("registerButton")}
              </>
            )}
          </Button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="mt-4 w-full text-center text-xs font-semibold text-zinc-500 hover:text-cyan-300"
        >
          {mode === "login" ? t("switchToRegister") : t("switchToLogin")}
        </button>

        {mode === "login" && (
          <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
              {t("demoAccountsHint")}
            </p>
            <div className="space-y-0.5">
              {demoAccounts.slice(0, 4).map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword("demo123");
                  }}
                  className="block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] text-zinc-500 hover:bg-white/[0.04] hover:text-cyan-300"
                >
                  {a.name} — {a.email}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
