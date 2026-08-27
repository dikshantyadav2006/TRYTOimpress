import { createHash, randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";

import type {
  ShareLink,
  ShareLinkInput,
  SharePermission,
} from "../../types/share";
import { SHARE_PERMISSIONS } from "../../types/share";
import { shareLinks, type ShareLinkDoc } from "../models";
import { adminUsers } from "../models";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateShareToken(): string {
  return randomBytes(24).toString("base64url");
}

function defaultPermissions(role: ShareLink["role"]): SharePermission[] {
  return role === "editor" ? [...SHARE_PERMISSIONS] : [];
}

function sanitizePermissions(permissions: unknown): SharePermission[] {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter(
    (permission): permission is SharePermission =>
      typeof permission === "string" &&
      (SHARE_PERMISSIONS as readonly string[]).includes(permission),
  );
}

function mapShareLink(doc: ShareLinkDoc): ShareLink {
  return {
    id: doc._id.toString(),
    ownerId: doc.ownerId,
    label: doc.label,
    role: doc.role,
    permissions: [...doc.permissions],
    ...(doc.expiresAt ? { expiresAt: doc.expiresAt.toISOString() } : {}),
    ...(doc.lastUsedAt ? { lastUsedAt: doc.lastUsedAt.toISOString() } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

async function attachOwnerSlug(links: ShareLink[]): Promise<ShareLink[]> {
  if (links.length === 0) return links;
  const ids = [...new Set(links.map((link) => link.ownerId))];
  const owners = await adminUsers().find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray();
  const slugById = new Map(owners.map((owner) => [owner._id.toString(), owner.slug]));
  return links.map((link) => {
    const ownerSlug = slugById.get(link.ownerId);
    return ownerSlug ? { ...link, ownerSlug } : link;
  });
}

export class MongoShareLinkRepository {
  async createLink(
    input: ShareLinkInput,
    createdBy: string,
    ownerId: string,
    token: string,
  ): Promise<ShareLink> {
    const doc: ShareLinkDoc = {
      _id: new ObjectId(),
      ownerId,
      tokenHash: hashToken(token),
      label: input.label,
      role: input.role,
      permissions:
        input.permissions !== undefined
          ? sanitizePermissions(input.permissions)
          : defaultPermissions(input.role),
      createdBy,
      createdAt: new Date(),
      ...(input.expiresAt ? { expiresAt: new Date(input.expiresAt) } : {}),
    };
    await shareLinks().insertOne(doc);
    return mapShareLink(doc);
  }

  async listLinks(ownerId?: string): Promise<ShareLink[]> {
    const filter = ownerId ? { ownerId } : {};
    const docs = await shareLinks().find(filter).sort({ createdAt: -1 }).toArray();
    return attachOwnerSlug(docs.map(mapShareLink));
  }

  async findByToken(token: string): Promise<ShareLinkDoc | null> {
    const doc = await shareLinks().findOne({ tokenHash: hashToken(token) });
    if (!doc) return null;
    if (doc.expiresAt && doc.expiresAt.getTime() < Date.now()) return null;
    return doc;
  }

  async deleteLink(id: string, ownerId?: string): Promise<boolean> {
    const filter: Record<string, unknown> = { _id: new ObjectId(id) };
    if (ownerId) filter.ownerId = ownerId;
    const result = await shareLinks().deleteOne(filter);
    return result.deletedCount > 0;
  }

  async touch(id: string): Promise<void> {
    await shareLinks().updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastUsedAt: new Date() } },
    );
  }
}
