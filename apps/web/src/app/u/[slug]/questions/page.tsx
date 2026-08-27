import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuestionsDeck } from "@/components/questions/questions-deck";
import { getPage, getQuestions, getSiteSettings } from "@/lib/content";
import type { SitePageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug, "questions");
  return {
    title: page?.title ?? "A Few Questions",
    description: page?.subtitle,
  };
}

export default async function QuestionsPage({ params }: SitePageProps) {
  const { slug } = await params;
  const [questions, page, settings] = await Promise.all([
    getQuestions(slug),
    getPage(slug, "questions"),
    getSiteSettings(slug),
  ]);

  if (!page) notFound();

  return (
    <QuestionsDeck
      slug={slug}
      questions={questions}
      title={page.title}
      subtitle={page.subtitle ?? undefined}
      {...(settings.music?.questionsYoutubeId
        ? { youtubeId: settings.music.questionsYoutubeId }
        : {})}
    />
  );
}
