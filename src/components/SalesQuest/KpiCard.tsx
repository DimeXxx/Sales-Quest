import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";

interface KpiCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accent?: string; // hex color for the icon chip
}

/** Small, quiet stat tile — Active missions / Reward points / Rank. No large decorative numbers. */
export function KpiCard({ icon: Icon, value, label, accent = "#22D3EE" }: KpiCardProps) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}18` }}>
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-lg font-bold leading-none text-[#F5F7FA]">{value}</p>
        <p className="mt-0.5 text-[11px] text-[#8B98A9]">{label}</p>
      </div>
    </Card>
  );
}
