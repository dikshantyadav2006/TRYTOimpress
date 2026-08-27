"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

import { cn } from "@repo/ui";

import { del } from "@/lib/api";
import { friendlyError } from "@/lib/errors";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Card, Checkbox, ErrorText, Spinner } from "@/components/ui";

export function PageHeader({
  title,
  subtitle,
  backHref,
  newHref,
  newLabel,
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  newHref?: string;
  newLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-foreground font-serif text-2xl sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>
        {newHref ? (
          <Link
            href={newHref}
            className="bg-linear-to-r from-rose-500 to-pink-500 inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-5 text-sm font-semibold text-white shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] ring-1 ring-white/20 ring-inset transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{newLabel ?? "New"}</span>
            <span className="sm:hidden">New</span>
          </Link>
        ) : (
          action
        )}
        {newHref && action}
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Spinner className="h-8 w-8 border-[2.5px]" />
      <p className="text-muted-foreground text-sm">Loading…</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <span aria-hidden className="text-4xl">
        😕
      </span>
      <p className="text-rose-400 text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  href,
  hrefLabel,
}: {
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
      <span aria-hidden className="text-4xl">
        ✨
      </span>
      <p className="text-foreground font-medium">{title}</p>
      <p className="text-muted-foreground max-w-xs text-sm">{description}</p>
      {href && (
        <Link
          href={href}
          className="bg-rose-500/15 text-rose-200 mt-4 inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-colors hover:bg-rose-500/25"
        >
          <Plus className="h-4 w-4" />
          {hrefLabel ?? "Create one"}
        </Link>
      )}
    </div>
  );
}

export function DeleteButton({
  id,
  path,
  onDeleted,
}: {
  id: string;
  path: string;
  onDeleted?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>();
  const { showToast } = useToast();

  const onDelete = async () => {
    setDeleting(true);
    setError(undefined);
    try {
      await del(`${path}/${id}`);
      showToast("success", "Deleted");
      onDeleted?.();
    } catch (err) {
      const friendly = friendlyError(err);
      setError(friendly.message);
      showToast("error", friendly.message);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setConfirming(true);
        }}
        disabled={deleting}
        aria-label="Delete"
        className="text-muted-foreground hover:text-rose-300 disabled:opacity-50 rounded-lg p-2 transition-colors"
      >
        {deleting ? <Spinner /> : <Trash2 className="h-4 w-4" />}
      </button>
      {error && <ErrorText message={error} />}
      {confirming && (
        <ConfirmDialog
          title="Delete this item?"
          message="This can't be undone."
          loading={deleting}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void onDelete()}
        />
      )}
    </div>
  );
}

export function ListCard({
  title,
  subtitle,
  meta,
  thumbnail,
  href,
  actions,
  extra,
  selectable,
  selected,
  onToggle,
}: {
  title: React.ReactNode;
  subtitle?: string | undefined;
  meta?: React.ReactNode;
  thumbnail?: string | undefined;
  href?: string | undefined;
  actions?: React.ReactNode;
  extra?: React.ReactNode;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const body = (
    <>
      {thumbnail && (
        <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/5 sm:h-16 sm:w-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate font-medium">{title}</p>
        {subtitle && <p className="text-muted-foreground mt-0.5 truncate text-sm">{subtitle}</p>}
        {meta && <div className="mt-1.5">{meta}</div>}
      </div>
    </>
  );

  if (selectable) {
    return (
      <Card
        className={cn(
          "hover:border-white/25 px-4 py-4 transition-colors sm:px-5",
          selected && "border-rose-400/60 bg-rose-500/[0.06]",
        )}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <Checkbox checked={Boolean(selected)} onChange={() => onToggle?.()} label="Select item" />
          <button
            type="button"
            onClick={() => onToggle?.()}
            className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
          >
            {body}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:border-white/25 px-4 py-4 transition-colors sm:px-5">
      <div className="flex items-center gap-3 sm:gap-4">
        {href ? (
          <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            {body}
            <ChevronRight className="text-muted-foreground/50 h-5 w-5 shrink-0" aria-hidden />
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">{body}</div>
        )}
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {extra}
    </Card>
  );
}
