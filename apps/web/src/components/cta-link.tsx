import Link from "next/link";

import { cn } from "@repo/ui";

export interface CtaLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function CtaLink({ href, label, className }: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-9 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 ring-inset shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] transition-all duration-300 hover:shadow-[0_14px_44px_-12px_rgba(244,114,182,0.75)] hover:brightness-110 active:scale-[0.97]",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      {label}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
