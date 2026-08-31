import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { PageBlock } from "@repo/shared";
import { isPageAccessible } from "@repo/shared";
import { BlurReveal, TextReveal } from "@repo/ui";

import { ChapterHeader } from "@/components/chapter/chapter-header";
import { CtaLink } from "@/components/cta-link";
import { EditableImage } from "@/components/media/editable-image";
import { StepNav } from "@/components/step-nav";
import { getChapterNav } from "@/lib/chapters";
import { getPage } from "@/lib/content";
import { siteHref, type SiteContentPageProps } from "@/lib/site";

export const dynamic = "force-dynamic";

interface BlockViewProps {
  block: PageBlock;
  pageId: string;
  blocks: PageBlock[];
  index: number;
}

function BlockView({ block, pageId, blocks, index }: BlockViewProps) {
  switch (block.type) {
    case "heading":
      return (
        <TextReveal as="h2" className="text-foreground mt-12 font-serif text-3xl sm:text-4xl">
          {block.text}
        </TextReveal>
      );
    case "paragraph":
      return (
        <TextReveal as="p" delay={0.08} className="mt-5 leading-relaxed text-white/65">
          {block.text}
        </TextReveal>
      );
    case "image":
      return (
        <BlurReveal className="mt-10">
          <EditableImage
            src={block.imageUrl}
            target={{ type: "page-block", pageId, blocks, index }}
            className="rounded-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.imageUrl}
              alt={block.alt ?? ""}
              className="shadow-black/30 w-full rounded-2xl shadow-xl ring-1 ring-white/10"
            />
          </EditableImage>
        </BlurReveal>
      );
    default:
      return null;
  }
}

export async function generateMetadata({ params }: SiteContentPageProps): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  const page = await getPage(slug, pageSlug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.subtitle,
  };
}

export default async function CustomPage({ params }: SiteContentPageProps) {
  const { slug, pageSlug } = await params;
  const page = await getPage(slug, pageSlug);

  if (!page || !isPageAccessible(page)) {
    notFound();
  }

  const nav = page.chapter ? await getChapterNav(slug, page.slug) : null;

  return (
    <main className="bg-background min-h-svh">
      <ChapterHeader
        eyebrow="a letter for you"
        title={page.title}
        subtitle={page.subtitle}
      />

      {page.heroImageUrl && (
        <div className="mx-auto max-w-2xl px-6">
          <BlurReveal>
            <EditableImage
              src={page.heroImageUrl}
              target={{ type: "page", id: page.id }}
              className="rounded-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.heroImageUrl}
                alt={page.title}
                className="rounded-2xl shadow-xl shadow-black/30 ring-1 ring-white/10"
              />
            </EditableImage>
          </BlurReveal>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 pb-16">
        {page.blocks.map((block, index) => (
          <BlockView
            key={index}
            block={block}
            pageId={page.id}
            blocks={page.blocks}
            index={index}
          />
        ))}

        {page.chapter && nav ? (
          <StepNav
            step={nav.step}
            total={nav.total}
            back={nav.back}
            next={nav.next}
          />
        ) : page.cta ? (
          <div className="mt-14 flex justify-center">
            <CtaLink href={siteHref(slug, page.cta.href)} label={page.cta.label} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
