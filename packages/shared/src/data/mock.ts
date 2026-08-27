import type { Capsule } from "../types/capsule";
import type { Compliment } from "../types/compliment";
import type { DateIdea } from "../types/date";
import type { Dream } from "../types/dream";
import type { GalleryImage } from "../types/gallery";
import type { Letter } from "../types/letter";
import type { LoveNote } from "../types/note";
import type { Memory } from "../types/memory";
import type { Proposal } from "../types/proposal";
import type { LovePromise } from "../types/promise";
import type { Answer, Question } from "../types/question";
import type { Reason } from "../types/reason";
import type { ProposalResponse } from "../types/response";
import type { Song } from "../types/song";
import type { Surprise } from "../types/surprise";
import type { User } from "../types/user";
import type { Wish } from "../types/wish";

export const mockUser: User = {
  id: "usr_default",
  name: "Sam",
  email: "sam@example.com",
  locale: "en",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const mockProposals: Proposal[] = [
  {
    id: "prp_default",
    slug: "will-you-be-my-girlfriend",
    title: "Will you be my girlfriend? ❤️",
    subtitle: "I have one very important question…",
    message:
      "From the moment we met, every ordinary day has felt a little more special. I was too nervous to ask anywhere else, so I built this tiny page just for you:",
    recipientName: "You",
    locale: "en",
    status: "published",
    createdBy: mockUser.id,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockResponses: ProposalResponse[] = [];

export const mockMemories: Memory[] = [
  {
    id: "mem_first_hello",
    title: "The First Hello",
    date: "The day everything changed",
    caption:
      "One ordinary afternoon, an extraordinary hello. I didn't know it yet, but that moment was the start of my favourite story.",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "mem_late_night_calls",
    title: "Late Night Calls",
    date: "The nights that felt endless",
    caption:
      "Hours past midnight, still talking. Sleep was always the last thing on my mind whenever you were on the line.",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "mem_first_date",
    title: "Our First Date",
    date: "The coffee was never just coffee",
    caption:
      "I ordered mine the exact same way as you, and we laughed about it the whole night. I knew right then — it was you.",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "mem_laughing",
    title: "Never Stopped Laughing",
    date: "Every single day",
    caption:
      "The jokes that make no sense to anyone else, the smiles I can't hide, the moments that are ours and ours alone.",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "mem_together",
    title: "Together, Always",
    date: "And all the days ahead",
    caption:
      "Every chapter before this one led here. And every chapter after this one — I want to spend it with you.",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockQuestions: Question[] = [
  {
    id: "q_loves_more",
    title: "Who loves more?",
    subtitle: "Be honest. The data already knows.",
    emoji: "❤️",
    order: 1,
    options: [
      { id: "opt_you", label: "You do", emoji: "😊" },
      { id: "opt_me", label: "I do", emoji: "🥺" },
      { id: "opt_both", label: "Both — impossible to measure", emoji: "💞" },
    ],
    correctAnswerId: "opt_both",
  },
  {
    id: "q_more_stubborn",
    title: "Who's more stubborn?",
    subtitle: "We both know the answer to this one.",
    emoji: "😤",
    order: 2,
    options: [
      { id: "opt_you", label: "You, obviously", emoji: "🙈" },
      { id: "opt_me", label: "Fine… me, a little", emoji: "😅" },
      { id: "opt_equally", label: "Equally impossible", emoji: "⚖️" },
    ],
    correctAnswerId: "opt_equally",
  },
  {
    id: "q_misses_first",
    title: "Who misses first?",
    subtitle: "Ten minutes apart is already too long.",
    emoji: "💌",
    order: 3,
    options: [
      { id: "opt_me", label: "Always me", emoji: "💘" },
      { id: "opt_you", label: "You, secretly", emoji: "🤫" },
      { id: "opt_we", label: "Both at the same second", emoji: "🫶" },
    ],
    correctAnswerId: "opt_we",
  },
  {
    id: "q_cuter",
    title: "Who is cuter?",
    subtitle: "This one is scientifically settled.",
    emoji: "🥰",
    order: 4,
    options: [
      { id: "opt_you", label: "You, no contest", emoji: "😍" },
      { id: "opt_me", label: "Me, obviously", emoji: "😌" },
      { id: "opt_tie", label: "A perfect tie", emoji: "🤝" },
    ],
    correctAnswerId: "opt_you",
  },
];

export const mockAnswers: Answer[] = [];

export const mockSongs: Song[] = [
  {
    id: "sng_our_song",
    title: "Perfect",
    artist: "Ed Sheeran",
    youtubeId: "2Vv-BfVoq4g",
    note: "The song I always think of when I think of us.",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sng_hold_on",
    title: "Hold On",
    artist: "Justin Bieber",
    youtubeId: "Tl_yMfGZVSs",
    note: "For every time we held on a little longer.",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sng_stay",
    title: "Stay With Me",
    artist: "Sam Smith",
    youtubeId: "pB-5XG-DbAA",
    note: "How I feel every time the night ends.",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockReasons: Reason[] = [
  {
    id: "rsn_sunshine",
    emoji: "🌞",
    title: "You are my sunshine",
    detail:
      "Even on my grayest days, one message from you and the whole sky clears. You make happiness feel effortless.",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_laugh",
    emoji: "💫",
    title: "The sound of your laugh",
    detail:
      "The sound I would travel across the world just to hear again. My favourite song has no melody — it's that laugh.",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_late_nights",
    emoji: "🌙",
    title: "Late night talks",
    detail:
      "The hours melt away whenever we talk. Sleep has learned to wait patiently for you — it knows it always loses.",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_first_date",
    emoji: "☕",
    title: "Our first date",
    detail:
      "Coffee has never tasted the same since. Neither has any other place, really — my favourite spot is wherever you are.",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_my_name",
    emoji: "💌",
    title: "The way you say my name",
    detail:
      "It sounds completely different when you say it. Like it finally belongs to someone — to you.",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_little_things",
    emoji: "🫶",
    title: "You notice the little things",
    detail:
      "The tiny details you remember about me — my order, my moods, my silly habits. I keep every single one close.",
    order: 6,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_ordinary",
    emoji: "🌸",
    title: "You make ordinary days feel special",
    detail:
      "A random Tuesday with you feels like a Friday. You don't need an occasion — you are the occasion.",
    order: 7,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_listen",
    emoji: "🎧",
    title: "You actually listen",
    detail:
      "You hear the things I don't say out loud. You remember the little hopes I only mention once.",
    order: 8,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_smile",
    emoji: "😊",
    title: "Your smile",
    detail:
      "Officially one of the seven wonders of the world. Some say eight — but they clearly haven't seen it.",
    order: 9,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_dreams",
    emoji: "🌠",
    title: "How you light up talking about your dreams",
    detail:
      "The sparkle in your eyes when you talk about the future — I could listen forever and never get bored.",
    order: 10,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_home",
    emoji: "🤗",
    title: "You feel like home",
    detail:
      "Wherever you are, that's where I belong. Home stopped being a place the moment you walked in.",
    order: 11,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "rsn_forever",
    emoji: "∞",
    title: "Forever isn't long enough",
    detail:
      "But I'll happily take every single second of it — as long as it's spent with you.",
    order: 12,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockDates: DateIdea[] = [
  {
    id: "dt_stargaze",
    emoji: "🌌",
    title: "Stargaze somewhere quiet",
    description:
      "A blanket, a hill far from the city lights, and a sky full of stars. We'll invent our own constellations and name them after us.",
    tag: "free",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dt_pizza",
    emoji: "🍕",
    title: "Homemade pizza night",
    description:
      "We make the dough, we make a beautiful mess, and we absolutely make each other laugh. Loser does the dishes.",
    tag: "home",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dt_ice_cream",
    emoji: "🍦",
    title: "Midnight ice cream run",
    description:
      "An ice cream date at 10pm for no reason at all. Because 'just because' dates are the best kind.",
    tag: "sweet",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dt_bike",
    emoji: "🚲",
    title: "Bike ride somewhere new",
    description:
      "We pack snacks, pick a random direction, and explore a part of town we've never seen. Getting lost is part of it.",
    tag: "adventure",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dt_portrait",
    emoji: "🎨",
    title: "Paint each other's portrait",
    description:
      "Neither of us can draw. That's the entire point. We frame the masterpieces anyway and laugh forever.",
    tag: "silly",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dt_bookstore",
    emoji: "📚",
    title: "Bookstore roulette",
    description:
      "We pick a book for each other in a real bookstore, then read the first chapter together over coffee.",
    tag: "cozy",
    order: 6,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dt_sunset",
    emoji: "🌅",
    title: "Watch the sunset",
    description:
      "We find the best view in town and just sit. Nothing else. The sky does the rest of the talking.",
    tag: "free",
    order: 7,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dt_bakeoff",
    emoji: "🧁",
    title: "Baking competition",
    description:
      "One recipe, two rivals, one winner. Nobody actually cares who wins — we both get cake.",
    tag: "home",
    order: 8,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dt_dance",
    emoji: "💃",
    title: "Learn a dance from a tutorial",
    description:
      "We will step on each other's feet. That is also the point. Terrible dancing, perfect night.",
    tag: "silly",
    order: 9,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dt_fair",
    emoji: "🎡",
    title: "A fair or festival",
    description:
      "Cotton candy, carnival games we're hopelessly bad at, and a ferris wheel ride at night with the whole town below.",
    tag: "sweet",
    order: 10,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockLetters: Letter[] = [
  {
    id: "ltr_sleep",
    emoji: "🌙",
    title: "Open when you can't sleep",
    message:
      "Hey you. It's late, and your mind is doing that thing again — running laps. So let me tell you a boring, wonderful story. Somewhere out there, I'm imagining exactly this: you, wrapped in your blanket, finally relaxed. I'm not there to brush the hair from your forehead yet, but I will be. Count my heartbeats with me — close your eyes and pretend my hand is resting on yours. One, two, three... by the time you reach a hundred, I promise, sleep will find you. I love you. Rest, my love.",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ltr_miss",
    emoji: "💌",
    title: "Open when you miss me",
    message:
      "I miss you too. Right now, this very second — even though I already told you this morning, and I'll tell you again tonight. Missing you is just love in a little bit of a hurry to see you. So picture this: the next time I see you, I'm going to hug you like I'm trying to memorize you. Read this letter as many times as you need. Every time you do, I'm thinking of you on the other end. You are never more than a heartbeat away from me.",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ltr_laugh",
    emoji: "😊",
    title: "Open when you need a laugh",
    message:
      "Remember when we tried to be serious about cooking together and the kitchen looked like a flour explosion? And when we tried to dance and you (gently, lovingly) called my moves 'aggressively enthusiastic'? I think about those moments and I can't help but smile like an idiot. Life with you is one long inside joke, and I never want to stop being the punchline. Laugh again for me right now — I can feel it from here, and it's my favourite sound in the world.",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ltr_bad_day",
    emoji: "🫂",
    title: "Open when you're having a bad day",
    message:
      "Okay, stop. Breathe in, breathe out. This day does not get to define you, and neither does whatever just happened. You're allowed to feel it all — I'll hold the whole messy feeling with you. But listen: you are the strongest, kindest person I know, and I'm not just saying that because I love you (though I do, endlessly). Tomorrow will be gentler. And if it isn't, we'll face that one together too. You're never alone in this — ever. I've got you, always.",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ltr_doubt",
    emoji: "🌟",
    title: "Open when you doubt yourself",
    message:
      "Since you apparently can't see what I see, let me be your mirror for a moment. I've watched you be brave when it was easier to be scared. Kind when it was easier to be cold. Patient when I was impossible. You talk about your dreams and the whole room lights up — especially me. You are not 'almost enough'. You are everything, fully, right now. Read this again every time you forget. I will spend the rest of my life reminding you.",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ltr_loved",
    emoji: "❤️",
    title: "Open when you want to feel loved",
    message:
      "Then this one's for you, because here it is, all of it: I love the way you scrunch your nose, the way you say my name like it's something precious, the way you laugh at things I've already forgotten. I love that you make me want to be the best version of myself. I love that my favourite place in the entire world is simply wherever you are. You are my person. That will never change — not today, not in a year, not ever. Loved. Always. Unconditionally. That's you.",
    order: 6,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockGalleryImages: GalleryImage[] = [
  {
    id: "photo-1",
    caption: "My favourite subject, every single time.",
    category: "favourite",
    featured: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "photo-2",
    caption: "You, just being you.",
    category: "moment",
    featured: false,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "photo-3",
    caption: "The smile that made everything easier.",
    category: "favourite",
    featured: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "photo-4",
    caption: "Proof that ordinary days can feel this magical.",
    category: "favourite",
    featured: true,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "photo-5",
    caption: "I could stare at this all day.",
    category: "moment",
    featured: false,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "photo-6",
    caption: "Caught the whole universe in one frame.",
    category: "favourite",
    featured: false,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "photo-7",
    caption: "And I still can't believe you're real.",
    category: "moment",
    featured: false,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockLoveNotes: LoveNote[] = [
  {
    id: "nt_hello",
    emoji: "🌤️",
    text: "You make every morning feel like a fresh start, even before my first coffee.",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "nt_text",
    emoji: "📱",
    text: "The 'good morning' texts that turn my whole day around. Every. Single. Time.",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "nt_laugh",
    emoji: "😂",
    text: "The way we laugh at jokes only we understand. Our secret language of joy.",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "nt_home",
    emoji: "🏠",
    text: "Wherever you are, that's home. Even a phone call across any distance.",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "nt_stars",
    emoji: "✨",
    text: "You're the reason the sky feels closer and the stars feel brighter.",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "nt_easy",
    emoji: "🫶",
    text: "Loving you has never felt like work. It's the most natural thing I've ever done.",
    order: 6,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "nt_mind",
    emoji: "🧠",
    text: "You were the last thought in my mind tonight. You'll be the first one tomorrow.",
    order: 7,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "nt_future",
    emoji: "🌈",
    text: "Every future I imagine has you in it. That's how I know it's the right one.",
    order: 8,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "nt_forever",
    emoji: "♾️",
    text: "Forever isn't long enough. But I'll happily spend every minute of it trying.",
    order: 9,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockCompliments: Compliment[] = [
  {
    id: "cp_smile",
    emoji: "😊",
    text: "Your smile could calm any storm.",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_laugh",
    emoji: "🎵",
    text: "Your laugh is my favourite song, on repeat forever.",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_heart",
    emoji: "❤️",
    text: "You have the biggest heart of anyone I know.",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_bright",
    emoji: "🌞",
    text: "You light up every room you walk into.",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_kind",
    emoji: "🕊️",
    text: "Your kindness makes the world softer.",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_smart",
    emoji: "🧠",
    text: "You're brilliant — and it shows in everything you do.",
    order: 6,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_strong",
    emoji: "💪",
    text: "You're stronger than you'll ever believe.",
    order: 7,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_easy",
    emoji: "🫶",
    text: "Talking to you is the easiest thing in the world.",
    order: 8,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_adorable",
    emoji: "🥰",
    text: "Everything about you is impossibly adorable.",
    order: 9,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_mine",
    emoji: "💍",
    text: "You're the best thing that ever happened to me.",
    order: 10,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockWishes: Wish[] = [
  {
    id: "ws_hold",
    emoji: "🤝",
    text: "I wish we never stop holding hands.",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ws_laugh",
    emoji: "😄",
    text: "I wish we keep laughing at the same silly things forever.",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ws_travel",
    emoji: "✈️",
    text: "I wish we explore every corner of the world together.",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ws_sunsets",
    emoji: "🌅",
    text: "I wish we watch a thousand more sunsets, never in a hurry.",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ws_grow",
    emoji: "🌱",
    text: "I wish we grow old together, slowly, and stay young at heart.",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ws_dream",
    emoji: "🌠",
    text: "I wish every dream we whisper becomes real.",
    order: 6,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ws_dance",
    emoji: "💃",
    text: "I wish we keep dancing in the kitchen like nobody's watching.",
    order: 7,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "ws_always",
    emoji: "♾️",
    text: "I wish for you, always — that's my only wish.",
    order: 8,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockLovePromises: LovePromise[] = [
  {
    id: "pm_patient",
    emoji: "🤍",
    title: "I promise to be patient",
    text: "On your hardest days, I'll hold your hand and wait as long as you need.",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "pm_listen",
    emoji: "👂",
    title: "I promise to listen",
    text: "Not just to your words, but to the silence between them.",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "pm_honest",
    emoji: "🫶",
    title: "I promise to be honest",
    text: "Even when it's hard, especially when it's hard — honesty, always.",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "pm_choose",
    emoji: "💍",
    title: "I promise to choose you",
    text: "Every single day, in every single decision, it will be you.",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "pm_laugh",
    emoji: "😂",
    title: "I promise to make you laugh",
    text: "Even when I'm terrible at it — especially then.",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "pm_grow",
    emoji: "🌱",
    title: "I promise to grow with you",
    text: "To become better, together, for all the years ahead.",
    order: 6,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "pm_forever",
    emoji: "♾️",
    title: "I promise forever",
    text: "Not because it's easy, but because it's you.",
    order: 7,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockDreams: Dream[] = [
  {
    id: "dr_travel",
    emoji: "✈️",
    title: "See the northern lights",
    text: "Blankets, hot chocolate, and the sky dancing in green and pink — with you.",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dr_cozy",
    emoji: "🏡",
    title: "Our little home",
    text: "Mismatched mugs, a shelf of our photos, and a corner for all our books.",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dr_city",
    emoji: "🗺️",
    title: "City-hopping across the world",
    text: "New street food, new sunsets, new souvenirs — one city at a time.",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dr_sunrise",
    emoji: "🌅",
    title: "Watch the sunrise at the beach",
    text: "We stay up all night talking, then watch the world wake up together.",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dr_kite",
    emoji: "🪁",
    title: "Fly a kite like kids again",
    text: "Silly, free, and laughing until our sides hurt.",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dr_cook",
    emoji: "👨‍🍳",
    title: "Cook a whole country's cuisine",
    text: "Every weekend, a new country. Every meal, a new adventure.",
    order: 6,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dr_book",
    emoji: "📖",
    title: "Write our story down",
    text: "So that years from now, we can flip back to the beginning.",
    order: 7,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "dr_always",
    emoji: "♾️",
    title: "Grow old together",
    text: "Grey hair, slow walks, and the same love in our eyes.",
    order: 8,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockCapsules: Capsule[] = [
  {
    id: "cp_3months",
    emoji: "🎈",
    title: "For our 3-month anniversary",
    message:
      "If you're reading this, we've made it three whole months. Quick — go tell me you love me again, right now, out loud. And smile: I already know you did.",
    unlockDate: "2026-10-01",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_newyear",
    emoji: "🎆",
    title: "For New Year's Eve",
    message:
      "Whatever this year turned out to be, I'm glad we lived it together. Here's to the next one — same hands, same laughter, same us.",
    unlockDate: "2026-12-31",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_firstfight",
    emoji: "🕊️",
    title: "For the day we argue",
    message:
      "If we're fighting right now, pause. I love you — that hasn't changed, and it won't. Take my hand, take a breath, and let's start over. I'm not going anywhere.",
    unlockDate: "2027-06-01",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_forever",
    emoji: "💍",
    title: "For our forever",
    message:
      "If you're reading this far in the future, then we did it. We chose each other, over and over, for all those years. I'd choose you again. Always.",
    unlockDate: "2099-12-31",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "cp_today",
    emoji: "💌",
    title: "Open me today",
    message:
      "Surprise — this one's for right now. You, reading this, right this second: I love you. That's all. Go enjoy the day.",
    unlockDate: "2026-01-01",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const mockSurprises: Surprise[] = [
  {
    id: "sr_coffee",
    emoji: "☕",
    title: "A slow coffee date",
    message: "Your favourite drink, my treat, zero plans, and all the time in the world.",
    order: 1,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sr_note",
    emoji: "💌",
    title: "A love note, written by hand",
    message: "Somewhere real, written by hand, waiting to be found. Ask me for it.",
    order: 2,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sr_dance",
    emoji: "🎶",
    title: "A dance in the kitchen",
    message: "No music needed. Just us, and a song only we can hear.",
    order: 3,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sr_star",
    emoji: "⭐",
    title: "A star named after you",
    message: "Somewhere up there, a star with your name — so you can never be lost.",
    order: 4,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sr_hug",
    emoji: "🤗",
    title: "A hug, longer than usual",
    message: "Redeemable at any time, no questions asked. The longer, the better.",
    order: 5,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sr_sunset",
    emoji: "🌇",
    title: "A sunset with no talking",
    message: "Just us, the sky, and our hands. Sometimes silence says the most.",
    order: 6,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sr_playlist",
    emoji: "🎧",
    title: "A playlist made only for you",
    message: "Every song, a memory. Press play and think of me.",
    order: 7,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sr_breakfast",
    emoji: "🥞",
    title: "Breakfast in bed",
    message: "Your favourites, prepared terribly but with maximum love.",
    order: 8,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sr_laugh",
    emoji: "😄",
    title: "Ten minutes of my worst jokes",
    message: "You'll groan. You'll laugh. You'll never get those minutes back — totally worth it.",
    order: 9,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "sr_forever",
    emoji: "♾️",
    title: "And everything, forever",
    message: "Scratch all of these, and it all adds up to one thing: you, me, forever.",
    order: 10,
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];
