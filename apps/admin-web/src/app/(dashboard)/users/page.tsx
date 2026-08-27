"use client";

import { useState } from "react";

import { Check, Pencil, ShieldCheck, UserRound, X } from "lucide-react";

import type { AdminUser } from "@repo/shared";

import { Badge, ErrorText, Input, SegmentedControl } from "@/components/ui";
import { ErrorState, ListCard, LoadingState, PageHeader } from "@/components/crud";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ApiError, del, put } from "@/lib/api";
import { useAuth } from "@/context/auth-provider";
import { useData } from "@/lib/use-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://loveme-hazel.vercel.app"
    : "http://localhost:3000");

export default function UsersPage() {
  const { user: me } = useAuth();
  const { data: users, loading, error, reload } = useData<AdminUser>("/users");
  const [errorMsg, setErrorMsg] = useState<string>();
  const [removeTarget, setRemoveTarget] = useState<AdminUser>();
  const [removing, setRemoving] = useState(false);
  const [editingSlug, setEditingSlug] = useState<AdminUser>();
  const [slugDraft, setSlugDraft] = useState("");
  const [savingSlug, setSavingSlug] = useState(false);

  const startSlugEdit = (target: AdminUser) => {
    setEditingSlug(target);
    setSlugDraft(target.slug);
    setErrorMsg(undefined);
  };

  const saveSlug = async () => {
    if (!editingSlug) return;
    setSavingSlug(true);
    setErrorMsg(undefined);
    try {
      await put(`/users/${editingSlug.id}`, { slug: slugDraft });
      setEditingSlug(undefined);
      void reload();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setSavingSlug(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const isAdmin = me?.role === "admin";

  const changeRole = async (id: string, role: "admin" | "editor") => {
    setErrorMsg(undefined);
    try {
      await put(`/users/${id}`, { role });
      void reload();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Update failed");
    }
  };

  const removeUser = async (target: AdminUser) => {
    setRemoving(true);
    setErrorMsg(undefined);
    try {
      await del(`/users/${target.id}`);
      void reload();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setRemoving(false);
      setRemoveTarget(undefined);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={isAdmin ? "Manage admin accounts." : "Only admins can edit or remove users."}
      />
      <ErrorText message={errorMsg} />
      <div className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === me?.id;
          return (
            <ListCard
              key={user.id}
              title={
                <>
                  {user.name}
                  {isSelf && <span className="text-muted-foreground ml-2 text-sm">(you)</span>}
                </>
              }
              subtitle={`${user.email} · joined ${new Date(user.createdAt).toLocaleDateString()}`}
              meta={
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">
                    {SITE_URL}/u/{user.slug}
                  </Badge>
                  <Badge tone={user.role === "admin" ? "rose" : "neutral"}>{user.role}</Badge>
                  {isAdmin && !isSelf && (
                    <SegmentedControl
                      name={`Role for ${user.name}`}
                      size="sm"
                      value={user.role}
                      onChange={(role) => void changeRole(user.id, role)}
                      className="w-auto"
                      options={[
                        { value: "admin", label: "Admin", icon: ShieldCheck },
                        { value: "editor", label: "Editor", icon: UserRound },
                      ]}
                    />
                  )}
                </div>
              }
              extra={
                isAdmin && editingSlug?.id === user.id ? (
                  <div className="border-white/10 flex flex-wrap items-center gap-2 border-t px-4 py-3">
                    <span className="text-muted-foreground text-xs">Page address:</span>
                    <span className="text-muted-foreground text-xs">…/u/</span>
                    <Input
                      value={slugDraft}
                      onChange={(event) => setSlugDraft(event.target.value.toLowerCase())}
                      className="w-44"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => void saveSlug()}
                      disabled={savingSlug}
                      className="hover:text-foreground text-emerald-300 inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm transition-colors disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSlug(undefined)}
                      disabled={savingSlug}
                      className="text-muted-foreground hover:text-foreground inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                ) : undefined
              }
              actions={
                isAdmin && !isSelf ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startSlugEdit(user)}
                      title="Edit page address"
                      className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoveTarget(user)}
                      className="text-muted-foreground hover:text-rose-300 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : undefined
              }
            />
          );
        })}
      </div>

      {removeTarget && (
        <ConfirmDialog
          title={`Remove ${removeTarget.name}?`}
          message="They'll lose access to the admin dashboard. This can't be undone."
          confirmLabel="Remove"
          loading={removing}
          onCancel={() => setRemoveTarget(undefined)}
          onConfirm={() => void removeUser(removeTarget)}
        />
      )}
    </div>
  );
}
