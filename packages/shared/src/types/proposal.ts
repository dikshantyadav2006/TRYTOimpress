export type ProposalId = string;

export type ProposalSlug = string;

export type Locale = string;

export type ProposalStatus = "draft" | "published" | "archived";

export interface Proposal {
  id: ProposalId;
  slug: ProposalSlug;
  title: string;
  message: string;
  subtitle: string;
  imageUrl?: string;
  recipientName?: string;
  locale: Locale;
  status: ProposalStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
