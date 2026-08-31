import { ObjectId, type UpdateFilter } from "mongodb";

import type { Page, PageBlock } from "../../types/page";
import { pages, type PageDoc } from "../models";
import { mapPage } from "../mappers";

export interface PageInput {
  slug: string;
  title: string;
  subtitle?: string;
  heroImageUrl?: string;
  blocks?: PageBlock[];
  cta?: { label: string; href: string } | null;
  order?: number;
  published?: boolean;
  chapter?: boolean;
}

export class MongoPageRepository {
  async getPages(ownerId: string): Promise<Page[]> {
    const docs = await pages().find({ ownerId }).sort({ order: 1, createdAt: 1 }).toArray();
    return docs.map((doc) => mapPage(doc));
  }

  async getPublishedPages(ownerId: string): Promise<Page[]> {
    const docs = await pages()
      .find({ ownerId, published: true })
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    return docs.map((doc) => mapPage(doc));
  }

  async getPageBySlug(ownerId: string, slug: string): Promise<Page | null> {
    const doc = await pages().findOne({ ownerId, slug });
    return doc ? mapPage(doc) : null;
  }

  async createPage(input: PageInput, ownerId: string): Promise<Page> {
    const count = await pages().countDocuments({ ownerId });
    const now = new Date();
    const doc: PageDoc = {
      _id: new ObjectId(),
      ownerId,
      slug: input.slug,
      title: input.title,
      blocks: input.blocks ?? [],
      order: input.order ?? count,
      published: input.published ?? true,
      createdAt: now,
      updatedAt: now,
      ...(input.subtitle ? { subtitle: input.subtitle } : {}),
      ...(input.heroImageUrl ? { heroImageUrl: input.heroImageUrl } : {}),
      ...(input.cta ? { cta: input.cta } : {}),
      ...(typeof input.chapter === "boolean" ? { chapter: input.chapter } : {}),
    };
    await pages().insertOne(doc);
    return mapPage(doc);
  }

  async updatePage(ownerId: string, id: string, input: Partial<PageInput>): Promise<Page | null> {
    const patch: UpdateFilter<PageDoc> = {
      $set: { updatedAt: new Date() },
      ...(input.cta === null ? { $unset: { cta: "" } } : {}),
    };
    for (const key of [
      "slug",
      "title",
      "subtitle",
      "heroImageUrl",
      "blocks",
      "order",
      "published",
      "chapter",
    ] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    if (input.cta !== undefined && input.cta !== null) {
      (patch.$set as Record<string, unknown>).cta = input.cta;
    }
    const doc = await pages().findOneAndUpdate({ _id: new ObjectId(id), ownerId }, patch, {
      returnDocument: "after",
    });
    return doc ? mapPage(doc) : null;
  }

  async deletePage(ownerId: string, id: string): Promise<boolean> {
    const result = await pages().deleteOne({ _id: new ObjectId(id), ownerId });
    return result.deletedCount > 0;
  }
}
