import Link from "next/link";

import { cn } from "@repo/ui";

import { CtaLink } from "@/components/cta-link";
import { ShareButton } from "@/components/share-button";

export interface StepNavProps {
  step: number;
  total: number;
  next: { href: string; label: string } | null | undefined;
  back?: string | null | undefined;
}

export function StepNav({ step, total, next, back }: StepNavProps) {
  return (
    <nav className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-6 pb-16 pt-12">
      <div className="flex items-center gap-2.5" aria-label={`Chapter ${step} of ${total}`}>
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-px rounded-full transition-all duration-500",
              index + 1 === step
                ? "bg-rose-400/80 w-10 shadow-[0_0_10px_rgba(251,113,133,0.7)]"
                : index + 1 < step
                  ? "w-4 bg-rose-400/40"
                  : "w-4 bg-white/15",
            )}
          />
        ))}
      </div>

      <div className="flex items-center gap-6">
        {back && (
          <Link
            href={back}
            className="group text-muted-foreground flex items-center gap-1.5 text-sm transition-colors hover:text-white/80"
          >
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:-translate-x-1"
            >
              ←
            </span>
            back
          </Link>
        )}
        {next && <CtaLink href={next.href} label={next.label} />}
      </div>

      <ShareButton />
    </nav>
  );
}
