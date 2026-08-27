"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookHeart,
  CalendarHeart,
  ChevronRight,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Gift,
  Heart,
  HeartHandshake,
  Images,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  MessageCircleQuestion,
  MoreHorizontal,
  Music2,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Star,
  StickyNote,
  Users,
} from "lucide-react";

import { cn } from "@repo/ui";

import { useAuth } from "@/context/auth-provider";
import { CommandPalette, type CommandGroup } from "@/components/command-palette";

const ICON_CLASS = "h-5 w-5";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const DASHBOARD_ITEM: NavItem = { href: "/", label: "Dashboard", icon: LayoutDashboard };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://loveme-hazel.vercel.app"
    : "http://localhost:3000");

function navSections(user: { slug?: string; role?: string } | null): { label: string; items: NavItem[] }[] {
  const sections: { label: string; items: NavItem[] }[] = [];
  if (user?.slug) {
    sections.push({
      label: "Your site",
      items: [
        {
          href: `${SITE_URL}/u/${user.slug}`,
          label: "View your page",
          icon: ExternalLink,
        },
      ],
    });
  }
  sections.push(
    {
    label: "Content",
    items: [
      { href: "/memories", label: "Memories", icon: BookHeart },
      { href: "/gallery", label: "Gallery", icon: Images },
      { href: "/songs", label: "Songs", icon: Music2 },
      { href: "/questions", label: "Questions", icon: MessageCircleQuestion },
      { href: "/reasons", label: "Reasons", icon: Heart },
      { href: "/dates", label: "Dates", icon: CalendarHeart },
      { href: "/letters", label: "Letters", icon: Mail },
      { href: "/pages", label: "Pages", icon: FileText },
    ],
  },
  {
    label: "Little things",
    items: [
      { href: "/notes", label: "Love jar", icon: StickyNote },
      { href: "/compliments", label: "Compliments", icon: Sparkles },
      { href: "/wishes", label: "Wishes", icon: Star },
      { href: "/promises", label: "Promises", icon: HeartHandshake },
      { href: "/dreams", label: "Dreams", icon: Rocket },
      { href: "/capsules", label: "Time capsules", icon: Clock },
      { href: "/surprises", label: "Surprises", icon: Gift },
    ],
  },
  {
    label: "Activity",
    items: [{ href: "/answers", label: "Answers", icon: ClipboardList }],
  },
    {
      label: "System",
      items: [
        { href: "/settings", label: "Settings", icon: Settings },
        { href: "/share-links", label: "Share links", icon: Link2 },
        { href: "/users", label: "Users", icon: Users },
      ],
    },
  );
  return sections;
}

const PRIMARY_TABS = ["/", "/memories", "/gallery", "/questions"] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function canSee(item: NavItem, role: string | undefined): boolean {
  return item.href !== "/users" || role === "admin";
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-pink-500 text-base text-white shadow-lg shadow-rose-500/30">
        ❤
      </span>
      <span className="text-foreground font-serif text-lg">Admin</span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground/70 px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider">
      {children}
    </p>
  );
}

function SearchButton({ onOpen, className }: { onOpen: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Search (Ctrl+K)"
      className={cn(
        "text-muted-foreground hover:text-foreground hover:border-white/20 flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm transition-colors",
        className,
      )}
    >
      <Search className="h-4 w-4" />
      <span className="min-w-0 flex-1 text-left">Search…</span>
      <kbd className="border-white/10 bg-white/5 rounded-md border px-1.5 py-0.5 text-[10px]">
        Ctrl K
      </kbd>
    </button>
  );
}

function DesktopSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="border-white/10 bg-white/[0.02] fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r md:flex">
      <div className="border-white/10 flex h-16 items-center border-b px-5">
        <Brand />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {canSee(DASHBOARD_ITEM, user?.role) && (
          <Link
            href={DASHBOARD_ITEM.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(pathname, DASHBOARD_ITEM.href)
                ? "bg-rose-500/15 text-rose-200"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            <DASHBOARD_ITEM.icon className={ICON_CLASS} />
            {DASHBOARD_ITEM.label}
          </Link>
        )}

        {navSections(user).map((section) => {
          const items = section.items.filter((item) => canSee(item, user?.role));
          if (items.length === 0) return null;
          return (
            <div key={section.label}>
              <SectionLabel>{section.label}</SectionLabel>
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-rose-500/15 text-rose-200"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <item.icon className={ICON_CLASS} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {user && (
        <div className="border-white/10 border-t p-3">
          <SearchButton onOpen={() => window.dispatchEvent(new CustomEvent("admin:toggle-palette"))} className="w-full border border-white/10" />
          <div className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="bg-rose-500/15 text-rose-200 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-medium">{user.name}</p>
              <p className="text-muted-foreground truncate text-xs">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Log out"
              className="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function MobileHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="border-white/10 bg-background/80 sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md md:hidden">
      <Brand />
      <div className="flex items-center gap-1">
        {user && (
          <span className="text-muted-foreground mr-1 max-w-28 truncate text-xs">
            {user.name}
          </span>
        )}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("admin:toggle-palette"))}
          aria-label="Search (Ctrl+K)"
          className="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          aria-label="Log out"
          className="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const allItems = [DASHBOARD_ITEM, ...navSections(user).flatMap((section) => section.items)];

  const primary = allItems.filter((item) =>
    (PRIMARY_TABS as readonly string[]).includes(item.href),
  );

  return (
    <>
      <nav className="border-white/10 bg-background/90 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {primary.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-rose-300" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn(ICON_CLASS, active && "text-rose-300")} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="More options"
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              allItems.some(
                (item) =>
                  !(PRIMARY_TABS as readonly string[]).includes(item.href) &&
                  isActive(pathname, item.href),
              )
                ? "text-rose-300"
                : "text-muted-foreground",
            )}
          >
            <MoreHorizontal className={ICON_CLASS} />
            More
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="bg-black/60 animate-fade-in absolute inset-0"
          />
          <div className="bg-surface animate-sheet-up fixed inset-x-0 bottom-0 max-h-[80svh] overflow-y-auto rounded-t-3xl border-t border-white/10 p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
            {navSections(user).map((section) => {
              const items = section.items.filter((item) => canSee(item, user?.role));
              if (items.length === 0) return null;
              return (
                <div key={section.label} className="mb-2">
                  <p className="text-muted-foreground px-3 pb-1 text-xs font-medium uppercase tracking-wider">
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-rose-500/15 text-rose-200"
                              : "text-foreground hover:bg-white/5",
                          )}
                        >
                          <item.icon className={ICON_CLASS} />
                          {item.label}
                          <ChevronRight className="text-muted-foreground ml-auto h-4 w-4" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => void logout()}
              className="text-foreground flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors hover:bg-white/5"
            >
              <LogOut className={ICON_CLASS} />
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
    };
    const onToggle = () => setPaletteOpen((current) => !current);
    window.addEventListener("keydown", onKey);
    window.addEventListener("admin:toggle-palette", onToggle);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("admin:toggle-palette", onToggle);
    };
  }, []);

  const paletteGroups: CommandGroup[] = [
    {
      id: "nav",
      label: "Navigate",
      items: [
        DASHBOARD_ITEM,
        ...navSections(user).flatMap((section) => section.items),
      ]
        .filter((item) => canSee(item, user?.role))
        .map((item) => ({
          id: item.href,
          label: item.label,
          href: item.href,
          icon: item.icon,
        })),
    },
    {
      id: "create",
      label: "Create new",
      items: [
        { id: "memory", label: "Memory", href: "/memories/new", icon: BookHeart },
        { id: "image", label: "Gallery image", href: "/gallery/new", icon: Images },
        { id: "bulk", label: "Bulk gallery upload", href: "/gallery/bulk", icon: Images },
        { id: "song", label: "Song", href: "/songs/new", icon: Music2 },
        { id: "question", label: "Question", href: "/questions/new", icon: MessageCircleQuestion },
        { id: "reason", label: "Reason", href: "/reasons/new", icon: Heart },
        { id: "date", label: "Date", href: "/dates/new", icon: CalendarHeart },
        { id: "letter", label: "Letter", href: "/letters/new", icon: Mail },
        { id: "note", label: "Love note", href: "/notes/new", icon: StickyNote },
        { id: "compliment", label: "Compliment", href: "/compliments/new", icon: Sparkles },
        { id: "wish", label: "Wish", href: "/wishes/new", icon: Star },
        { id: "promise", label: "Promise", href: "/promises/new", icon: HeartHandshake },
        { id: "dream", label: "Dream", href: "/dreams/new", icon: Rocket },
        { id: "capsule", label: "Time capsule", href: "/capsules/new", icon: Clock },
        { id: "surprise", label: "Surprise", href: "/surprises/new", icon: Gift },
        { id: "page", label: "Page", href: "/pages/new", icon: FileText },
      ],
    },
  ];

  return (
    <div className="min-h-svh">
      <DesktopSidebar />
      <MobileHeader />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:ml-60 md:pb-10 md:pt-8">
        {children}
      </main>
      <MobileBottomNav />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} groups={paletteGroups} />
    </div>
  );
}
