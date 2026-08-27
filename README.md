# 💖 Will You Be My Girlfriend?

> *Some things can't be said in a text. So I built you a website.*

A modern, viral, interactive proposal website platform — a love letter,
hand-coded. Anyone can sign up and instantly get their own site under a unique
short slug (`/u/<slug>`); every word, photo, song, and secret lives in MongoDB
and is edited from a private admin dashboard, so the whole story stays *ours*
to rewrite whenever our hearts change. No content is hardcoded. Everything is
made with love — and shipped like it matters.

---

## ✨ Modern little things, made to make you smile

| | |
| --- | --- |
| 🏡 | **Every user gets their own site** — open sign-up, a unique `/u/<slug>`, and content scoped to them alone |
| 🌹 | **Floating petals** drift across the screen while you read |
| 🌌 | **Your own constellation** — a star map that always lands on *us* |
| 💗 | **A live days-together counter** that counts every second since the day we met |
| 💌 | **Open-when… letters** sealed on screen, waiting for the right moment |
| 🎡 | **A surprise-date wheel** that picks our next adventure for us |
| 🎧 | **Our songs** — each with the reason it means something to me |
| 🗺️ | **Eighteen little chapters** that walk from "hi" all the way to the big question |
| 🎆 | **Confetti, fireworks, and a heart that can't be broken** the moment you say yes |
| 🔗 | **Share links** — a per-site invite that lets your partner edit the story too |
| 🛠️ | **A secret control room** where I can edit every word without touching code |

## 📖 Our chapters

Every chapter lives under your site: `/u/<slug>/…`

| Step | Chapter | Route | What it is |
| ---: | --- | --- | --- |
| 1 | The Landing 🏡 | `/u/<slug>` | A hello, a hero, and a heartbeat to pull you in |
| 2 | Our Story 📖 | `/u/<slug>/our-story` | Where we started — with stars and a count of our days |
| 3 | The Gallery 📸 | `/u/<slug>/gallery` | Every smile worth keeping |
| 4 | Why You 🌹 | `/u/<slug>/reasons` | All the reasons my heart chose you |
| 5 | Our Songs 🎧 | `/u/<slug>/songs` | The soundtrack of us |
| 6 | Our Dates 🎡 | `/u/<slug>/dates` | Adventures I'm already planning |
| 7 | Your Turn 💬 | `/u/<slug>/questions` | Questions with answers that matter |
| 8 | Open When… 💌 | `/u/<slug>/letters` | Little letters for hard days and happy ones |
| 9 | The Question 💍 | `/u/<slug>/proposal` | The only question that ever mattered |

…plus ten more: love meter, love jar, compliments, wishes, promises, future
letters, time capsules, scratch cards, surprises, and the love-wrapped recap.
And when she says **yes**, the `yes` page turns the whole internet into confetti.

The root `/` is a platform landing page that points visitors to sign up.

---

## 🛠️ Built with love (and an absurdly good stack)

| What | Why it's here |
| --- | --- |
| **Turborepo** + pnpm workspaces | One monorepo, seven hearts beating together |
| **Next.js 15** (App Router) + React 19 + TypeScript | A site that's fast enough to catch your breath |
| **Tailwind CSS v4** | A rose-gold gradient for every mood |
| **Framer Motion** | Buttons that blush when you touch them |
| **Zustand** | State that never fumbles the music, petals, or hearts |
| **React Hook Form + Zod** | Every "will you?" validated before it's asked |
| **Fastify 5** + **MongoDB** | A resilient heart behind the scenes |
| **ESLint 9** + Prettier + Vitest | Clean code, because love should be, too |

## 📦 The family

| Path | Role in this love story |
| --- | --- |
| `apps/web` | The public site — a platform landing at `/` plus every user's site at `/u/<slug>` |
| `apps/admin-web` | The secret control room (`:3002`) — edit every word, song, photo & letter |
| `apps/api` | The heart (`:8080`) — auth, per-site content, uploads, share links, all the yes's |
| `packages/ui` | Shared components, theme, store & hooks |
| `packages/shared` | Types, mock data, services, Mongo repositories + the seed of all love |
| `packages/config-eslint` / `packages/config-typescript` | The rules that keep us consistent |

---

## 🚀 Make it yours

```bash
pnpm install

# 1. Start the database (it holds all our memories)
docker compose up -d mongo

# 2. Whisper your secrets into the env files
#   apps/api/.env.example        -> MONGODB_URI, CLOUDINARY_*
#   apps/web/.env.example        -> API_URL, ADMIN_URL
#   apps/admin-web/.env.example  -> NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL

# 3. Let it bloom
pnpm dev
#   web:    http://localhost:3000  💖
#   admin:  http://localhost:3002  🔐
#   api:    http://localhost:8080  ⚙️

# 4. Create your account (anyone can join; the very first account becomes `admin`)
#   http://localhost:3002/register
#   your site is live at http://localhost:3000/u/<your-slug>
```

> Only the API ever talks to MongoDB. Without `MONGODB_URI` the API runs in
> mock mode and the control room is locked — the public site needs a running
> API + MongoDB to tell its story. Every user's content is scoped to their own
> `ownerId`; slugs are unique and share links invite a partner to edit a
> specific site.

## 📝 Notes for the lovestruck engineer

- `API_URL` tells `apps/web` where to read its love letters (server-side fetches);
  public content is fetched from `/sites/<slug>/…` routes so the site never
  needs a session.
- `NEXT_PUBLIC_SITE_URL` in `apps/admin-web` builds "view your page" and
  share-link URLs; `ADMIN_URL` in `apps/web` points the platform landing at the
  admin register page.
- Uploads go to **Cloudinary** (`CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` /
  `CLOUDINARY_API_SECRET`). `POST /upload` accepts images + video and returns a
  direct URL that pages render as-is — no files live on disk.
- On API boot, `migrateOnBoot` backfills `ownerId`/slugs on existing data and
  seeds the first user's site with the 19-page template; every new registration
  gets the same template via `seedSite`. After that, everything is edited in the
  admin dashboard and stored in MongoDB per owner.
- Registration is open: any user can join, and each gets a unique short slug
  (auto-generated from their name). Only `admin` can edit users/slugs and
  generate share links for other sites.
- **Share links** (`/share/<token>`) give your partner the same editing access
  to *your* site — the invite is scoped to one site, not the whole dashboard.
- Set the **day we started dating** under *Settings → Our love* and the days
  counter and your constellation light up across the Our Story chapter.

## ✅ Keeping it healthy

```bash
pnpm check   # typecheck + lint + test + build (per package)
```

> On Windows, run `$env:NODE_OPTIONS="--max-old-space-size=4096"` before
> typecheck if you hit Node heap limits — even hearts need room to grow.

## 🧠 How it all beats

- **Data flow**: every page reads its content from the API scoped to a site
  slug (settings, memories, gallery, questions, reasons, songs, dates, letters,
  pages) via `/sites/<slug>/…`; only `apps/api` touches MongoDB via
  `@repo/shared/db` repositories.
- **Admin auth**: cookie session (`admin_session`), bcrypt hashes, open
  registration where the first user becomes `admin`; every user owns a site
  (`/u/<slug>`) and edits only their own content.
- **Uploads**: multipart upload to Cloudinary (images + video), direct URLs
  returned and rendered with no local file storage.
- **Custom pages**: seeded chapters plus arbitrary pages with heading/paragraph/
  image blocks and CTA links, rendered at `/u/<slug>/pages/[pageSlug]` (404 when
  unpublished).
- **Share links**: partner edit-invites per site, resolved from
  `/share/<token>` (which redirects to `/u/<slug>?share=ok`).

---

<p align="center">
  <b>Built with 💗, a little nervousness, and the hope you'll say yes.</b><br/>
  <sub>every commit was written thinking of you</sub>
</p>
