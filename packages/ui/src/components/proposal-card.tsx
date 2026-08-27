"use client";

import { motion } from "framer-motion";
import type { Proposal } from "@repo/shared";

import { ImagePlaceholder } from "./image-placeholder";
import { NoButton } from "./no-button";
import { YesButton } from "./yes-button";

export interface ProposalCardProps {
  proposal: Proposal;
  imageSrc?: string;
}

export function ProposalCard({ proposal, imageSrc }: ProposalCardProps) {
  const src = imageSrc ?? proposal.imageUrl;
  return (
    <motion.section
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, y: -16 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 }}
      className="bg-surface relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 p-6 text-center shadow-2xl shadow-black/60 sm:p-8"
    >
      <ImagePlaceholder {...(src ? { src } : {})} />
      <h1 className="text-foreground mt-8 font-display text-5xl leading-tight sm:text-6xl">
        {proposal.title}
      </h1>
      {proposal.subtitle ? (
        <p className="mt-3 text-base text-white/60">{proposal.subtitle}</p>
      ) : null}
      {proposal.message ? (
        <p className="mt-4 text-sm leading-relaxed text-white/70">{proposal.message}</p>
      ) : null}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
        <YesButton />
        <NoButton />
      </div>
    </motion.section>
  );
}
