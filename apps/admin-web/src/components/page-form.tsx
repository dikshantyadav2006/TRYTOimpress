"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlignLeft, Heading1, Image as ImageIcon, Link2, Trash2 } from "lucide-react";

import type { Page, PageBlock } from "@repo/shared";
import { sitePagePath } from "@repo/shared";

import {
  FormFooter,
  Input,
  Label,
  SectionCard,
  SegmentedControl,
  Switch,
  Textarea,
} from "@/components/ui";
import { UploadField } from "@/components/upload-field";
import { useDirtyGuard } from "@/components/dirty-guard";
import { useToast } from "@/components/toast";
import { useAuth } from "@/context/auth-provider";
import { ApiError, post, put } from "@/lib/api";

function newBlock(): PageBlock {
  return { type: "paragraph", text: "" };
}

const BLOCK_OPTIONS: { value: string; label: string; icon: typeof Heading1 }[] = [
  { value: "heading", label: "Heading", icon: Heading1 },
  { value: "paragraph", label: "Paragraph", icon: AlignLeft },
  { value: "image", label: "Image", icon: ImageIcon },
];

export function PageForm({ page }: { page?: Page | null }) {
  const router = useRouter();
  const isEdit = Boolean(page);

  const [slug, setSlug] = useState(page?.slug ?? "");
  const [title, setTitle] = useState(page?.title ?? "");
  const [subtitle, setSubtitle] = useState(page?.subtitle ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(page?.heroImageUrl ?? "");
  const [order, setOrder] = useState(String(page?.order ?? ""));
  const [visibility, setVisibility] = useState<"visible" | "link" | "hidden">(
    page?.visibility ?? "visible",
  );
  const [chapter, setChapter] = useState(page?.chapter ?? false);
  const [blocks, setBlocks] = useState<PageBlock[]>(
    page?.blocks?.length ? page.blocks.map((b) => ({ ...b })) : [newBlock()],
  );
  const [ctaLabel, setCtaLabel] = useState(page?.cta?.label ?? "");
  const [ctaHref, setCtaHref] = useState(page?.cta?.href ?? "");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://trytotry.onrender.com"
      : "http://localhost:3000");

  const shareUrl = isEdit && page ? `${SITE_URL}/u/${user?.slug}${sitePagePath(page.slug)}` : null;

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("success", "Share link copied");
    } catch {
      showToast("error", "Could not copy link");
    }
  };

  useDirtyGuard({ slug, title, subtitle, heroImageUrl, order, visibility, chapter, blocks, ctaLabel, ctaHref });

  const replaceBlock = (index: number, block: PageBlock) => {
    setBlocks((current) => current.map((b, i) => (i === index ? block : b)));
  };

  const changeBlockType = (index: number, type: string) => {
    setBlocks((current) =>
      current.map((b, i) => {
        if (i !== index) return b;
        if (type === "image") {
          return { type: "image", imageUrl: "", alt: "" } satisfies PageBlock;
        }
        return {
          type: type === "heading" ? "heading" : "paragraph",
          text: "",
        } satisfies PageBlock;
      }),
    );
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    const cleanedBlocks = blocks.filter((block) =>
      block.type === "image" ? Boolean(block.imageUrl) : Boolean(block.text.trim()),
    );
    if (cleanedBlocks.length === 0) {
      setError("Add at least one block");
      setLoading(false);
      return;
    }
    const body: Record<string, unknown> = {
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
      title,
      ...(subtitle ? { subtitle } : {}),
      ...(heroImageUrl ? { heroImageUrl } : {}),
      blocks: cleanedBlocks,
      ...(order !== "" ? { order: Number(order) } : {}),
      visibility,
      chapter,
    };
    if (!chapter && ctaLabel.trim() && ctaHref.trim()) {
      body.cta = { label: ctaLabel, href: ctaHref };
    }
    try {
      if (isEdit && page) {
        await put(`/pages/${page.id}`, body);
      } else {
        await post("/pages", body);
      }
      router.push("/pages");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <SectionCard title="Page" description="Where the page lives and what it is called.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
          </div>
          <div>
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <div>
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
          />
        </div>
        <div>
          <Label>Visibility</Label>
          <SegmentedControl
            name="Visibility"
            value={visibility}
            onChange={setVisibility}
            options={[
              { value: "visible", label: "Visible" },
              { value: "link", label: "Link only" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
          <p className="text-muted-foreground mt-1.5 text-xs">
            {visibility === "visible"
              ? "Shown on the site and in the chapter navigator."
              : visibility === "link"
                ? "Not published, but openable via its direct link (share without publishing)."
                : "Private — only admins can see it."}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Switch checked={chapter} onChange={setChapter} label="Show in chapters" />
          Show in chapter navigator
        </label>
        {shareUrl && (
          <button
            type="button"
            onClick={copyShareLink}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm transition-colors"
          >
            <Link2 className="h-4 w-4" />
            Copy share link
            <span className="font-mono text-[10px] text-white/40">/u/{user?.slug}{sitePagePath(page?.slug ?? "")}</span>
          </button>
        )}
        <p className="text-muted-foreground text-xs">
          Chapter pages link to the next chapter automatically by order — no link to set.
        </p>
      </SectionCard>

      <SectionCard title="Hero image" description="Optional image shown under the title.">
        <UploadField value={heroImageUrl} onChange={setHeroImageUrl} />
      </SectionCard>

      <SectionCard title="Blocks" description="The body of the page.">
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div key={index} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-2 flex items-center gap-2">
                <SegmentedControl
                  name="Block type"
                  size="sm"
                  value={block.type}
                  onChange={(type) => changeBlockType(index, type)}
                  options={BLOCK_OPTIONS}
                />
                <button
                  type="button"
                  onClick={() => setBlocks((current) => current.filter((_, i) => i !== index))}
                  aria-label="Remove block"
                  className="text-muted-foreground hover:text-rose-300 ml-auto rounded-lg p-2 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {block.type === "image" ? (
                <div>
                  <UploadField
                    value={block.imageUrl}
                    onChange={(url) =>
                      replaceBlock(index, {
                        type: "image",
                        imageUrl: url,
                        ...(block.alt ? { alt: block.alt } : {}),
                      })
                    }
                  />
                  <div className="mt-2">
                    <Input
                      placeholder="Alt text (optional)"
                      value={block.alt ?? ""}
                      onChange={(event) =>
                        replaceBlock(index, {
                          type: "image",
                          imageUrl: block.imageUrl,
                          alt: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <Textarea
                  placeholder={block.type === "heading" ? "Heading text" : "Paragraph text"}
                  value={block.text}
                  onChange={(event) =>
                    replaceBlock(index, { type: block.type, text: event.target.value })
                  }
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setBlocks((current) => [...current, newBlock()])}
          className="text-rose-300 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-rose-500/10 hover:underline"
        >
          + Add block
        </button>
      </SectionCard>

      {!chapter && (
        <SectionCard title="Next step (CTA)" description="Optional button shown at the bottom of the page.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ctaLabel">CTA label</Label>
              <Input
                id="ctaLabel"
                value={ctaLabel}
                onChange={(event) => setCtaLabel(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ctaHref">CTA href</Label>
              <Input
                id="ctaHref"
                value={ctaHref}
                onChange={(event) => setCtaHref(event.target.value)}
                placeholder="/proposal"
              />
            </div>
          </div>
        </SectionCard>
      )}

      <FormFooter loading={loading} error={error} submitLabel={isEdit ? "Save changes" : "Create page"} />
    </form>
  );
}
