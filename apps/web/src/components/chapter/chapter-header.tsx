import { TextReveal } from "@repo/ui";

export interface ChapterHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string | undefined;
}

export function ChapterHeader({ eyebrow, title, subtitle }: ChapterHeaderProps) {
  return (
    <header className="mx-auto max-w-2xl px-6 pb-12 pt-24 text-center sm:pt-28">
      {eyebrow && (
        <TextReveal
          as="p"
          className="flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.35em] text-white/40"
        >
          <span aria-hidden className="h-px w-8 bg-white/15" />
          {eyebrow}
          <span aria-hidden className="h-px w-8 bg-white/15" />
        </TextReveal>
      )}
      <TextReveal as="h1" className="text-foreground mt-6 font-display text-6xl leading-[1.15] sm:text-7xl">
        {title}
      </TextReveal>
      {subtitle && (
        <TextReveal
          as="p"
          delay={0.12}
          className="text-white/55 mx-auto mt-4 max-w-md font-serif text-lg italic sm:text-xl"
        >
          {subtitle}
        </TextReveal>
      )}
    </header>
  );
}
