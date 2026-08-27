import type { LucideIcon } from "lucide-react";
import { Check, Search } from "lucide-react";

import { cn } from "@repo/ui";

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-muted-foreground mb-1.5 block text-sm font-medium", className)}
    >
      {children}
    </label>
  );
}

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-foreground placeholder:text-white/30 outline-none transition-colors focus:border-rose-400/60 focus:bg-white/[0.07]";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClasses, "min-h-28", className)} {...props} />;
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

const segmentedBase =
  "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-50";
const segmentedSizes = {
  sm: "rounded-lg px-2.5 py-1.5 text-xs",
  default: "rounded-xl px-3.5 py-2.5 text-sm",
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
  size = "default",
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  size?: keyof typeof segmentedSizes;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn(
        "flex w-full items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const index = options.findIndex((option) => option.value === value);
        const delta = event.key === "ArrowRight" ? 1 : -1;
        const next = options[(index + delta + options.length) % options.length];
        if (next) {
          event.preventDefault();
          onChange(next.value);
        }
      }}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            name={name}
            onClick={() => onChange(option.value)}
            className={cn(
              segmentedBase,
              segmentedSizes[size],
              selected
                ? "bg-rose-500 text-white shadow-[0_4px_20px_-6px_rgba(244,63,94,0.8)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground focus-visible:bg-white/5",
              "focus-visible:ring-rose-300/60 rounded-lg outline-none focus-visible:ring-2",
            )}
          >
            {Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          onChange(!checked);
        }
      }}
      className={cn(
        "focus-visible:ring-rose-300/60 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 outline-none transition-colors focus-visible:ring-2",
        checked ? "border-rose-400 bg-rose-500" : "border-white/25 hover:border-rose-300",
      )}
    >
      {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
    </span>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      onClick={() => onChange(!checked)}
      className={cn(
        "focus-visible:ring-rose-300/60 inline-flex h-6 w-11 shrink-0 items-center rounded-full outline-none transition-colors duration-200 focus-visible:ring-2",
        checked ? "bg-rose-500" : "bg-white/10",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-10"
        aria-label={placeholder}
      />
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.03] p-6", className)}>
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-white/10 bg-white/[0.03]", className)}>
      <header className="border-white/10 border-b px-4 py-3.5 sm:px-6">
        <h2 className="text-foreground font-serif text-lg">{title}</h2>
        {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
      </header>
      <div className="space-y-4 p-4 sm:p-6">{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "rose" | "emerald" | "amber";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/5 text-white/60",
    rose: "bg-rose-500/15 text-rose-200",
    emerald: "bg-emerald-500/15 text-emerald-300",
    amber: "bg-amber-500/15 text-amber-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ErrorText({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-rose-400">{message}</p>;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-foreground/20 border-t-rose-400 h-4 w-4 animate-spin rounded-full border-2",
        className,
      )}
    />
  );
}

export function SubmitButton({
  children,
  loading,
  className,
}: {
  children: React.ReactNode;
  loading?: boolean | undefined;
  className?: string | undefined;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] ring-1 ring-white/20 ring-inset transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50",
        className,
      )}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function FormFooter({
  loading,
  saved,
  error,
  submitLabel = "Save changes",
}: {
  loading?: boolean | undefined;
  saved?: boolean | undefined;
  error?: string | undefined;
  submitLabel?: string | undefined;
}) {
  return (
    <div className="sticky bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 mt-8 md:bottom-0">
      <div className="border-white/10 bg-background/95 -mx-4 border-t px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <SubmitButton loading={loading} className="min-h-12 flex-1 sm:flex-initial sm:px-10">
            {submitLabel}
          </SubmitButton>
          {saved && <span className="text-sm text-emerald-400">Saved</span>}
          {error && <ErrorText message={error} />}
        </div>
      </div>
    </div>
  );
}
