"use client";

import { useState } from "react";
import { Check, Copy, Plus } from "lucide-react";

import type { AdminUser, ShareLink, ShareRole } from "@repo/shared";

import { Badge, Card, ErrorText, Input, Label, SegmentedControl, Spinner } from "@/components/ui";
import { EmptyState, ErrorState, ListCard, LoadingState, PageHeader } from "@/components/crud";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ApiError, del, post } from "@/lib/api";
import { useAuth } from "@/context/auth-provider";
import { useData } from "@/lib/use-data";
import { useToast } from "@/components/toast";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://loveme-hazel.vercel.app"
    : "http://localhost:3000");

const PERMISSION_LABELS: Record<string, string> = {
  "images.edit": "Replace images",
  "gallery.add": "Add gallery photos",
};

interface CreatedLink {
  link: ShareLink;
  token: string;
}

function linkUrl(token: string): string {
  return `${SITE_URL}/share/${token}`;
}

export default function ShareLinksPage() {
  const { data, loading, error, reload } = useData<ShareLink>("/share-links");
  const { user } = useAuth();
  const usersData = useData<AdminUser>("/users");
  const { showToast } = useToast();
  const [label, setLabel] = useState("");
  const [role, setRole] = useState<ShareRole>("editor");
  const [expiresAt, setExpiresAt] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string>();
  const [created, setCreated] = useState<CreatedLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ShareLink>();
  const [removing, setRemoving] = useState(false);

  const isAdmin = user?.role === "admin";
  const users = isAdmin ? usersData.data : [];

  const createLink = async () => {
    setCreateError(undefined);
    if (!label.trim()) {
      setCreateError("Give the link a label first.");
      return;
    }
    setCreating(true);
    try {
      const body = await post<{ data: CreatedLink }>("/share-links", {
        label,
        role,
        ...(expiresAt ? { expiresAt } : {}),
        ...(isAdmin && targetUserId ? { userId: targetUserId } : {}),
      });
      setCreated(body.data);
      setCopied(false);
      setLabel("");
      setExpiresAt("");
      showToast("success", "Share link created");
      void reload();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("success", "Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("error", "Couldn't copy the link");
    }
  };

  const removeLink = async (target: ShareLink) => {
    setRemoving(true);
    try {
      await del(`/share-links/${target.id}`);
      showToast("success", "Share link revoked");
      void reload();
      if (created?.link.id === target.id) setCreated(null);
    } catch (err) {
      showToast("error", err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setRemoving(false);
      setRemoveTarget(undefined);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Share links"
        subtitle="Give someone an invite link to replace and add photos on the public site."
      />

      <Card className="mb-6 space-y-4">
        <h2 className="font-serif text-lg">New share link</h2>
        <div>
          <Label htmlFor="share-label">Label</Label>
          <Input
            id="share-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. Ria's edits"
          />
        </div>
        {isAdmin && (
          <div>
            <Label htmlFor="share-target">For site</Label>
            <select
              id="share-target"
              value={targetUserId}
              onChange={(event) => setTargetUserId(event.target.value)}
              className="border-white/10 bg-white/[0.03] focus:border-rose-400/50 w-full rounded-xl border px-3 py-2.5 text-sm text-white outline-none transition-colors"
            >
              <option value="" className="bg-neutral-900">
                {user?.slug ? `My site (/u/${user.slug})` : "My site"}
              </option>
              {users.map((account) => (
                <option key={account.id} value={account.id} className="bg-neutral-900">
                  {account.name} (/u/{account.slug})
                </option>
              ))}
            </select>
            <p className="text-muted-foreground mt-1.5 text-xs">
              Admins can create a link that lets a user&apos;s partner edit that site.
            </p>
          </div>
        )}
        <div>
          <Label>Role</Label>
          <SegmentedControl
            name="role"
            value={role}
            onChange={setRole}
            options={[
              { value: "editor", label: "Editor" },
              { value: "viewer", label: "Viewer" },
            ]}
          />
          <p className="text-muted-foreground mt-1.5 text-xs">
            Editor links can replace images anywhere and add gallery photos. Viewer links do
            nothing today but are ready for future read-only access.
          </p>
        </div>
        <div>
          <Label htmlFor="share-expiry">Expires (optional)</Label>
          <Input
            id="share-expiry"
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void createLink()}
            disabled={creating}
            className="bg-linear-to-r from-rose-500 to-pink-500 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] ring-1 ring-white/20 ring-inset transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {creating ? <Spinner /> : <Plus className="h-4 w-4" />}
            Create link
          </button>
          <ErrorText message={createError} />
        </div>
      </Card>

      {created && (
        <Card className="border-emerald-400/30 mb-6">
          <p className="text-emerald-300 text-sm font-medium">
            Link created — send it to her. The full link is only shown once.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="bg-white/5 min-w-0 flex-1 truncate rounded-lg border border-white/10 px-3 py-2 text-sm text-white/85">
              {linkUrl(created.token)}
            </code>
            <button
              type="button"
              onClick={() => void copy(linkUrl(created.token))}
              className="border-white/10 bg-white/[0.03] hover:border-white/25 inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm text-white/80 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Opening it stores a 30-day cookie in her browser. Role:{" "}
            <span className="text-white/70">{created.link.role}</span>.
          </p>
        </Card>
      )}

      {data.length === 0 ? (
        <EmptyState
          title="No share links yet"
          description="Create one above to let her edit images on the site."
        />
      ) : (
        <div className="space-y-3">
          {data.map((link) => {
            const expired = link.expiresAt !== undefined && new Date(link.expiresAt).getTime() < Date.now();
            return (
              <ListCard
                key={link.id}
                title={link.label}
                subtitle={`Created ${new Date(link.createdAt).toLocaleDateString()}`}
                meta={
                  <div className="flex flex-wrap items-center gap-2">
                    {link.ownerSlug && <Badge>/u/{link.ownerSlug}</Badge>}
                    <Badge tone={link.role === "editor" ? "rose" : "neutral"}>{link.role}</Badge>
                    {link.permissions.map((permission) => (
                      <Badge key={permission} tone="emerald">
                        {PERMISSION_LABELS[permission] ?? permission}
                      </Badge>
                    ))}
                    {link.expiresAt &&
                      (expired ? (
                        <Badge tone="amber">expired</Badge>
                      ) : (
                        <Badge>expires {new Date(link.expiresAt).toLocaleDateString()}</Badge>
                      ))}
                  </div>
                }
                actions={
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(link)}
                    className="text-muted-foreground hover:text-rose-300 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Revoke
                  </button>
                }
              />
            );
          })}
        </div>
      )}

      {removeTarget && (
        <ConfirmDialog
          title={`Revoke “${removeTarget.label}”?`}
          message="Anyone using this link will lose edit access immediately."
          confirmLabel="Revoke"
          loading={removing}
          onCancel={() => setRemoveTarget(undefined)}
          onConfirm={() => void removeLink(removeTarget)}
        />
      )}
    </div>
  );
}
