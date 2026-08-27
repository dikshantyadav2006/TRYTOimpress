import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export function getMongoUri(): string {
  return process.env.MONGODB_URI ?? "mongodb://localhost:27017/proposal";
}

export function connectDb(uri?: string): Promise<typeof mongoose> {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri ?? getMongoUri(), {
      serverSelectionTimeoutMS: 5000,
    });
  }
  return connectionPromise;
}

export async function disconnectDb(): Promise<void> {
  if (connectionPromise) {
    await mongoose.disconnect();
    connectionPromise = null;
  }
}
