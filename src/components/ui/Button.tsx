import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20",
  secondary: "bg-white/5 text-zinc-200 hover:bg-white/10 border border-white/10",
  danger: "bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:brightness-110 shadow-lg shadow-rose-500/20",
  ghost: "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5",
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
      className={`flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
