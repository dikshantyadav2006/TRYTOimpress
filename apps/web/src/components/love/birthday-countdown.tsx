"use client";

import { useEffect, useState } from "react";

import { cn } from "@repo/ui";

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function nextBirthday(value: string, now: Date): Date | null {
  const base = new Date(`${value}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;

  let target = new Date(now.getFullYear(), base.getMonth(), base.getDate());
  target.setHours(0, 0, 0, 0);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (target.getTime() <= startOfToday.getTime()) {
    target = new Date(now.getFullYear() + 1, base.getMonth(), base.getDate());
  }
  return target;
}

function getRemaining(target: Date, now: Date): TimeParts {
  let diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86_400_000);
  diff -= days * 86_400_000;
  const hours = Math.floor(diff / 3_600_000);
  diff -= hours * 3_600_000;
  const minutes = Math.floor(diff / 60_000);
  diff -= minutes * 60_000;
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds };
}

const UNITS: { key: keyof TimeParts; label: string }[] = [
  { key: "days", label: "days" },
  { key: "hours", label: "hours" },
  { key: "minutes", label: "minutes" },
  { key: "seconds", label: "seconds" },
];

export interface BirthdayCountdownProps {
  date?: string | undefined;
  message?: string | undefined;
}

export function BirthdayCountdown({ date, message }: BirthdayCountdownProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!date) return null;

  const target = nextBirthday(date, now);
  if (!target) return null;

  const isToday =
    target.getTime() <= now.getTime() + 1000 &&
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate();

  const parts = getRemaining(target, now);

  return (
    <section className="mx-auto w-full max-w-3xl px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-10 text-center shadow-2xl shadow-rose-950/30">
        <div
          aria-hidden
          className="bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(251,191,36,0.12),transparent_70%)] pointer-events-none absolute inset-0"
        />
        <p className="relative text-amber-300/90 text-[11px] font-medium uppercase tracking-[0.35em]">
          {message || "a very special day is coming"}
        </p>
        <p className="text-white/45 relative mt-2 font-serif text-sm italic">
          counting down to your birthday 🎂
        </p>

        {isToday ? (
          <p className="relative mx-auto mt-10 font-display text-5xl leading-tight sm:text-6xl">
            It&apos;s your birthday! 🎉
          </p>
        ) : (
          <div className="relative mx-auto mt-8 grid max-w-lg grid-cols-4 gap-3">
            {UNITS.map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center">
                <span
                  className={cn(
                    "text-foreground font-display text-3xl tabular-nums sm:text-5xl",
                    key === "seconds" && "text-amber-300",
                  )}
                >
                  {String(parts[key]).padStart(2, "0")}
                </span>
                <span className="text-white/40 mt-1 text-[10px] uppercase tracking-[0.2em]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-white/35 relative mt-8 text-xs">
          the best day of the year is on its way ✨
        </p>
      </div>
    </section>
  );
}
