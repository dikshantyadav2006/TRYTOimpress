import type { Metadata } from "next";

import { ProposalExperience } from "@/components/proposal/proposal-experience";
import { getSiteSettings } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  await params;
  return {
    title: "One Big Question",
    description: "One question, one answer. Only one of them is right.",
  };
}

export default async function ProposalPage({ params }: SitePageProps) {
  const { slug } = await params;
  const settings = await getSiteSettings(slug);

  return (
    <ProposalExperience
      content={{
        title: settings.proposal.title,
        message: settings.proposal.message,
        hint: settings.proposal.hint,
        noLabels: settings.proposal.noLabels,
        yesLabel: settings.proposal.yesLabel,
        ...(settings.music?.proposalYoutubeId
          ? { youtubeId: settings.music.proposalYoutubeId }
          : {}),
      }}
    />
  );
}
