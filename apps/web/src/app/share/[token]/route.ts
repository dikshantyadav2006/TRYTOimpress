import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://trytotry.onrender.com"
    : "http://localhost:8000");
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

interface ShareSessionPayload {
  role: string | null;
  permissions: string[];
  slug?: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  let session: ShareSessionPayload | null = null;
  try {
    const res = await fetch(`${API_URL}/share/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const body = (await res.json()) as { data?: ShareSessionPayload };
      session = body.data ?? null;
    }
  } catch {
    session = null;
  }

  if (!session) {
    return NextResponse.redirect(new URL("/?share=invalid", request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set("share_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  const destination = session.slug ? `/u/${session.slug}?share=ok` : "/?share=ok";
  return NextResponse.redirect(new URL(destination, request.url));
}
