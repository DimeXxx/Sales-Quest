import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

// One accent color for primary actions (cyan), everything else is a quiet
// outline/ghost. No neon glow shadows — a premium SaaS button announces
// itself through contrast and weight, not light effects.
const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-cyan-400 hover:bg-cyan-300 text-[#0B1119]",
  secondary: "bg-white/[0.04] text-[#F5F7FA] hover:bg-white/[0.08] border border-[#223044]",
  danger: "bg-rose-500/90 hover:bg-rose-500 text-white",
  ghost: "bg-transparent text-[#8B98A9] hover:text-[#F5F7FA] hover:bg-white/[0.04]",
};

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
