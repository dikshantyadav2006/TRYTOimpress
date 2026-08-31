"use client";

import { usePathname } from "next/navigation";

import { MusicToggle } from "@repo/ui";

import { ChapterRail, type ChapterRailItem } from "@/components/chapter/chapter-rail";

const IMMERSIVE_PATTERN = /\/music\//;

export function SiteChrome({
  chapterItems,
  children,
}: {
  chapterItems: ChapterRailItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const immersive = IMMERSIVE_PATTERN.test(pathname);

  return (
    <>
      {!immersive && <MusicToggle />}
      {children}
      {!immersive && <ChapterRail items={chapterItems} />}
    </>
  );
}