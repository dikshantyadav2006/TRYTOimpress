"use client";

import { useEffect, useState } from "react";

import type { SiteSettings } from "@repo/shared";
import { parseYouTubeId } from "@repo/shared";

import {
  ErrorText,
  FormFooter,
  Input,
  Label,
  SectionCard,
  Textarea,
} from "@/components/ui";
import { LoadingState } from "@/components/crud";
import { UploadField } from "@/components/upload-field";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, get, put } from "@/lib/api";

const toLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const toYouTubeId = (value: string) => parseYouTubeId(value) ?? value.trim();

export function SettingsForm() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [heroText, setHeroText] = useState("");
  const [intro, setIntro] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [footer, setFooter] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalHint, setProposalHint] = useState("");
  const [noLabels, setNoLabels] = useState("");
  const [yesLabel, setYesLabel] = useState("");
  const [successHeading, setSuccessHeading] = useState("");
  const [successMessages, setSuccessMessages] = useState("");
  const [backgroundAudioUrl, setBackgroundAudioUrl] = useState("");
  const [landingYoutubeId, setLandingYoutubeId] = useState("");
  const [questionsYoutubeId, setQuestionsYoutubeId] = useState("");
  const [proposalYoutubeId, setProposalYoutubeId] = useState("");
  const [loveStartDate, setLoveStartDate] = useState("");
  const [loveStartLabel, setLoveStartLabel] = useState("");
  const [birthdayDate, setBirthdayDate] = useState("");
  const [birthdayMessage, setBirthdayMessage] = useState("");

  useEffect(() => {
    get<{ data: SiteSettings }>("/settings")
      .then(({ data }) => {
        setRecipientName(data.recipientName);
        setSiteTitle(data.siteTitle);
        setHeroText(data.landing.heroText);
        setIntro(data.landing.intro);
        setCtaLabel(data.landing.ctaLabel);
        setFooter(data.landing.footer);
        setHeroImageUrl(data.landing.heroImageUrl ?? "");
        setProposalTitle(data.proposal.title);
        setProposalMessage(data.proposal.message);
        setProposalHint(data.proposal.hint);
        setNoLabels(data.proposal.noLabels.join("\n"));
        setYesLabel(data.proposal.yesLabel);
        setSuccessHeading(data.success.heading);
        setSuccessMessages(data.success.messages.join("\n"));
        setBackgroundAudioUrl(data.music?.backgroundAudioUrl ?? "");
        setLandingYoutubeId(data.music?.landingYoutubeId ?? "");
        setQuestionsYoutubeId(data.music?.questionsYoutubeId ?? "");
        setProposalYoutubeId(data.music?.proposalYoutubeId ?? "");
        setLoveStartDate(data.love?.startDate ?? "");
        setLoveStartLabel(data.love?.startLabel ?? "");
        setBirthdayDate(data.birthday?.date ?? "");
        setBirthdayMessage(data.birthday?.message ?? "");
        setLoaded(true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load settings"));
  }, []);

  useDirtyGuard(
    {
      recipientName,
      siteTitle,
      heroText,
      intro,
      ctaLabel,
      footer,
      heroImageUrl,
      proposalTitle,
      proposalMessage,
      proposalHint,
      noLabels,
      yesLabel,
      successHeading,
      successMessages,
      backgroundAudioUrl,
      landingYoutubeId,
      questionsYoutubeId,
      proposalYoutubeId,
      loveStartDate,
      loveStartLabel,
      birthdayDate,
      birthdayMessage,
    },
    { enabled: loaded, resetKey: loaded },
  );

  if (!loaded) {
    if (error) return <ErrorText message={error} />;
    return <LoadingState />;
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    setSaved(false);
    try {
      await put("/settings", {
        recipientName,
        siteTitle,
        landing: {
          heroText,
          intro,
          ctaLabel,
          footer,
          ...(heroImageUrl ? { heroImageUrl } : {}),
        },
        proposal: {
          title: proposalTitle,
          message: proposalMessage,
          hint: proposalHint,
          noLabels: toLines(noLabels),
          yesLabel,
        },
        success: { heading: successHeading, messages: toLines(successMessages) },
        music: {
          backgroundAudioUrl: backgroundAudioUrl.trim(),
          landingYoutubeId: toYouTubeId(landingYoutubeId),
          questionsYoutubeId: toYouTubeId(questionsYoutubeId),
          proposalYoutubeId: toYouTubeId(proposalYoutubeId),
        },
        love: {
          startDate: loveStartDate.trim(),
          startLabel: loveStartLabel.trim(),
        },
        birthday: {
          date: birthdayDate.trim(),
          message: birthdayMessage.trim(),
        },
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <SectionCard title="Site" description="The name shown in the browser and on the landing page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="recipientName">Recipient name</Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="siteTitle">Site title</Label>
            <Input
              id="siteTitle"
              value={siteTitle}
              onChange={(event) => setSiteTitle(event.target.value)}
              required
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Landing page" description="The first screen visitors see.">
        <div>
          <Label htmlFor="heroText">Hero text</Label>
          <Input
            id="heroText"
            value={heroText}
            onChange={(event) => setHeroText(event.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="intro">Intro</Label>
          <Textarea
            id="intro"
            value={intro}
            onChange={(event) => setIntro(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ctaLabel">CTA label</Label>
            <Input
              id="ctaLabel"
              value={ctaLabel}
              onChange={(event) => setCtaLabel(event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="footer">Footer</Label>
            <Input
              id="footer"
              value={footer}
              onChange={(event) => setFooter(event.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label>Hero image</Label>
          <UploadField value={heroImageUrl} onChange={setHeroImageUrl} />
          <p className="text-muted-foreground mt-1.5 text-xs">
            The photo above the title on the landing page. Leave empty for a heart placeholder.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Proposal" description="The big question screen.">
        <div>
          <Label htmlFor="proposalTitle">Title</Label>
          <Input
            id="proposalTitle"
            value={proposalTitle}
            onChange={(event) => setProposalTitle(event.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="proposalMessage">Message</Label>
          <Textarea
            id="proposalMessage"
            value={proposalMessage}
            onChange={(event) => setProposalMessage(event.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="proposalHint">Hint</Label>
          <Input
            id="proposalHint"
            value={proposalHint}
            onChange={(event) => setProposalHint(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="noLabels">No labels (one per line)</Label>
            <Textarea
              id="noLabels"
              value={noLabels}
              onChange={(event) => setNoLabels(event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="yesLabel">Yes label</Label>
            <Input
              id="yesLabel"
              value={yesLabel}
              onChange={(event) => setYesLabel(event.target.value)}
              required
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Success" description="The screen shown after she says yes.">
        <div>
          <Label htmlFor="successHeading">Heading</Label>
          <Input
            id="successHeading"
            value={successHeading}
            onChange={(event) => setSuccessHeading(event.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="successMessages">Messages (one per line)</Label>
          <Textarea
            id="successMessages"
            value={successMessages}
            onChange={(event) => setSuccessMessages(event.target.value)}
            required
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Music & songs"
        description="Background music and YouTube embeds. Leave empty to keep the built-in melody."
      >
        <div>
          <Label htmlFor="backgroundAudioUrl">Background music URL (mp3)</Label>
          <Input
            id="backgroundAudioUrl"
            value={backgroundAudioUrl}
            onChange={(event) => setBackgroundAudioUrl(event.target.value)}
            placeholder="https://…/song.mp3"
          />
          <p className="text-muted-foreground mt-1.5 text-xs">
            Plays in the background while the music toggle is on. Leave empty to keep the built-in
            melody.
          </p>
        </div>
        <div>
          <Label htmlFor="landingYoutubeId">Landing page song (YouTube)</Label>
          <Input
            id="landingYoutubeId"
            value={landingYoutubeId}
            onChange={(event) => setLandingYoutubeId(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
        <div>
          <Label htmlFor="questionsYoutubeId">Questions page song (YouTube)</Label>
          <Input
            id="questionsYoutubeId"
            value={questionsYoutubeId}
            onChange={(event) => setQuestionsYoutubeId(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
        <div>
          <Label htmlFor="proposalYoutubeId">Proposal page song (YouTube)</Label>
          <Input
            id="proposalYoutubeId"
            value={proposalYoutubeId}
            onChange={(event) => setProposalYoutubeId(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Our love"
        description="Powers the days-together counter and stargazing on the Our Story chapter."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="loveStartDate">The day we started dating (date)</Label>
            <Input
              id="loveStartDate"
              type="date"
              value={loveStartDate}
              onChange={(event) => setLoveStartDate(event.target.value)}
            />
            <p className="text-muted-foreground mt-1.5 text-xs">
              Leave empty to hide the days counter and constellation.
            </p>
          </div>
          <div>
            <Label htmlFor="loveStartLabel">What that day is called</Label>
            <Input
              id="loveStartLabel"
              value={loveStartLabel}
              onChange={(event) => setLoveStartLabel(event.target.value)}
              placeholder="the day we met"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Birthday"
        description="Powers the birthday countdown chapter. Leave the date empty to hide it."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="birthdayDate">Birthday (date)</Label>
            <Input
              id="birthdayDate"
              type="date"
              value={birthdayDate}
              onChange={(event) => setBirthdayDate(event.target.value)}
            />
            <p className="text-muted-foreground mt-1.5 text-xs">
              The next celebration shown in the countdown. Leave empty to hide the birthday chapter.
            </p>
          </div>
          <div>
            <Label htmlFor="birthdayMessage">Message</Label>
            <Input
              id="birthdayMessage"
              value={birthdayMessage}
              onChange={(event) => setBirthdayMessage(event.target.value)}
              placeholder="a very special day is coming"
            />
          </div>
        </div>
      </SectionCard>

      <FormFooter loading={saving} saved={saved} error={error} submitLabel="Save settings" />
    </form>
  );
}
