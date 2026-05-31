import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-brand text-black hover:bg-yellow-300",
    secondary: "border border-border bg-panel-soft text-foreground hover:border-brand/60",
    ghost: "text-muted hover:bg-white/5 hover:text-foreground",
    danger: "bg-danger text-white hover:bg-rose-400",
  };

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

