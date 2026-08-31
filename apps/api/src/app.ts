import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";

import { healthRoutes } from "./routes/health";
import { registerAuthRoutes } from "./routes/auth";
import { registerContentRoutes } from "./routes/content";
import { registerQuestionRoutes } from "./routes/questions";
import { registerSettingsRoutes } from "./routes/settings";
import { registerPageRoutes } from "./routes/pages";
import { registerUserRoutes } from "./routes/users";
import { registerUploadRoutes } from "./routes/upload";
import { registerProposalRoutes } from "./routes/proposals";
import { registerSongRoutes } from "./routes/songs";
import { registerPlaylistRoutes } from "./routes/playlists";
import { registerReasonRoutes } from "./routes/reasons";
import { registerDateRoutes } from "./routes/dates";
import { registerLetterRoutes } from "./routes/letters";
import { registerLoveNoteRoutes } from "./routes/notes";
import { registerComplimentRoutes } from "./routes/compliments";
import { registerWishRoutes } from "./routes/wishes";
import { registerLovePromiseRoutes } from "./routes/promises";
import { registerDreamRoutes } from "./routes/dreams";
import { registerCapsuleRoutes } from "./routes/capsules";
import { registerSurpriseRoutes } from "./routes/surprises";
import { registerShareRoutes } from "./routes/share";
import { registerSiteRoutes } from "./routes/sites";
import { createRepos } from "./repos";

export function buildApp() {
  const app = Fastify({ logger: true });

  const repos = createRepos();

  void app.register(cors, {
    origin: true,
    credentials: true,
  });

  void app.register(cookie);
  void app.register(multipart, {
    limits: { files: 1, fileSize: 100 * 1024 * 1024 },
  });

  void app.register(healthRoutes);
  void app.register(async (instance) => {
    registerAuthRoutes(instance, repos);
    registerContentRoutes(instance, repos);
    registerQuestionRoutes(instance, repos);
    registerSettingsRoutes(instance, repos);
    registerPageRoutes(instance, repos);
    registerUserRoutes(instance, repos);
    registerUploadRoutes(instance, repos);
    registerProposalRoutes(instance, repos);
    registerSongRoutes(instance, repos);
    registerPlaylistRoutes(instance, repos);
    registerReasonRoutes(instance, repos);
    registerDateRoutes(instance, repos);
    registerLetterRoutes(instance, repos);
    registerLoveNoteRoutes(instance, repos);
    registerComplimentRoutes(instance, repos);
    registerWishRoutes(instance, repos);
    registerLovePromiseRoutes(instance, repos);
    registerDreamRoutes(instance, repos);
    registerCapsuleRoutes(instance, repos);
    registerSurpriseRoutes(instance, repos);
    registerShareRoutes(instance, repos);
    registerSiteRoutes(instance, repos);
  });

  return app;
}
