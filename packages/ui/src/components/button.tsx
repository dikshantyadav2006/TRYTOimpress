import type { ButtonHTMLAttributes } from "react";

import { cn } from "../lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "primary" &&
          "bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-[0_8px_32px_-12px_rgba(244,114,182,0.6)] ring-1 ring-white/20 ring-inset hover:brightness-110 active:scale-95",
        variant === "ghost" && "text-foreground border border-white/15 hover:bg-white/5",
        size === "md" && "px-6 py-2.5 text-sm",
        size === "lg" && "px-8 py-3.5 text-base",
        className,
      )}
      {...props}
    />
  );
}
