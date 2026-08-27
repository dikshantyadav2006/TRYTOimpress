export interface SitePageProps {
  params: Promise<{ slug: string }>;
}

export interface SiteContentPageProps {
  params: Promise<{ slug: string; pageSlug: string }>;
}

export function siteHref(slug: string, href: string): string {
  if (
    href.startsWith("/u/") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("#") ||
    href.startsWith("/api/")
  ) {
    return href;
  }
  return `/u/${slug}${href === "/" ? "" : href}`;
}
