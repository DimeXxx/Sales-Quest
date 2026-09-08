import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: "none" | "violet" | "amber" | "emerald" | "rose" | "cyan";
  interactive?: boolean;
}

const GLOW: Record<NonNullable<CardProps["glow"]>, string> = {
  none: "",
  violet: "shadow-xl shadow-violet-950/30 border-violet-500/30",
  amber: "shadow-xl shadow-amber-950/30 border-amber-500/50",
  emerald: "shadow-xl shadow-emerald-950/30 border-emerald-500/50",
  rose: "shadow-xl shadow-rose-950/30 border-rose-500/50",
  cyan: "shadow-xl shadow-cyan-950/30 border-cyan-500/40",
};

/**
 * Glassmorphic base card used throughout the app: semi-transparent slate
 * surface, soft blur, subtle border that lights up cyan on hover unless a
 * stronger contextual glow color has already been set via `glow`.
 */
export function Card({ children, className = "", glow = "none", interactive = false, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#151D2A]/90 backdrop-blur-md shadow-xl shadow-cyan-950/10 transition-all duration-300 ${
        interactive ? "hover:border-cyan-500/40 hover:shadow-cyan-950/20" : ""
      } ${GLOW[glow]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
