import { Layers } from "lucide-react";
import type { Manager } from "../../types/sales";
import { levelFromXp } from "../../types/sales";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";

interface ProfileCardProps {
  manager: Manager;
  rank: number;
}

/**
 * Compact Level card — the gamification "5%": a small, quiet widget, not a
 * hero section. No avatar-glow theatrics, no tiered rings, no 3D coin icon.
 */
export function ProfileCard({ manager }: ProfileCardProps) {
  const { xpIntoLevel, xpToNext } = levelFromXp(manager.xp);
  const pct = (xpIntoLevel / xpToNext) * 100;

  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
        <Layers className="h-5 w-5 text-violet-300" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-bold text-[#F5F7FA]">Level {manager.level}</p>
          <p className="font-mono text-xs text-[#8B98A9]">{xpIntoLevel.toLocaleString()} / {xpToNext.toLocaleString()} XP</p>
        </div>
        <Progress value={pct} colorClassName="bg-violet-400" />
      </div>
    </Card>
  );
}
