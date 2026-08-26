import type { ReactNode } from "react";
import type { Priority } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";

interface BadgeProps {
  children: ReactNode;
  tone?: "critical" | "high" | "normal" | "neutral" | "success";
  className?: string;
}

const TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  critical: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  high: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  normal: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  neutral: "bg-white/5 text-slate-300 border-white/10",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
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
