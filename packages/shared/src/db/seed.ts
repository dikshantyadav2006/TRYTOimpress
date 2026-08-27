import { ObjectId } from "mongodb";

import { defaultSiteSettings } from "../data/site-defaults";
import type { PageBlock } from "../types/page";
import { generateSiteSlug, slugifyName } from "../utils/slug";
import {
  adminUsers,
  answers,
  capsules,
  compliments,
  dateIdeas,
  dreams,
  galleryImages,
  letters,
  loveNotes,
  lovePromises,
  media,
  memories,
  pages,
  proposals,
  proposalResponses,
  questions,
  reasons,
  shareLinks,
  siteSettings,
  songs,
  surprises,
  wishes,
} from "./models";

export interface SeedPage {
  slug: string;
  title: string;
  subtitle?: string;
  heroImageUrl?: string;
  blocks: PageBlock[];
  cta?: { label: string; href: string } | null;
  order: number;
  published: boolean;
}

const seedPages: SeedPage[] = [
  {
    slug: "our-story",
    title: "Our Story",
    subtitle: "eighteen little chapters that became us",
    blocks: [
      {
        type: "heading",
        text: "Every good story starts with a hello",
      },
      {
        type: "paragraph",
        text: "This is where our memories live — a timeline of every little moment that made me fall for you.",
      },
    ],
    cta: { label: "Next chapter →", href: "/gallery" },
    order: 1,
    published: true,
  },
  {
    slug: "gallery",
    title: "A Gallery of You",
    subtitle: "my favourite pictures of my favourite person",
    blocks: [
      {
        type: "heading",
        text: "My favourite pictures of you",
      },
      {
        type: "paragraph",
        text: "Every photo here is a reminder of why I can't stop smiling.",
      },
    ],
    cta: { label: "Next chapter →", href: "/reasons" },
    order: 2,
    published: true,
  },
  {
    slug: "reasons",
    title: "Why I Love You",
    subtitle: "every reason, every single one",
    blocks: [
      {
        type: "heading",
        text: "Tap a card, find a reason",
      },
      {
        type: "paragraph",
        text: "Some of these are small, some are huge — but they're all true. Tap each card to reveal one of the reasons my heart picked you.",
      },
    ],
    cta: { label: "Next chapter →", href: "/songs" },
    order: 3,
    published: true,
  },
  {
    slug: "songs",
    title: "Our Songs",
    subtitle: "the soundtrack of us",
    blocks: [
      {
        type: "heading",
        text: "Every love story has a soundtrack",
      },
      {
        type: "paragraph",
        text: "These songs remind me of you — tap any of them and let it play.",
      },
    ],
    cta: { label: "Next chapter →", href: "/dates" },
    order: 4,
    published: true,
  },
  {
    slug: "dates",
    title: "Dates I Can't Wait For",
    subtitle: "our next adventure starts with one little tap",
    blocks: [
      {
        type: "heading",
        text: "Surprise us",
      },
      {
        type: "paragraph",
        text: "Press the button and let fate pick our next adventure. Consider it a promise — every single one of these is a yes from me.",
      },
    ],
    cta: { label: "Next chapter →", href: "/questions" },
    order: 5,
    published: true,
  },
  {
    slug: "questions",
    title: "A Few Questions",
    subtitle: "be honest — the data already knows",
    blocks: [
      {
        type: "heading",
        text: "Answer these, and don't lie",
      },
      {
        type: "paragraph",
        text: "There's a right answer to every one of them. I trust you to choose wisely.",
      },
    ],
    cta: { label: "Next chapter →", href: "/love-meter" },
    order: 6,
    published: true,
  },
  {
    slug: "love-meter",
    title: "The Love Meter",
    subtitle: "a meter that refuses to stay in bounds",
    blocks: [
      {
        type: "heading",
        text: "How much do I love you?",
      },
      {
        type: "paragraph",
        text: "Scientists say it can't be measured. They're wrong — watch this.",
      },
    ],
    cta: { label: "Next chapter →", href: "/love-jar" },
    order: 7,
    published: true,
  },
  {
    slug: "love-jar",
    title: "The Love Jar",
    subtitle: "a jar full of tiny loves",
    blocks: [
      {
        type: "heading",
        text: "Reach in, pull out a little love",
      },
      {
        type: "paragraph",
        text: "Every note in this jar is something I feel about you. Tap the jar and take one out.",
      },
    ],
    cta: { label: "Next chapter →", href: "/compliments" },
    order: 8,
    published: true,
  },
  {
    slug: "compliments",
    title: "Compliments For You",
    subtitle: "a shower of nice things",
    blocks: [
      {
        type: "heading",
        text: "A little shower of compliments",
      },
      {
        type: "paragraph",
        text: "Tap a card, get a compliment. Tap it again — I'll keep going all day.",
      },
    ],
    cta: { label: "Next chapter →", href: "/wishes" },
    order: 9,
    published: true,
  },
  {
    slug: "wishes",
    title: "Our Wishes",
    subtitle: "wishes hanging on our tree",
    blocks: [
      {
        type: "heading",
        text: "Make a wish",
      },
      {
        type: "paragraph",
        text: "Every wish I have is hanging on our tree. Tap one and see what I'm wishing for.",
      },
    ],
    cta: { label: "Next chapter →", href: "/promises" },
    order: 10,
    published: true,
  },
  {
    slug: "promises",
    title: "Promises",
    subtitle: "vows I'll keep, forever",
    blocks: [
      {
        type: "heading",
        text: "My promises to you",
      },
      {
        type: "paragraph",
        text: "Flip each card and read what I promise you — every single one, out loud, every day.",
      },
    ],
    cta: { label: "Next chapter →", href: "/future" },
    order: 11,
    published: true,
  },
  {
    slug: "future",
    title: "Our Future",
    subtitle: "a bucket list for the two of us",
    blocks: [
      {
        type: "heading",
        text: "Everything I want to do with you",
      },
      {
        type: "paragraph",
        text: "One lifetime isn't enough. So I wrote the list down — it's a good thing we're both staying.",
      },
    ],
    cta: { label: "Next chapter →", href: "/letters" },
    order: 12,
    published: true,
  },
  {
    slug: "letters",
    title: "Open When...",
    subtitle: "letters for every little moment",
    blocks: [
      {
        type: "heading",
        text: "Words waiting for the right moment",
      },
      {
        type: "paragraph",
        text: "Pick an envelope. Inside is something I wrote just for that feeling — for when you miss me, when you can't sleep, or when you just need to feel loved.",
      },
    ],
    cta: { label: "Next chapter →", href: "/time-capsule" },
    order: 13,
    published: true,
  },
  {
    slug: "time-capsule",
    title: "A Time Capsule",
    subtitle: "messages sealed for the right moment",
    blocks: [
      {
        type: "heading",
        text: "Letters for future us",
      },
      {
        type: "paragraph",
        text: "Some messages are sealed until a certain day. Until then, they stay buried — safe and waiting for us.",
      },
    ],
    cta: { label: "Next chapter →", href: "/scratch-cards" },
    order: 14,
    published: true,
  },
  {
    slug: "scratch-cards",
    title: "Scratch Cards",
    subtitle: "little surprises under the foil",
    blocks: [
      {
        type: "heading",
        text: "Scratch to reveal",
      },
      {
        type: "paragraph",
        text: "Some things are better discovered slowly. Scratch the foil and see what's hiding under each one.",
      },
    ],
    cta: { label: "Next chapter →", href: "/surprise" },
    order: 15,
    published: true,
  },
  {
    slug: "surprise",
    title: "One Last Surprise",
    subtitle: "press the button, let fate decide",
    blocks: [
      {
        type: "heading",
        text: "A button worth pressing",
      },
      {
        type: "paragraph",
        text: "One click. Something wonderful. I'll wait right here.",
      },
    ],
    cta: { label: "One last thing →", href: "/proposal" },
    order: 16,
    published: true,
  },
  {
    slug: "proposal",
    title: "The Big Question",
    subtitle: "one question, one answer",
    blocks: [
      {
        type: "heading",
        text: "I've waited for this moment",
      },
      {
        type: "paragraph",
        text: "Everything before this led to one question. And only one answer is right.",
      },
    ],
    cta: { label: "See it", href: "/yes" },
    order: 17,
    published: true,
  },
  {
    slug: "yes",
    title: "You Said Yes",
    subtitle: "the best answer in the world",
    blocks: [
      {
        type: "heading",
        text: "You said yes ❤️",
      },
      {
        type: "paragraph",
        text: "You just made me the happiest person alive. Thank you for every moment so far — and for all the ones still to come.",
      },
    ],
    cta: { label: "Watch it all again →", href: "/love-wrapped" },
    order: 18,
    published: true,
  },
  {
    slug: "love-wrapped",
    title: "Our Year, Wrapped",
    subtitle: "the whole story, one more time",
    blocks: [
      {
        type: "heading",
        text: "This is us, wrapped up",
      },
      {
        type: "paragraph",
        text: "Every reason, every song, every dream — counted up and wrapped with a bow. You made it all possible.",
      },
    ],
    order: 19,
    published: true,
  },
];

export async function seedSite(ownerId: string): Promise<void> {
  await siteSettings().updateOne(
    { ownerId },
    {
      $setOnInsert: {
        ...defaultSiteSettings,
        _id: new ObjectId(),
        ownerId,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );

  for (const page of seedPages) {
    const set: Record<string, unknown> = {
      ownerId,
      slug: page.slug,
      title: page.title,
      blocks: page.blocks,
      cta: page.cta ?? null,
      order: page.order,
      published: page.published,
      updatedAt: new Date(),
    };
    if (page.subtitle) set.subtitle = page.subtitle;
    if (page.heroImageUrl) set.heroImageUrl = page.heroImageUrl;
    await pages().updateOne(
      { ownerId, slug: page.slug },
      {
        $set: set,
        $setOnInsert: {
          _id: new ObjectId(),
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }
}

type MigratableCollection = {
  updateMany(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<unknown>;
};

const ORPHANABLE_COLLECTIONS = [
  memories,
  galleryImages,
  questions,
  answers,
  proposals,
  proposalResponses,
  pages,
  siteSettings,
  songs,
  reasons,
  dateIdeas,
  letters,
  loveNotes,
  compliments,
  wishes,
  lovePromises,
  dreams,
  capsules,
  surprises,
  shareLinks,
  media,
] as unknown as (() => MigratableCollection)[];

export async function adoptOrphanedData(ownerId: string): Promise<void> {
  for (const collection of ORPHANABLE_COLLECTIONS) {
    await collection().updateMany(
      { ownerId: { $exists: false } },
      { $set: { ownerId } },
    );
  }
}

export async function migrateOnBoot(): Promise<void> {
  const users = await adminUsers().find().sort({ createdAt: 1 }).toArray();
  if (users.length === 0) return;

  for (const user of users) {
    if (user.slug) continue;
    let slug = slugifyName(user.name) || generateSiteSlug();
    while (await adminUsers().findOne({ slug })) {
      slug = generateSiteSlug();
    }
    await adminUsers().updateOne({ _id: user._id }, { $set: { slug } });
  }

  const first = users[0]!;
  const ownerId = first._id.toString();
  await adoptOrphanedData(ownerId);
  await seedSite(ownerId);
}
