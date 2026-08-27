const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,62}[a-z0-9])?$/;
const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function validateSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function generateSiteSlug(length = 6): string {
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += SLUG_ALPHABET[Math.floor(Math.random() * SLUG_ALPHABET.length)];
  }
  return slug;
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
