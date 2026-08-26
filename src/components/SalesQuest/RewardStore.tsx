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

const ACCENTS = [
  { from: "from-emerald-500", to: "to-teal-400", chip: "bg-emerald-500/15", text: "text-emerald-300" },
  { from: "from-violet-500", to: "to-fuchsia-400", chip: "bg-violet-500/15", text: "text-violet-300" },
  { from: "from-sky-500", to: "to-cyan-400", chip: "bg-sky-500/15", text: "text-sky-300" },
  { from: "from-amber-500", to: "to-orange-400", chip: "bg-amber-500/15", text: "text-amber-300" },
  { from: "from-rose-500", to: "to-pink-400", chip: "bg-rose-500/15", text: "text-rose-300" },
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
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-400">
            <ShoppingBag className="h-4 w-4 text-emerald-400" /> {t("rewardStore")}
          </h2>
          <p className="text-xs text-zinc-600">{t("rewardStoreSubtitle")}</p>
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
            <Card key={r.id} className="group flex flex-col overflow-hidden p-0">
              <div className={`relative flex h-24 items-center justify-center overflow-hidden bg-gradient-to-br ${accent.from} ${accent.to}`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(https://picsum.photos/seed/${r.id}/400/200)`, backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "overlay" }} />
                <Icon className="relative h-9 w-9 text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-sm font-semibold leading-tight text-zinc-100">{r.name}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{r.description}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-300">
                    <Coins className="h-4 w-4" /> {r.costCoins.toLocaleString()}
                  </span>
                  <Button size="sm" disabled={!affordable} onClick={() => onRedeem(r)}>
                    {affordable ? t("exchange") : t("notEnough")}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
