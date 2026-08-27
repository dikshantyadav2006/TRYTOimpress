"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";

import type { Question, QuestionOption } from "@repo/shared";
import { cn } from "@repo/ui";

import { FormFooter, Input, Label, SectionCard } from "@/components/ui";
import { UploadField } from "@/components/upload-field";
import { useDirtyGuard } from "@/components/dirty-guard";
import { ApiError, post, put } from "@/lib/api";

function newOption(): QuestionOption {
  return {
    id: `opt_${Math.random().toString(36).slice(2, 9)}`,
    label: "",
    emoji: "",
  };
}

export function QuestionForm({ question }: { question?: Question | null }) {
  const router = useRouter();
  const isEdit = Boolean(question);

  const [title, setTitle] = useState(question?.title ?? "");
  const [subtitle, setSubtitle] = useState(question?.subtitle ?? "");
  const [emoji, setEmoji] = useState(question?.emoji ?? "");
  const [options, setOptions] = useState<QuestionOption[]>(
    question?.options?.length ? question.options.map((o) => ({ ...o })) : [newOption()],
  );
  const [correctAnswerId, setCorrectAnswerId] = useState(question?.correctAnswerId ?? "");
  const [imageUrl, setImageUrl] = useState(question?.imageUrl ?? "");
  const [order, setOrder] = useState(String(question?.order ?? ""));
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useDirtyGuard({ title, subtitle, emoji, options, correctAnswerId, imageUrl, order });

  const updateOption = (index: number, patch: Partial<QuestionOption>) => {
    setOptions((current) =>
      current.map((option, i) => (i === index ? { ...option, ...patch } : option)),
    );
  };

  const removeOption = (index: number) => {
    setOptions((current) => {
      const removed = current[index];
      if (removed && removed.id === correctAnswerId) {
        setCorrectAnswerId("");
      }
      return current.filter((_, i) => i !== index);
    });
  };

  const toggleCorrect = (option: QuestionOption) => {
    setCorrectAnswerId((current) => (current === option.id ? "" : option.id));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    const cleanedOptions = options.filter((option) => option.label.trim() !== "");
    if (cleanedOptions.length === 0) {
      setError("Add at least one option");
      setLoading(false);
      return;
    }
    const hasCorrect = cleanedOptions.some((option) => option.id === correctAnswerId);
    const body = {
      title,
      subtitle,
      ...(emoji ? { emoji } : {}),
      options: cleanedOptions,
      ...(hasCorrect ? { correctAnswerId } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      ...(order !== "" ? { order: Number(order) } : {}),
    };
    try {
      if (isEdit && question) {
        await put(`/questions/${question.id}`, body);
      } else {
        await post("/questions", body);
      }
      router.push("/questions");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <SectionCard title="Question" description="The prompt shown on the quiz.">
        <div>
          <Label htmlFor="title">Question</Label>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <div>
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input id="emoji" value={emoji} onChange={(event) => setEmoji(event.target.value)} />
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
      </SectionCard>

      <SectionCard
        title="Options"
        description="The possible answers. Tap the circle to mark the correct one."
      >
        <div className="space-y-2">
          {options.map((option, index) => {
            const isCorrect = correctAnswerId === option.id;
            return (
              <div
                key={option.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-2 transition-colors",
                  isCorrect
                    ? "border-rose-400/50 bg-rose-500/10"
                    : "border-white/10 bg-white/[0.02]",
                )}
              >
                <Input
                  className="w-16 shrink-0 text-center"
                  placeholder="Emoji"
                  value={option.emoji}
                  onChange={(event) => updateOption(index, { emoji: event.target.value })}
                />
                <Input
                  className="min-w-0 flex-1"
                  placeholder="Option label"
                  value={option.label}
                  onChange={(event) => updateOption(index, { label: event.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleCorrect(option)}
                  aria-pressed={isCorrect}
                  aria-label={`Mark ${option.label.trim() ? `"${option.label.trim()}"` : "this option"} as the correct answer`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                      isCorrect
                        ? "border-rose-400 bg-rose-500"
                        : "border-white/25 hover:border-rose-300",
                    )}
                  >
                    {isCorrect && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  aria-label="Remove option"
                  className="text-muted-foreground hover:text-rose-300 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setOptions((current) => [...current, newOption()])}
          className="text-rose-300 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-rose-500/10 hover:underline"
        >
          + Add option
        </button>
        {correctAnswerId && (
          <p className="text-muted-foreground text-xs">
            Tap the circle again to clear the correct answer.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Image" description="Optional image shown with the question.">
        <UploadField value={imageUrl} onChange={setImageUrl} />
      </SectionCard>

      <FormFooter loading={loading} error={error} submitLabel={isEdit ? "Save changes" : "Create question"} />
    </form>
  );
}
