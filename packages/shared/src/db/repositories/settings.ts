import type { SiteSettings } from "../../types/settings";
import { siteSettings, type SiteSettingsDoc } from "../models";
import { mapSettings } from "../mappers";

export class MongoSettingsRepository {
  async getSettings(ownerId: string): Promise<SiteSettings | null> {
    const doc = await siteSettings().findOne({ ownerId });
    return mapSettings(doc);
  }

  async upsertSettings(ownerId: string, input: SiteSettings): Promise<SiteSettings> {
    const now = new Date();
    const doc: SiteSettingsDoc = { ownerId, ...input, updatedAt: now };
    const result = await siteSettings().findOneAndUpdate(
      { ownerId },
      { $set: doc },
      { returnDocument: "after", upsert: true },
    );
    const saved = result ?? doc;
    return mapSettings(saved)!;
  }
}
