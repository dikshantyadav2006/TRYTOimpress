import type { SiteSettings } from "../types/settings";

export const defaultSiteSettings: SiteSettings = {
  recipientName: "Cutie",
  siteTitle: "For Cutie ❤️",
  landing: {
    heroText: "Hi Cutie ❤️",
    intro: "I made something special for you",
    ctaLabel: "Tap to continue",
    footer: "one little journey · eighteen little chapters",
  },
  proposal: {
    title: "Will you be mine forever? ❤️",
    message:
      "Every chapter of this little journey led to this exact moment. One question, one answer — and only one of them is right.",
    hint: "hint: the No button runs away 😉",
    noLabels: ["No", "Are you sure?", "Really?", "Think again ❤️", "Last chance 😭"],
    yesLabel: "Yes, forever 💖",
  },
  success: {
    heading: "YES!",
    messages: [
      "I knew you'd say yes ❤️",
      "You just made me the happiest person alive 💕",
    ],
  },
  music: {
    backgroundAudioUrl: "",
    landingYoutubeId: "",
    questionsYoutubeId: "",
    proposalYoutubeId: "",
  },
  love: {
    startDate: "",
    startLabel: "the day we met",
  },
};
