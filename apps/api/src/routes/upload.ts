import { createHash } from "node:crypto";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import type { FastifyInstance } from "fastify";
import type { MediaResourceType } from "@repo/shared";
import type { ApiRepos } from "../repos";
import { requireEditRole } from "../auth";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".mp4",
  ".webm",
  ".mov",
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const FINGERPRINT_BYTES = 64 * 1024;

function isConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

if (isConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
}

interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  duration?: number;
  resourceType: MediaResourceType;
}

function uploadToCloudinary(buffer: Buffer, mimetype: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith("video/") ? "video" : "auto";
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: "proposal" },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error("cloudinary_upload_failed"));
        resolve({
          url: result.secure_url,
          ...(result.public_id ? { publicId: result.public_id } : {}),
          ...(typeof result.width === "number" ? { width: result.width } : {}),
          ...(typeof result.height === "number" ? { height: result.height } : {}),
          ...(typeof result.duration === "number" ? { duration: result.duration } : {}),
          resourceType:
            result.resource_type === "video" ? "video" : result.resource_type === "raw" ? "raw" : "image",
        });
      },
    );
    stream.end(buffer);
  });
}

export function registerUploadRoutes(app: FastifyInstance, repos: ApiRepos): void {
  app.post("/upload", async (request, reply) => {
    const auth = repos.auth;
    const share = repos.share;
    const access = await requireEditRole(auth, share, request, reply);
    if (!access) return;

    if (!isConfigured()) {
      return reply.code(503).send({ error: "cloudinary_not_configured" });
    }

    const file = await request.file();
    if (!file) {
      return reply.code(400).send({ error: "no_file" });
    }

    const ext = path.extname(file.filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return reply.code(400).send({ error: "unsupported_file_type" });
    }

    const buffer = await file.toBuffer();
    const isVideo = file.mimetype.startsWith("video/");
    const sizeLimit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (buffer.length > sizeLimit) {
      return reply.code(413).send({ error: isVideo ? "video_too_large" : "image_too_large" });
    }

    const fingerprint = createHash("sha1").update(buffer.subarray(0, FINGERPRINT_BYTES)).digest("hex");

    const mediaRepo = repos.media;
    if (mediaRepo) {
      const existing = await mediaRepo.findDuplicate(access.ownerId, {
        originalName: file.filename,
        size: buffer.length,
        mimetype: file.mimetype,
        fingerprint,
      });
      if (existing) {
        return reply.code(201).send({ data: { url: existing.url, duplicate: true } });
      }
    }

    const result = await uploadToCloudinary(buffer, file.mimetype);

    if (mediaRepo) {
      await mediaRepo.create({
        originalName: file.filename,
        size: buffer.length,
        mimetype: file.mimetype,
        url: result.url,
        resourceType: result.resourceType,
        fingerprint,
        ...(result.publicId ? { publicId: result.publicId } : {}),
        ...(result.width !== undefined ? { width: result.width } : {}),
        ...(result.height !== undefined ? { height: result.height } : {}),
        ...(result.duration !== undefined ? { duration: result.duration } : {}),
      }, access.ownerId);
    }

    return reply.code(201).send({ data: { url: result.url } });
  });
}
