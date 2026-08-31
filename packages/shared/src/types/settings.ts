export interface LandingSettings {
  heroText: string;
  intro: string;
  ctaLabel: string;
  footer: string;
  heroImageUrl?: string;
}

export interface ProposalSettings {
  title: string;
  message: string;
  hint: string;
  noLabels: string[];
  yesLabel: string;
}

export interface SuccessSettings {
  heading: string;
  messages: string[];
}

export interface MusicSettings {
  backgroundAudioUrl: string;
  landingYoutubeId: string;
  questionsYoutubeId: string;
  proposalYoutubeId: string;
}

export interface LoveSettings {
  startDate: string;
  startLabel: string;
}

export interface BirthdaySettings {
  date: string;
  message: string;
}

export interface NavigationSettings {
  chaptersEnabled: boolean;
}

export interface SiteSettings {
  recipientName: string;
  siteTitle: string;
  landing: LandingSettings;
  proposal: ProposalSettings;
  success: SuccessSettings;
  music: MusicSettings;
  love: LoveSettings;
  birthday: BirthdaySettings;
  navigation: NavigationSettings;
}
