"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookHeart,
  ChevronRight,
  ClipboardList,
  FileText,
  Images,
  MessageCircleQuestion,
  Music2,
  Plus,
  Settings,
  Users,
} from "lucide-react";

import { LoadingState, ErrorState } from "@/components/crud";
import { useAuth } from "@/context/auth-provider";
import { useData } from "@/lib/use-data";
import { cn } from "@repo/ui";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://loveme-hazel.vercel.app"
    : "http://localhost:3000");

interface Stat {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  count: number;
  accent: string;
  adminOnly?: boolean;
}

const ACCENTS: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-300",
  amber: "bg-amber-500/15 text-amber-300",
  sky: "bg-sky-500/15 text-sky-300",
  violet: "bg-violet-500/15 text-violet-300",
  rose: "bg-rose-500/15 text-rose-300",
};

const QUICK_ACTIONS = [
  { href: "/memories/new", label: "New memory", icon: BookHeart },
  { href: "/gallery/new", label: "Add image", icon: Images },
  { href: "/questions/new", label: "New question", icon: MessageCircleQuestion },
  { href: "/playlists/new", label: "New playlist", icon: Music2 },
  { href: "/pages/new", label: "New page", icon: FileText },
] as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const memories = useData("/memories");
  const gallery = useData("/gallery");
  const questions = useData("/questions");
  const pages = useData("/pages");
  const playlists = useData("/playlists");
  const answers = useData("/answers");
  const users = useData("/users");

  const loading = [memories, gallery, questions, pages, playlists, answers].some((d) => d.loading);
  const error =
    [memories, gallery, questions, pages, playlists, answers].find((d) => d.error)?.error ?? undefined;

  const stats: Stat[] = [
    {
      href: "/settings",
      title: "Settings",
      description: "Copy, music & theme",
      icon: Settings,
      count: 1,
      accent: "sky",
    },
    {
      href: "/memories",
      title: "Memories",
      description: "Story timeline entries",
      icon: BookHeart,
      count: memories.data.length,
      accent: "rose",
    },
    {
      href: "/gallery",
      title: "Gallery",
      description: "Photos & videos",
      icon: Images,
      count: gallery.data.length,
      accent: "violet",
    },
    {
      href: "/questions",
      title: "Questions",
      description: "Quiz cards",
      icon: MessageCircleQuestion,
      count: questions.data.length,
      accent: "amber",
    },
    {
      href: "/pages",
      title: "Pages",
      description: "Chapters & custom pages",
      icon: FileText,
      count: pages.data.length,
      accent: "emerald",
    },
    {
      href: "/playlists",
      title: "Playlists",
      description: "Themed song collections",
      icon: Music2,
      count: playlists.data.length,
      accent: "rose",
    },
    {
      href: "/answers",
      title: "Answers",
      description: "Responses received",
      icon: ClipboardList,
      count: answers.data.length,
      accent: "rose",
    },
    {
      href: "/users",
      title: "Users",
      description: "Admin accounts",
      icon: Users,
      count: users.data.length,
      accent: "sky",
      adminOnly: true,
    },
  ];

  const visibleStats = stats.filter((stat) => !stat.adminOnly || user?.role === "admin");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-foreground font-serif text-2xl sm:text-3xl">
          {user ? `Hey, ${user.name.split(" ")[0]} ❤` : "Dashboard"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Everything you manage lives here. Changes save to the database and show up on the site
          right away.
        </p>
      </div>

      {user?.slug && (
        <section aria-label="Your page" className="mb-6">
          <div className="hover:border-rose-300/40 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-rose-500/10 to-pink-500/10 px-5 py-4 transition-colors">
            <div className="min-w-0">
              <h2 className="text-foreground font-serif text-lg">Your page is live</h2>
              <p className="text-muted-foreground truncate text-sm">
                Share this link with someone special:{" "}
                <code className="text-white/80">{SITE_URL}/u/{user.slug}</code>
              </p>
            </div>
            <Link
              href={`${SITE_URL}/u/${user.slug}`}
              target="_blank"
              rel="noreferrer"
              className="bg-linear-to-r from-rose-500 to-pink-500 inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] ring-1 ring-white/20 ring-inset transition-all duration-200 hover:brightness-110 active:scale-95"
            >
              View page
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          <section aria-label="Quick actions" className="mb-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Quick actions
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="hover:border-rose-300/40 hover:bg-white/[0.06] inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/85 transition-colors active:scale-[0.97]"
                  >
                    <Icon className="h-4 w-4 text-rose-300" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </section>

          <section aria-label="Overview" className="mb-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Overview
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Link
                    key={stat.href}
                    href={stat.href}
                    className="hover:border-rose-300/40 hover:bg-white/[0.06] rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          ACCENTS[stat.accent],
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground flex items-baseline gap-2">
                          <span className="font-serif text-2xl leading-none">{stat.count}</span>
                          <span className="text-muted-foreground truncate text-xs">
                            {stat.title}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {stat.description}
                        </p>
                      </div>
                      <ChevronRight className="text-muted-foreground/40 h-4 w-4 shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section aria-label="Manage content">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Manage content
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleStats
                .filter((stat) => stat.href !== "/settings")
                .map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Link
                      key={stat.href}
                      href={stat.href}
                      className="hover:border-rose-300/40 hover:bg-white/[0.06] rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors active:scale-[0.98]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-xl",
                            ACCENTS[stat.accent],
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <Plus className="text-muted-foreground/40 h-4 w-4" aria-hidden />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-foreground font-semibold">{stat.title}</h3>
                        <p className="text-muted-foreground mt-1 text-sm">{stat.description}</p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
