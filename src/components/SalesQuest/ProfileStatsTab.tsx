import { useState } from "react";
import { Coins, Flame, Gift } from "lucide-react";
import type { Achievement, Manager } from "../../types/sales";
import { levelFromXp } from "../../types/sales";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { Button } from "../ui/Button";
import { ActivityHeatmap } from "./ActivityHeatmap";

interface ProfileStatsTabProps {
  account: Manager;
  achievements: (Achievement & { progress: number; target: number })[];
  activeDays: string[];
  onGoToRewards: () => void;
}

export function ProfileStatsTab({ account, achievements, activeDays, onGoToRewards }: ProfileStatsTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { xpIntoLevel, xpToNext } = levelFromXp(account.xp);
  const pct = (xpIntoLevel / xpToNext) * 100;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="mb-1 text-xs text-[#8B98A9]">Уровень</p>
          <p className="mb-3 text-2xl font-bold text-[#F5F7FA]">Level {account.level}</p>
          <div className="mb-1 flex justify-between text-xs text-[#8B98A9]">
            <span>{xpIntoLevel.toLocaleString()} XP</span>
            <span>{xpToNext.toLocaleString()} XP до след. уровня</span>
          </div>
          <Progress value={pct} colorClassName="bg-violet-400" />
        </Card>

        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs text-[#8B98A9]"><Coins className="h-3.5 w-3.5" /> Reward Points</p>
            <p className="text-2xl font-bold text-amber-300">{account.coins.toLocaleString()}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={onGoToRewards}>
            <Gift className="h-3.5 w-3.5" /> В магазин
          </Button>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
            <Flame className={`h-4 w-4 ${account.streak > 0 ? "text-orange-400" : "text-[#8B98A9]"}`} /> Стрик активности
          </h2>
          <p className="text-sm font-bold text-[#F5F7FA]">{account.streak} {account.streak === 1 ? "день" : "дней"} подряд</p>
        </div>
        <ActivityHeatmap activeDays={activeDays} />
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-bold text-[#F5F7FA]">Ачивки</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {achievements.map((a) => {
            const isExpanded = expandedId === a.id;
            return (
              <Card
                key={a.id}
                interactive
                className={`cursor-pointer p-3 text-center ${a.unlocked ? "" : "opacity-50"}`}
                onClick={() => setExpandedId(isExpanded ? null : a.id)}
              >
                <div className={`mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg ${a.unlocked ? "bg-violet-500/15" : "bg-white/[0.04]"}`}>
                  <span className="text-lg">🏆</span>
                </div>
                <p className="text-[11px] font-semibold leading-tight text-[#F5F7FA]">{a.name}</p>
                {isExpanded && (
                  <div className="mt-2 border-t border-[#223044] pt-2">
                    <p className="mb-1.5 text-[10px] text-[#8B98A9]">{a.description}</p>
                    <Progress value={(a.progress / Math.max(1, a.target)) * 100} colorClassName={a.unlocked ? "bg-emerald-400" : "bg-cyan-400"} height="h-1" />
                    <p className="mt-1 font-mono text-[10px] text-[#8B98A9]">{a.progress} / {a.target}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
