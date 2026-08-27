import type { Metadata } from "next";

import { SuccessCelebration } from "@/components/success/success-celebration";
import { getSiteSettings } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  await params;
  return {
    title: "You said yes 💖",
    robots: { index: false, follow: false },
  };
}

export default async function YesPage({ params }: SitePageProps) {
  const { slug } = await params;
  const settings = await getSiteSettings(slug);

  return (
    <SuccessCelebration
      content={{
        heading: settings.success.heading,
        messages: settings.success.messages,
      }}
    />
  );
}
