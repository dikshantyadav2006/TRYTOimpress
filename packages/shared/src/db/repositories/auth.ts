import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { ObjectId, type UpdateFilter } from "mongodb";

import type { AdminRole, AdminUser } from "../../types/admin";
import { adminUsers, sessions, type AdminUserDoc, type SessionDoc } from "../models";
import { mapAdminUser } from "../mappers";

export interface AdminUserInput {
  name: string;
  email: string;
  slug: string;
  password: string;
  role?: AdminRole;
}

export class MongoAuthRepository {
  constructor() {
    void Promise.all([
      adminUsers().createIndex({ email: 1 }, { unique: true }),
      adminUsers().createIndex({ slug: 1 }, { unique: true }),
    ]).catch(() => {
      // Index creation is best-effort; uniqueness is also checked in code.
    });
  }

  async createUser(input: AdminUserInput): Promise<AdminUser> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const doc: AdminUserDoc = {
      _id: new ObjectId(),
      name: input.name,
      email: input.email.toLowerCase(),
      slug: input.slug,
      passwordHash,
      role: input.role ?? "editor",
      createdAt: new Date(),
    };
    await adminUsers().insertOne(doc);
    return mapAdminUser(doc);
  }

  async findByEmail(email: string): Promise<(AdminUser & { passwordHash: string }) | null> {
    const doc = await adminUsers().findOne({ email: email.toLowerCase() });
    if (!doc) return null;
    return { ...mapAdminUser(doc), passwordHash: doc.passwordHash };
  }

  async findBySlug(slug: string): Promise<AdminUser | null> {
    const doc = await adminUsers().findOne({ slug });
    return doc ? mapAdminUser(doc) : null;
  }

  async findById(id: string): Promise<AdminUser | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await adminUsers().findOne({ _id: new ObjectId(id) });
    return doc ? mapAdminUser(doc) : null;
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const doc = await adminUsers().findOne({ slug });
    return Boolean(doc) && doc?._id.toString() !== excludeId;
  }

  async verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async listUsers(): Promise<AdminUser[]> {
    const docs = await adminUsers().find().sort({ createdAt: 1 }).toArray();
    return docs.map((doc) => mapAdminUser(doc));
  }

  async countUsers(): Promise<number> {
    return adminUsers().countDocuments();
  }

  async deleteUser(id: string): Promise<boolean> {
    await sessions().deleteMany({ userId: id });
    const result = await adminUsers().deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async updateUser(id: string, input: Partial<Omit<AdminUserInput, "password">>): Promise<AdminUser | null> {
    const patch: UpdateFilter<AdminUserDoc> = { $set: {} };
    for (const key of ["name", "email", "slug", "role"] as const) {
      if (input[key] !== undefined) {
        (patch.$set as Record<string, unknown>)[key] = input[key];
      }
    }
    const doc = await adminUsers().findOneAndUpdate({ _id: new ObjectId(id) }, patch, {
      returnDocument: "after",
    });
    return doc ? mapAdminUser(doc) : null;
  }

  async updatePassword(id: string, password: string): Promise<boolean> {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await adminUsers().updateOne(
      { _id: new ObjectId(id) },
      { $set: { passwordHash } },
    );
    return result.modifiedCount > 0;
  }

  async createSession(userId: string, daysToLive = 30): Promise<{ token: string; expiresAt: string }> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + daysToLive * 24 * 60 * 60 * 1000);
    const doc: SessionDoc = {
      _id: new ObjectId(),
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    await sessions().insertOne(doc);
    return { token, expiresAt: expiresAt.toISOString() };
  }

  async getUserBySessionToken(token: string): Promise<AdminUser | null> {
    const session = await sessions().findOne({ token });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (session) await sessions().deleteOne({ _id: session._id });
      return null;
    }
    const user = await adminUsers().findOne({ _id: new ObjectId(session.userId) });
    return user ? mapAdminUser(user) : null;
  }

  async deleteSession(token: string): Promise<boolean> {
    const result = await sessions().deleteOne({ token });
    return result.deletedCount > 0;
  }
}
