import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Great_Vibes } from "next/font/google";
import { Suspense } from "react";

import {
  CursorFollower,
  ProgressBar,
  QuestionsProvider,
  StoreProvider,
} from "@repo/ui";

import { NavigationProgress } from "@/components/navigation-progress";
import { Ambient } from "@/components/ambient";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Will You Be Mine?",
    template: "%s",
  },
  description:
    "Create a tiny interactive journey to ask someone one very big question.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e0b10",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${cormorant.variable} ${greatVibes.variable}`}
    >
      <body className="bg-background text-foreground min-h-svh font-sans antialiased">
        <Ambient />
        <StoreProvider>
          <QuestionsProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <ProgressBar />
            <CursorFollower />
            {children}
          </QuestionsProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
