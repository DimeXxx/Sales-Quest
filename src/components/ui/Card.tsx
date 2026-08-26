import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: "none" | "violet" | "amber" | "emerald" | "rose" | "cyan";
}

const GLOW: Record<NonNullable<CardProps["glow"]>, string> = {
  none: "",
  violet: "shadow-[0_0_55px_-15px_rgba(167,139,250,0.65)] ring-1 ring-violet-400/20",
  amber: "shadow-[0_0_55px_-15px_rgba(251,191,36,0.6)] ring-1 ring-amber-400/20",
  emerald: "shadow-[0_0_55px_-15px_rgba(52,211,153,0.6)] ring-1 ring-emerald-400/20",
  rose: "shadow-[0_0_55px_-15px_rgba(244,63,94,0.6)] ring-1 ring-rose-400/20",
  cyan: "shadow-[0_0_55px_-15px_rgba(34,211,238,0.65)] ring-1 ring-cyan-400/20",
};

export function Card({ children, className = "", glow = "none", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-zinc-900/70 backdrop-blur-sm transition-shadow duration-300 ${GLOW[glow]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
