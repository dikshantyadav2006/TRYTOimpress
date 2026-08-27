import Link from "next/link";

const ADMIN_URL =
  process.env.ADMIN_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://trytotry-admin-web.vercel.app"
    : "http://localhost:3002");

export const dynamic = "force-dynamic";

export default function PlatformHomePage() {
  return (
    <main className="bg-background text-foreground relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden
        className="bg-[radial-gradient(ellipse_50%_42%_at_50%_30%,rgba(244,114,182,0.12),transparent_65%)] pointer-events-none absolute inset-0"
      />
      <div className="relative z-10 flex max-w-2xl flex-col items-center">
        <span className="text-6xl">💝</span>
        <h1 className="mt-8 font-display text-5xl sm:text-7xl">
          Will you be mine?
        </h1>
        <p className="text-white/65 mx-auto mt-6 max-w-md font-serif text-xl italic leading-relaxed sm:text-2xl">
          Build a tiny interactive journey — eighteen little chapters and one very
          big question — to ask someone who matters.
        </p>
        <Link
          href={`${ADMIN_URL}/register`}
          className="group relative mt-12 inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-9 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 ring-inset shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          Create your site
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
        <p className="mt-5 text-xs tracking-wide text-white/35">
          Have a share link? Just open it and it will take you straight to the journey.
        </p>
      </div>
    </main>
  );
}
