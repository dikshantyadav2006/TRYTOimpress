import "dotenv/config";

import { buildApp } from "./app";
import { connectAndSeed, isDbConfigured } from "./db";

const port = Number(process.env.PORT ?? 8000);
const host = process.env.HOST ?? "0.0.0.0";

const app = buildApp();

async function main(): Promise<void> {
  try {
    if (isDbConfigured()) {
      await connectAndSeed();
      app.log.info("Connected to MongoDB and seeded.");
    } else {
      app.log.warn("MONGODB_URI not set — running with in-memory mock repositories.");
    }
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
