import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: "none" | "violet" | "amber" | "emerald" | "rose" | "cyan";
  interactive?: boolean;
}

// Restrained accent borders only — no neon glow shadows. Gamification-related
// cards (level, achievements) can use a hint of violet; everything else
// stays on the neutral surface tokens so the product reads as a
// professional dashboard first.
const GLOW: Record<NonNullable<CardProps["glow"]>, string> = {
  none: "",
  violet: "border-violet-500/25",
  amber: "border-amber-500/25",
  emerald: "border-emerald-500/25",
  rose: "border-rose-500/25",
  cyan: "border-cyan-500/25",
};

export function Card({ children, className = "", glow = "none", interactive = false, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[#223044] bg-[#111923] transition-colors duration-150 ${
        interactive ? "hover:border-cyan-500/30" : ""
      } ${GLOW[glow]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
