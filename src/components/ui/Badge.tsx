import type { ReactNode } from "react";
import type { Priority } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";

interface BadgeProps {
  children: ReactNode;
  tone?: "critical" | "high" | "normal" | "neutral" | "success";
  className?: string;
}

// Semantic colors per the spec: critical=red/coral, high=orange,
// normal=green. Kept as quiet solid-fill chips (uppercase label), not
// glowing outline pills — reads as a status tag on an enterprise dashboard.
const TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  critical: "bg-rose-500/15 text-rose-300",
  high: "bg-orange-500/15 text-orange-300",
  normal: "bg-emerald-500/15 text-emerald-300",
  neutral: "bg-white/[0.06] text-[#8B98A9]",
  success: "bg-emerald-500/15 text-emerald-300",
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

const PRIORITY_TONE: Record<Priority, BadgeProps["tone"]> = {
  critical: "critical",
  high: "high",
  normal: "normal",
};

const PRIORITY_KEY: Record<Priority, "filterCritical" | "filterHigh" | "filterNormal"> = {
  critical: "filterCritical",
  high: "filterHigh",
  normal: "filterNormal",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useLanguage();
  return <Badge tone={PRIORITY_TONE[priority]}>{t(PRIORITY_KEY[priority])}</Badge>;
}
