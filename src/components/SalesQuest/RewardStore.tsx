import { Car, Coins, Gift, Headphones, Plane, ShoppingBag, Sun, Utensils } from "lucide-react";
import type { Reward } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

const ICONS: Record<string, typeof Gift> = {
  gift: Gift,
  sun: Sun,
  car: Car,
  utensils: Utensils,
  headphones: Headphones,
  plane: Plane,
};

// Soft inner-glow accent per reward, in the "mystery loot" style — a color
// hint rather than a loud flat banner.
const ACCENTS = [
  { glow: "bg-emerald-500/25", ring: "group-hover:ring-emerald-400/40", icon: "text-emerald-300" },
  { glow: "bg-violet-500/25", ring: "group-hover:ring-violet-400/40", icon: "text-violet-300" },
  { glow: "bg-sky-500/25", ring: "group-hover:ring-sky-400/40", icon: "text-sky-300" },
  { glow: "bg-amber-500/25", ring: "group-hover:ring-amber-400/40", icon: "text-amber-300" },
  { glow: "bg-rose-500/25", ring: "group-hover:ring-rose-400/40", icon: "text-rose-300" },
];

interface RewardStoreProps {
  rewards: Reward[];
  coins: number;
  onRedeem: (reward: Reward) => void;
}

export function RewardStore({ rewards, coins, onRedeem }: RewardStoreProps) {
  const { t } = useLanguage();
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
            <ShoppingBag className="h-4 w-4 text-emerald-400" /> {t("rewardStore")}
          </h2>
          <p className="text-xs text-slate-600">{t("rewardStoreSubtitle")}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          <Coins className="h-3.5 w-3.5" /> {coins.toLocaleString()}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rewards.map((r, i) => {
          const Icon = ICONS[r.icon] ?? Gift;
          const accent = ACCENTS[i % ACCENTS.length];
          const affordable = coins >= r.costCoins;
          return (
            <Card
              key={r.id}
              interactive
              className={`group relative flex flex-col overflow-hidden p-5 ring-1 ring-transparent transition-all ${accent.ring}`}
            >
              {/* soft inner glow blob behind the icon — no flat color banner */}
              <div className={`pointer-events-none absolute -top-8 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full ${accent.glow} blur-2xl transition-opacity duration-300 group-hover:opacity-80`} />

              <div className="relative mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-slate-950/60">
                  <Icon className={`h-6 w-6 ${accent.icon} transition-transform duration-300 group-hover:scale-110`} strokeWidth={1.75} />
                </div>
              </div>

              <p className="relative text-center text-sm font-semibold leading-tight text-slate-100">{r.name}</p>
              <p className="relative mt-1 text-center text-[11px] text-slate-500">{r.description}</p>

              <div className="relative mt-4 flex items-center justify-between border-t border-white/5 pt-3.5">
                <span className="flex items-center gap-1 text-sm font-bold text-amber-300">
                  <Coins className="h-4 w-4" /> {r.costCoins.toLocaleString()}
                </span>
                <Button size="sm" disabled={!affordable} onClick={() => onRedeem(r)}>
                  {affordable ? t("exchange") : t("notEnough")}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
