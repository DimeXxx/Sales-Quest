import type { ReactNode } from "react";
import type { Priority } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";

interface BadgeProps {
  children: ReactNode;
  tone?: "critical" | "high" | "normal" | "neutral" | "success";
  className?: string;
}

const TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  normal: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  neutral: "bg-white/5 text-slate-300 border-white/10",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const DOT_TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  critical: "bg-rose-400",
  high: "bg-amber-400",
  normal: "bg-emerald-400",
  neutral: "bg-slate-400",
  success: "bg-emerald-400",
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONES[tone]}`} />
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
