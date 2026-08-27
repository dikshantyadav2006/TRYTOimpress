"use client";

import { useEffect, useState } from "react";

import { cn } from "@repo/ui";

interface TimeParts {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getTimeParts(start: Date, now: Date): TimeParts {
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    days += getDaysInMonth(previous.getMonth(), previous.getFullYear());
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days, hours, minutes, seconds };
}

const UNITS: { key: keyof TimeParts; label: string }[] = [
  { key: "years", label: "years" },
  { key: "months", label: "months" },
  { key: "days", label: "days" },
  { key: "hours", label: "hours" },
  { key: "minutes", label: "minutes" },
  { key: "seconds", label: "seconds" },
];

export interface DaysTogetherProps {
  startDate?: string | undefined;
  startLabel?: string | undefined;
}

export function DaysTogether({ startDate, startLabel }: DaysTogetherProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!startDate) return null;

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;

  const parts = getTimeParts(start, now);

  return (
    <section className="mx-auto w-full max-w-3xl px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-10 text-center shadow-2xl shadow-rose-950/30">
        <div
          aria-hidden
          className="bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(244,114,182,0.12),transparent_70%)] pointer-events-none absolute inset-0"
        />
        <p className="text-rose-300/80 relative text-[11px] font-medium uppercase tracking-[0.35em]">
          {startLabel || "since the day we met"}
        </p>
        <p className="text-white/45 relative mt-2 font-serif text-sm italic">
          that&apos;s how long my heart has been yours
        </p>

        <div className="relative mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 sm:grid-cols-6">
          {UNITS.map(({ key, label }) => (
            <div key={key} className="flex flex-col items-center">
              <span
                className={cn(
                  "text-foreground font-display text-3xl tabular-nums sm:text-4xl",
                  key === "seconds" && "text-rose-300",
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

        <p className="text-white/35 relative mt-8 text-xs">
          and still counting, one heartbeat at a time ❤️
        </p>
      </div>
    </section>
  );
}
