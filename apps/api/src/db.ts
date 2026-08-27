import { connectDb, migrateOnBoot } from "@repo/shared/db";

export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectAndSeed(): Promise<void> {
  await connectDb();
  await migrateOnBoot();
}
