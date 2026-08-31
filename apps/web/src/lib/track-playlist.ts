export function trackPlaylist(siteSlug: string, suffix: string): void {
  void fetch(`/api/sites/${encodeURIComponent(siteSlug)}${suffix}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    keepalive: true,
  }).catch(() => {
    // Analytics tracking is best-effort; never block the experience.
  });
}