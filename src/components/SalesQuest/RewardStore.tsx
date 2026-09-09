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

interface RewardStoreProps {
  rewards: Reward[];
  coins: number;
  onRedeem: (reward: Reward) => void;
}

/** Reward catalog — flat neutral cards, single accent icon color, no glow blobs. */
export function RewardStore({ rewards, coins, onRedeem }: RewardStoreProps) {
  const { t } = useLanguage();
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
            <ShoppingBag className="h-4 w-4 text-[#8B98A9]" /> {t("rewardStore")}
          </h2>
          <p className="text-xs text-[#8B98A9]">{t("rewardStoreSubtitle")}</p>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <Coins className="h-3.5 w-3.5" /> {coins.toLocaleString()}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rewards.map((r) => {
          const Icon = ICONS[r.icon] ?? Gift;
          const affordable = coins >= r.costCoins;
          return (
            <Card key={r.id} interactive className="flex flex-col p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                  <Icon className="h-4.5 w-4.5 text-[#F5F7FA]" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#F5F7FA]">{r.name}</p>
                  <p className="truncate text-[11px] text-[#8B98A9]">{r.description}</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-[#223044] pt-3">
                <span className="flex items-center gap-1 text-sm font-semibold text-amber-300">
                  <Coins className="h-4 w-4" /> {r.costCoins.toLocaleString()}
                </span>
                <Button size="sm" variant={affordable ? "primary" : "secondary"} disabled={!affordable} onClick={() => onRedeem(r)}>
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
